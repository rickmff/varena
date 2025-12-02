import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/better-auth/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST - Vote on a tier list
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id: tierListId } = await params;

    let session: any = null;
    try {
      session = await getServerSession();
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to get session" },
        { status: 401 }
      );
    }

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const body = await request.json();
    const { voteType } = body as {
      voteType: "upvote" | "downvote" | "remove";
    };

    if (!["upvote", "downvote", "remove"].includes(voteType)) {
      return NextResponse.json(
        { error: "Invalid vote type" },
        { status: 400 }
      );
    }

    // Check if tier list exists and is public
    const tierList = await prisma.spellTierList.findUnique({
      where: { id: tierListId },
    });

    if (!tierList) {
      return NextResponse.json(
        { error: "Tier list not found" },
        { status: 404 }
      );
    }

    if (!tierList.isPublic) {
      return NextResponse.json(
        { error: "Cannot vote on private tier lists" },
        { status: 403 }
      );
    }

    // Cannot vote on your own tier list
    if (tierList.userId === userId) {
      return NextResponse.json(
        { error: "Cannot vote on your own tier list" },
        { status: 403 }
      );
    }

    // Get existing vote
    const existingVote = await prisma.spellTierListVote.findUnique({
      where: {
        tierListId_userId: {
          tierListId,
          userId,
        },
      },
    });

    let upvoteDelta = 0;
    let downvoteDelta = 0;
    let newUserVote: "upvote" | "downvote" | null = null;

    if (voteType === "remove") {
      // Remove vote
      if (existingVote) {
        if (existingVote.voteType === "upvote") {
          upvoteDelta = -1;
        } else {
          downvoteDelta = -1;
        }
        await prisma.spellTierListVote.delete({
          where: { id: existingVote.id },
        });
      }
    } else if (existingVote) {
      // Update existing vote
      if (existingVote.voteType === voteType) {
        // Same vote - remove it (toggle off)
        if (voteType === "upvote") {
          upvoteDelta = -1;
        } else {
          downvoteDelta = -1;
        }
        await prisma.spellTierListVote.delete({
          where: { id: existingVote.id },
        });
      } else {
        // Different vote - switch
        if (existingVote.voteType === "upvote") {
          upvoteDelta = -1;
          downvoteDelta = 1;
        } else {
          upvoteDelta = 1;
          downvoteDelta = -1;
        }
        await prisma.spellTierListVote.update({
          where: { id: existingVote.id },
          data: { voteType },
        });
        newUserVote = voteType;
      }
    } else {
      // Create new vote
      if (voteType === "upvote") {
        upvoteDelta = 1;
      } else {
        downvoteDelta = 1;
      }
      await prisma.spellTierListVote.create({
        data: {
          tierListId,
          userId,
          voteType,
        },
      });
      newUserVote = voteType;
    }

    // Update tier list vote counts
    const updatedTierList = await prisma.spellTierList.update({
      where: { id: tierListId },
      data: {
        upvotes: { increment: upvoteDelta },
        downvotes: { increment: downvoteDelta },
      },
    });

    return NextResponse.json({
      upvotes: updatedTierList.upvotes,
      downvotes: updatedTierList.downvotes,
      userVote: newUserVote,
    });
  } catch (error: any) {
    console.error("[TierList Vote API] POST error:", error);
    return NextResponse.json(
      { error: "Failed to vote" },
      { status: 500 }
    );
  }
}
