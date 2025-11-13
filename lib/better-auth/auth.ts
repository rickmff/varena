import { betterAuth } from "better-auth";
import { createPool } from "mysql2/promise";
import prisma from "../prisma";

// Parse DATABASE_URL para criar pool MySQL
function parseDatabaseUrl(url: string) {
  try {
    // Parse URL - precisa decodificar manualmente a senha
    const parsedUrl = new URL(url);

    return {
      host: parsedUrl.hostname,
      port: parseInt(parsedUrl.port) || 3306,
      user: decodeURIComponent(parsedUrl.username),
      password: decodeURIComponent(parsedUrl.password), // Decodificar manualmente
      database: parsedUrl.pathname.slice(1), // Remove leading slash
    };
  } catch (error) {
    console.error("Erro ao fazer parse da DATABASE_URL:", error);
    console.error("URL recebida:", url?.substring(0, 50) + "...");
    throw new Error("Invalid DATABASE_URL format");
  }
}

// Criar pool MySQL para Better Auth
let pool;
try {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não está definida");
  }

  const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL);

  // Log config (without password) for debugging
  console.log("[Better Auth] Database config:", {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database,
    passwordLength: dbConfig.password?.length || 0,
  });

  pool = createPool({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });

  // Test connection
  pool.getConnection()
    .then((connection) => {
      console.log("✅ MySQL connection established successfully");
      connection.release();
    })
    .catch((error) => {
      console.error("❌ Error connecting to MySQL:", error.message);
    });
} catch (error) {
  console.error("Error creating MySQL pool:", error);
  throw error;
}

export const auth = betterAuth({
  database: pool,
  logger: {
    level: process.env.NODE_ENV === "development" ? "debug" : "error",
    log: (level, message, ...args) => {
      // Always log errors, debug logs only in development
      if (level === "error" || process.env.NODE_ENV === "development") {
        console.log(`[Better Auth ${level}]`, message, ...args);
      }
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Email verification disabled - users can sign in immediately
  },
  trustedOrigins: [
    process.env.NEXTAUTH_URL || "http://localhost:3000",
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ].filter(Boolean),
  baseURL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  basePath: "/api/auth",
  // Note: Better Auth manages secure cookies automatically in production (HTTPS)
  // Cookies are configured with httpOnly, secure (on HTTPS), and sameSite by default
  // @ts-ignore - Better Auth hooks structure may differ
  hooks: {
    // @ts-ignore
    user: {
      created: async ({ user }: { user: any }) => {
        // Sync with Prisma User model
        try {
          console.log("[Better Auth Hook] Syncing user to Prisma:", user.email);
          await prisma.user.upsert({
            where: { email: user.email },
            update: {
              emailVerified: user.emailVerified ? new Date() : null,
              name: user.name || null,
              image: user.image || null,
            },
            create: {
              id: user.id,
              email: user.email,
              name: user.name || null,
              image: user.image || null,
              emailVerified: user.emailVerified ? new Date() : null,
              password: null, // Password is managed by Better Auth
            },
          });
          console.log("[Better Auth Hook] User synced successfully");
        } catch (error) {
          console.error("[Better Auth Hook] Error syncing user with Prisma:", error);
          // Don't throw - allow user creation in Better Auth even if Prisma sync fails
          // This prevents the signup from failing if there's a Prisma issue
        }
      },
      updated: async ({ user }: { user: any }) => {
        // Update Prisma User model when user is updated
        try {
          await prisma.user.update({
            where: { email: user.email },
            data: {
              emailVerified: user.emailVerified ? new Date() : null,
              name: user.name || null,
              image: user.image || null,
            },
          });
        } catch (error) {
          console.error("[Better Auth Hook] Error updating user in Prisma:", error);
          // Don't throw - allow update to continue even if Prisma sync fails
        }
      },
    },
  },
});

