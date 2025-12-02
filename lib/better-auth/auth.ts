import { betterAuth } from "better-auth";
import { createPool } from "mysql2/promise";
import prisma from "../prisma";
import { Resend } from "resend";

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

// Initialize Resend client for email sending
const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  console.warn("⚠️  RESEND_API_KEY is not set. Email verification emails will be disabled.");
}
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const emailVerificationConfigured = !!resend;

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
    // Only require email verification when the email service is configured
    requireEmailVerification: emailVerificationConfigured,
    sendResetPassword: async ({ user, url }) => {
      if (!resend) {
        const errorMsg =
          "Resend API key is not configured. Password reset email cannot be sent.";
        console.error("[Better Auth] ❌", errorMsg);
        throw new Error(errorMsg);
      }

      const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

      // Extract token from Better Auth URL and generate a link to our custom page
      // Default format: http://localhost:3000/api/auth/reset-password/<token>?callbackURL=...
      let customUrl = url;
      try {
        const urlObj = new URL(url);
        const segments = urlObj.pathname.split("/").filter(Boolean);
        // ... /api/auth/reset-password/:token
        const tokenFromPath = segments[segments.length - 1];

        if (tokenFromPath && tokenFromPath !== "reset-password") {
          const baseURL =
            process.env.NEXTAUTH_URL ||
            process.env.NEXT_PUBLIC_APP_URL ||
            "http://localhost:3000";
          customUrl = `${baseURL}/auth/reset/${encodeURIComponent(tokenFromPath)}`;
          console.log("[Better Auth] Custom reset URL:", {
            original: url,
            tokenLength: tokenFromPath.length,
            customUrl,
          });
        } else {
          console.warn("[Better Auth] Could not extract token from URL path, using original URL");
        }
      } catch (error) {
        console.warn("[Better Auth] Could not parse reset URL, using original:", error);
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

        console.log("✅ [Better Auth] Password reset email sent successfully");
        console.log("   To:", user.email);
        console.log("   Resend ID:", result.data?.id || "N/A");
        console.log("   🔗 Original URL:", url);
        console.log("   🔗 Custom Reset URL:", customUrl);
      } catch (error: any) {
        console.error("❌ [Better Auth] Error sending password reset email:");
        console.error("   Error:", error.message || error);
        throw error;
      }
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      if (!resend) {
        const errorMsg =
          "Resend API key is not configured. Skipping verification email send.";
        console.warn("[Better Auth] ⚠️", errorMsg);
        // In development/local without email service, allow signup to succeed even without email
        return;
      }

      const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
      const isTestEmail = fromEmail === "onboarding@resend.dev";

      // In development, warn about Resend test email limitations
      if (process.env.NODE_ENV === "development" && isTestEmail) {
        console.warn("⚠️  [Better Auth] Using onboarding@resend.dev - Resend only allows sending to your account email.");
        console.warn("   For testing with other emails, either:");
        console.warn("   1. Send to your Resend account email (check Resend dashboard)");
        console.warn("   2. Verify a domain at https://resend.com/domains");
        console.warn("   3. Use a service like Mailtrap for local testing");
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

        console.log("✅ [Better Auth] Verification email sent successfully");
        console.log("   To:", user.email);
        console.log("   Resend ID:", result.data?.id || "N/A");
        console.log("   🔗 Verification URL:", url);
      } catch (error: any) {
        console.error("❌ [Better Auth] Error sending verification email:");
        console.error("   Error:", error.message || error);

        // Provide helpful error messages for common issues
        if (error.message?.includes("validation_error") || error.message?.includes("testing emails")) {
          console.error("\n   🔧 Resend Test Email Limitation:");
          console.error("   When using onboarding@resend.dev, you can only send to your Resend account email.");
          console.error("   Solutions:");
          console.error("   1. Send test emails to your Resend account email (check Resend dashboard)");
          console.error("   2. Verify a domain at https://resend.com/domains to send to any email");
          console.error("   3. For local testing, use Mailtrap or similar service");
          console.error("   4. Check your Resend account email at: https://resend.com/settings");
        } else if (error.message?.includes("403") || error.status === 403) {
          console.error("\n   🔧 Troubleshooting 403 Error:");
          console.error("   1. Check your RESEND_API_KEY in .env file");
          console.error("   2. Verify the API key is correct at: https://resend.com/api-keys");
          console.error("   3. Make sure the API key starts with 're_'");
          console.error("   4. Check if your Resend account has available credits");
          console.error("   5. Verify the 'from' email domain is verified (or use onboarding@resend.dev)");
        } else if (error.message?.includes("Invalid API key") || error.message?.includes("401")) {
          console.error("\n   🔧 Troubleshooting Invalid API Key:");
          console.error("   1. Get a new API key from: https://resend.com/api-keys");
          console.error("   2. Make sure it starts with 're_'");
          console.error("   3. Restart your dev server after updating .env");
        }

        throw error;
      }
    },
    // Only send verification emails when email service is configured
    sendOnSignUp: emailVerificationConfigured,
    sendOnSignIn: emailVerificationConfigured,
    autoSignInAfterVerification: true, // Automatically sign in user after email verification
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

