import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/better-auth/server";
import prisma from "@/lib/prisma";
import { createPool } from "mysql2/promise";
import { revalidateTag } from "next/cache";

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
  } catch (error) {
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

    const { name } = await request.json();

    // Validate name
    if (name === undefined || name === null) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Trim whitespace
    const trimmedName = typeof name === "string" ? name.trim() : "";

    // Allow empty string to clear name, but validate length if provided
    if (trimmedName.length > 100) {
      return NextResponse.json(
        { error: "Name must be 100 characters or less" },
        { status: 400 }
      );
    }

    // Get current user to check old name
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email || "" },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // If name is being changed (not empty and different from current), check if it already exists
    if (trimmedName && trimmedName !== (currentUser?.name || "")) {
      const existingUser = await prisma.user.findFirst({
        where: {
          name: trimmedName,
          id: { not: session.user.id }, // Exclude current user
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "This name is already taken. Please choose a different name." },
          { status: 400 }
        );
      }
    }

    const oldName = currentUser?.name || null;

    // Use upsert to handle case where user might not exist in Prisma yet
    // Find by email (source of truth) and update or create as needed
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

    // Update all builds where author matches the old name and userId matches current user
    if (oldName && trimmedName && oldName !== trimmedName) {
      await prisma.build.updateMany({
        where: {
          userId: session.user.id,
          author: oldName,
        },
        data: {
          author: trimmedName,
        },
      });

      // Invalidate public builds cache so author names update immediately
      revalidateTag("public-builds");
    }

    // Also update Better Auth user table directly (if it exists separately)
    // Better Auth may use a lowercase 'user' table separate from Prisma's 'User' table
    try {
      const pool = getBetterAuthPool();
      await pool.execute(
        "UPDATE `user` SET name = ? WHERE id = ?",
        [trimmedName || null, session.user.id]
      );
    } catch (error: any) {
      // If the Better Auth 'user' table doesn't exist or has a different name, log but continue
      // This is not critical since Prisma is updated and the session will refresh
      if (error.code !== 'ER_NO_SUCH_TABLE' && error.code !== '42S02') {
        console.error("[Profile API] Error updating Better Auth user table:", error);
      }
      // Don't fail the request if Better Auth update fails - Prisma is the source of truth
    }

    return NextResponse.json({
      success: true,
      user: {
        name: updatedPrismaUser.name,
      },
    });
  } catch (error: any) {
    console.error("[Profile API] Error updating name:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update name" },
      { status: 500 }
    );
  }
}

