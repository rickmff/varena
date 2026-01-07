import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/better-auth/server";
import prisma from "@/lib/prisma";
import { createPool } from "mysql2/promise";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

// Rate limit: 10 name changes per hour
const PROFILE_RATE_LIMIT = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
};

// Parse DATABASE_URL to create MySQL pool for Better Auth
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
  } catch {
    throw new Error("Invalid DATABASE_URL format");
  }
}

// Create pool for Better Auth database access
const getBetterAuthPool = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }
  const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL);
  return createPool({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    connectionLimit: 10,
  });
};

export async function PUT(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Apply rate limiting
    const identifier = `profile:${session.user.id}`;
    const rateLimitResult = await rateLimit(identifier, PROFILE_RATE_LIMIT);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many profile updates. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const { name } = await request.json();

    // Validate name
    if (name === undefined || name === null) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const trimmedName = typeof name === "string" ? name.trim() : "";

    if (trimmedName.length > 100) {
      return NextResponse.json(
        { error: "Name must be 100 characters or less" },
        { status: 400 }
      );
    }

    // Update Prisma user
    const updatedPrismaUser = await prisma.user.upsert({
      where: { email: session.user.email || "" },
      update: {
        name: trimmedName || null,
      },
      create: {
        id: session.user.id,
        email: session.user.email || "",
        name: trimmedName || null,
        image: session.user.image || null,
        emailVerified: session.user.emailVerified ? new Date() : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // Also update Better Auth user table
    try {
      const pool = getBetterAuthPool();
      await pool.execute(
        "UPDATE `user` SET name = ? WHERE id = ?",
        [trimmedName || null, session.user.id]
      );
    } catch (error: unknown) {
      const errorCode = (error as { code?: string })?.code;
      if (errorCode !== 'ER_NO_SUCH_TABLE' && errorCode !== '42S02') {
        logger.error("Error updating Better Auth user table", error);
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        name: updatedPrismaUser.name,
      },
    });
  } catch (error) {
    logger.error("Error updating profile name", error);
    return NextResponse.json(
      { error: "Failed to update name" },
      { status: 500 }
    );
  }
}
