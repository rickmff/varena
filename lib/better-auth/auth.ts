import { betterAuth } from "better-auth";
import { createPool } from "mysql2/promise";
import prisma from "../prisma";
import { Resend } from "resend";
import { logger } from "../logger";

// Parse DATABASE_URL to create MySQL pool
function parseDatabaseUrl(url: string) {
  try {
    const parsedUrl = new URL(url);

    return {
      host: parsedUrl.hostname,
      port: parseInt(parsedUrl.port) || 3306,
      user: decodeURIComponent(parsedUrl.username),
      password: decodeURIComponent(parsedUrl.password),
      database: parsedUrl.pathname.slice(1),
    };
  } catch (error) {
    logger.error("Failed to parse DATABASE_URL", error);
    throw new Error("Invalid DATABASE_URL format");
  }
}

// Create MySQL pool for Better Auth
let pool;
try {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL);

  logger.debug("Database config", {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database,
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
      logger.info("MySQL connection established successfully");
      connection.release();
    })
    .catch((error) => {
      logger.error("Error connecting to MySQL", error);
    });
} catch (error) {
  logger.error("Error creating MySQL pool", error);
  throw error;
}

// Initialize Resend client for email sending
const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  logger.warn("RESEND_API_KEY is not set. Email verification will not work.");
}
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const auth = betterAuth({
  database: pool,
  logger: {
    level: process.env.NODE_ENV === "development" ? "debug" : "error",
    log: (level, message, ...args) => {
      if (level === "error") {
        logger.error(`[Better Auth] ${message}`, args[0]);
      } else if (process.env.NODE_ENV === "development") {
        logger.debug(`[Better Auth] ${message}`, { args });
      }
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      if (!resend) {
        const errorMsg = "Resend API key is not configured. Please set RESEND_API_KEY in your .env file.";
        logger.error(errorMsg);
        throw new Error(errorMsg);
      }

      const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

      // Extract token from Better Auth URL and generate a link to our custom page
      let customUrl = url;
      try {
        const urlObj = new URL(url);
        const segments = urlObj.pathname.split("/").filter(Boolean);
        const tokenFromPath = segments[segments.length - 1];

        if (tokenFromPath && tokenFromPath !== "reset-password") {
          const baseURL =
            process.env.NEXTAUTH_URL ||
            process.env.NEXT_PUBLIC_APP_URL ||
            "http://localhost:3000";
          customUrl = `${baseURL}/auth/reset/${encodeURIComponent(tokenFromPath)}`;
          logger.debug("Custom reset URL generated", { tokenLength: tokenFromPath.length });
        } else {
          logger.warn("Could not extract token from URL path, using original URL");
        }
      } catch (error) {
        logger.warn("Could not parse reset URL, using original", { error });
      }

      try {
        const result = await resend.emails.send({
          from: fromEmail,
          to: user.email,
          subject: "Reset your password",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333;">Reset your password</h1>
              <p style="color: #666; line-height: 1.6;">
                Hi ${user.name || "there"},
              </p>
              <p style="color: #666; line-height: 1.6;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${customUrl}" style="background-color: #5865F2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                  Reset Password
                </a>
              </div>
              <p style="color: #666; line-height: 1.6; font-size: 14px;">
                Or copy and paste this link into your browser:
              </p>
              <p style="color: #666; line-height: 1.6; font-size: 14px; word-break: break-all;">
                ${customUrl}
              </p>
              <p style="color: #666; line-height: 1.6; font-size: 14px; margin-top: 30px;">
                This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
              </p>
            </div>
          `,
          text: `Hi ${user.name || "there"},\n\nWe received a request to reset your password. Click this link to create a new password:\n\n${customUrl}\n\nThis link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.`,
        });

        logger.auth("Password reset email sent", { to: user.email, resendId: result.data?.id });
      } catch (error) {
        logger.error("Error sending password reset email", error);
        throw error;
      }
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      if (!resend) {
        const errorMsg = "Resend API key is not configured. Please set RESEND_API_KEY in your .env file.";
        logger.error(errorMsg);
        throw new Error(errorMsg);
      }

      const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
      const isTestEmail = fromEmail === "onboarding@resend.dev";

      if (process.env.NODE_ENV === "development" && isTestEmail) {
        logger.warn("Using onboarding@resend.dev - Resend only allows sending to your account email");
      }

      try {
        const result = await resend.emails.send({
          from: fromEmail,
          to: user.email,
          subject: "Verify your email address",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333;">Verify your email address</h1>
              <p style="color: #666; line-height: 1.6;">
                Hi ${user.name || "there"},
              </p>
              <p style="color: #666; line-height: 1.6;">
                Thank you for signing up! Please verify your email address by clicking the button below:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${url}" style="background-color: #5865F2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                  Verify Email Address
                </a>
              </div>
              <p style="color: #666; line-height: 1.6; font-size: 14px;">
                Or copy and paste this link into your browser:
              </p>
              <p style="color: #666; line-height: 1.6; font-size: 14px; word-break: break-all;">
                ${url}
              </p>
              <p style="color: #666; line-height: 1.6; font-size: 14px; margin-top: 30px;">
                If you didn't create an account, you can safely ignore this email.
              </p>
            </div>
          `,
          text: `Hi ${user.name || "there"},\n\nThank you for signing up! Please verify your email address by clicking this link:\n\n${url}\n\nIf you didn't create an account, you can safely ignore this email.`,
        });

        logger.auth("Verification email sent", { to: user.email, resendId: result.data?.id });
      } catch (error) {
        logger.error("Error sending verification email", error);
        throw error;
      }
    },
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },
  trustedOrigins: [
    process.env.NEXTAUTH_URL || "http://localhost:3000",
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ].filter(Boolean),
  baseURL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  basePath: "/api/auth",
  hooks: {
    // @ts-ignore
    user: {
      created: async ({ user }: { user: any }) => {
        try {
          logger.auth("Syncing user to Prisma", { email: user.email });
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
              password: null,
            },
          });
          logger.auth("User synced successfully", { email: user.email });
        } catch (error) {
          logger.error("Error syncing user with Prisma", error);
        }
      },
      updated: async ({ user }: { user: any }) => {
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
          logger.error("Error updating user in Prisma", error);
        }
      },
    },
  },
});
