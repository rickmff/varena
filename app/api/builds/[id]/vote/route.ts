import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/better-auth/server";
import prisma from "@/lib/prisma";
import { rateLimit, getRequestIdentifier, getRateLimitHeaders } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Rate limit: 30 votes per minute per user
const VOTE_RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30,
};

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

    // Apply rate limiting
    const identifier = `vote:${session.user.id}`;
    const rateLimitResult = await rateLimit(identifier, VOTE_RATE_LIMIT);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many vote requests. Please slow down." },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const { id: buildId } = await params;
    const { voteType } = await request.json();

    if (!voteType || !["upvote", "downvote", "remove"].includes(voteType)) {
      return NextResponse.json(
        { error: "Invalid voteType. Must be 'upvote', 'downvote', or 'remove'" },
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
      if (!('buildVote' in prisma) || !prisma.buildVote) {
        return NextResponse.json(
          { error: "Vote system not initialized. Please restart the server." },
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes("buildVote") ||
        errorMessage.includes("BuildVote") ||
        errorMessage.includes("does not exist")
      ) {
        return NextResponse.json(
          { error: "Vote system not initialized. Please run migrations." },
          { status: 503 }
        );
      }
      throw error;
    }

    // Handle vote logic
    let upvoteDelta = 0;
    let downvoteDelta = 0;
    let userVote: "upvote" | "downvote" | null = null;

    if (voteType === "remove") {
      if (existingVote) {
        if (existingVote.voteType === "upvote") {
          upvoteDelta = -1;
        } else {
          downvoteDelta = -1;
        }
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
      if (existingVote) {
        if (existingVote.voteType === voteType) {
          // Same vote type - toggle off
          if (voteType === "upvote") {
            upvoteDelta = -1;
          } else {
            downvoteDelta = -1;
          }
          await prisma.buildVote.delete({
            where: {
              buildId_userId: {
                buildId,
                userId: session.user.id,
              },
            },
          });
        } else {
          // Different vote type - change it
          if (existingVote.voteType === "upvote") {
            upvoteDelta = -1;
            downvoteDelta = 1;
          } else {
            upvoteDelta = 1;
            downvoteDelta = -1;
          }
          await prisma.buildVote.update({
            where: {
              buildId_userId: {
                buildId,
                userId: session.user.id,
              },
            },
            data: { voteType },
          });
          userVote = voteType as "upvote" | "downvote";
        }
      } else {
        // New vote
        if (voteType === "upvote") {
          upvoteDelta = 1;
        } else {
          downvoteDelta = 1;
        }
        await prisma.buildVote.create({
          data: {
            buildId,
            userId: session.user.id,
            voteType,
          },
        });
        userVote = voteType as "upvote" | "downvote";
      }
    }

    // Update denormalized counts
    let updatedBuild;
    try {
      updatedBuild = await prisma.build.update({
        where: { id: buildId },
        data: {
          upvotes: { increment: upvoteDelta },
          downvotes: { increment: downvoteDelta },
        },
        select: {
          id: true,
          upvotes: true,
          downvotes: true,
        },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes("upvotes") ||
        errorMessage.includes("downvotes")
      ) {
        return NextResponse.json(
          { error: "Vote system not initialized. Please run migrations." },
          { status: 503 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      upvotes: updatedBuild.upvotes,
      downvotes: updatedBuild.downvotes,
      userVote,
    });
  } catch (error) {
    logger.error("Error handling vote", error);
    return NextResponse.json(
      { error: "Error processing vote" },
      { status: 500 }
    );
  }
}
