import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/better-auth/server";
import prisma from "@/lib/prisma";

// Create a new build
export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name, description, code, author, authorTwitchUrl, authorYoutubeUrl } = await request.json();

    // Only name and code are required
    if (!name || !code) {
      return NextResponse.json(
        { error: "Required fields: name, code" },
        { status: 400 }
      );
    }

    // Ensure user exists in Prisma (sync with Better Auth)
    // This handles cases where the user was created in Better Auth but sync hook failed
    if (!session.user.email) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    // Check if user exists by email (source of truth)
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    // If user exists but with different ID, migrate builds and update
    if (user && user.id !== session.user.id) {
      // Migrate all builds from old user ID to new user ID
      await prisma.build.updateMany({
        where: { userId: user.id },
        data: { userId: session.user.id },
      });

      // Migrate accounts and sessions if they exist
      await prisma.account.updateMany({
        where: { userId: user.id },
        data: { userId: session.user.id },
      });

      await prisma.session.updateMany({
        where: { userId: user.id },
        data: { userId: session.user.id },
      });

      // Delete the old user record
      await prisma.user.delete({
        where: { id: user.id },
      });

      // Create new user with correct ID
      user = await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name || null,
          image: session.user.image || null,
          emailVerified: session.user.emailVerified ? new Date() : null,
        },
      });
    } else if (user) {
      // User exists with correct ID, just update
      user = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: session.user.name || null,
          image: session.user.image || null,
          emailVerified: session.user.emailVerified ? new Date() : null,
        },
      });
    } else {
      // User doesn't exist, create it
      user = await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name || null,
          image: session.user.image || null,
          emailVerified: session.user.emailVerified ? new Date() : null,
        },
      });
    }

    const userIdToUse = user.id;

    // Derive author from session user if not provided
    const buildAuthor = author || session.user.name || session.user.email || "Anonymous";
    const buildDescription = description || "";

    // Check if a build with the same name already exists for this user
    const existingBuild = await prisma.build.findFirst({
      where: {
        name,
        userId: userIdToUse,
      },
    });

    if (existingBuild) {
      return NextResponse.json(
        { error: "A build with this name already exists" },
        { status: 400 }
      );
    }

    const build = await prisma.build.create({
      data: {
        name,
        description: buildDescription,
        code,
        author: buildAuthor,
        authorTwitchUrl: authorTwitchUrl || null,
        authorYoutubeUrl: authorYoutubeUrl || null,
        userId: userIdToUse,
      },
    });

    return NextResponse.json(build, { status: 201 });
  } catch (error: any) {
    console.error("Error creating build:", error);
    // Return more detailed error in development
    const errorMessage = process.env.NODE_ENV === "development"
      ? error?.message || String(error)
      : "Error creating build";

    return NextResponse.json(
      { error: errorMessage, details: process.env.NODE_ENV === "development" ? error : undefined },
      { status: 500 }
    );
  }
}

// List user builds
export async function GET(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const builds = await prisma.build.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(builds);
  } catch (error: any) {
    console.error("Error fetching builds:", error);
    return NextResponse.json(
      { error: "Error fetching builds" },
      { status: 500 }
    );
  }
}





