import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/better-auth/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Handle upvote/downvote/remove vote
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: buildId } = await params;
    const { voteType } = await request.json(); // "upvote", "downvote", or "remove"

    if (!voteType || !["upvote", "remove"].includes(voteType)) {
      return NextResponse.json(
        { error: "Invalid voteType. Must be 'upvote' or 'remove'" },
        { status: 400 }
      );
    }

    // Verify build exists
    const build = await prisma.build.findUnique({
      where: { id: buildId },
    });

    if (!build) {
      return NextResponse.json(
        { error: "Build not found" },
        { status: 404 }
      );
    }

    // Check for existing vote
    let existingVote = null;
    try {
      // Check if BuildVote model exists (Prisma client needs to be regenerated)
      if (!('buildVote' in prisma) || !prisma.buildVote) {
        return NextResponse.json(
          { error: "Vote system not initialized. Please restart the dev server after running 'npx prisma generate'." },
          { status: 503 }
        );
      }

      existingVote = await prisma.buildVote.findUnique({
        where: {
          buildId_userId: {
            buildId,
            userId: session.user.id,
          },
        },
      });
    } catch (error: any) {
      // If BuildVote model doesn't exist or table doesn't exist
      const errorMessage = error.message || error.toString() || "";
      if (
        errorMessage.includes("Cannot read properties of undefined") ||
        errorMessage.includes("buildVote") ||
        errorMessage.includes("BuildVote") ||
        errorMessage.includes("does not exist") ||
        error.code === "P2001" ||
        error.code === "P2025"
      ) {
        return NextResponse.json(
          { error: "Vote system not initialized. Please run 'npx prisma generate' and restart the dev server, then run 'npx prisma migrate deploy'." },
          { status: 503 }
        );
      }
      throw error;
    }

    // Handle vote logic
    let upvoteDelta = 0;
    let userVote: "upvote" | null = null;

    if (voteType === "remove") {
      // Remove existing upvote
      if (existingVote) {
        upvoteDelta = -1;
        await prisma.buildVote.delete({
          where: {
            buildId_userId: {
              buildId,
              userId: session.user.id,
            },
          },
        });
      }
    } else {
      // Add or toggle off upvote
      if (existingVote) {
        // Already upvoted - toggle off
        upvoteDelta = -1;
        await prisma.buildVote.delete({
          where: {
            buildId_userId: {
              buildId,
              userId: session.user.id,
            },
          },
        });
      } else {
        // New upvote
        upvoteDelta = 1;
        await prisma.buildVote.create({
          data: {
            buildId,
            userId: session.user.id,
            voteType: "upvote",
          },
        });
        userVote = "upvote";
      }
    }

    // Update denormalized upvote count on Build
    let updatedBuild;
    try {
      updatedBuild = await prisma.build.update({
        where: { id: buildId },
        data: {
          upvotes: {
            increment: upvoteDelta,
          },
        },
        select: {
          id: true,
          upvotes: true,
        },
      });
    } catch (error: any) {
      // If upvotes column doesn't exist, return error
      const errorMessage = error.message || error.toString() || "";
      if (
        errorMessage.includes("upvotes") ||
        errorMessage.includes("Unknown column") ||
        error.code === "P2009"
      ) {
        return NextResponse.json(
          { error: "Vote system not initialized. Please run database migration: npx prisma migrate deploy" },
          { status: 503 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      upvotes: updatedBuild.upvotes,
      userVote,
    });
  } catch (error: any) {
    console.error("Error handling vote:", error);
    return NextResponse.json(
      { error: "Error processing vote", details: error.message },
      { status: 500 }
    );
  }
}

