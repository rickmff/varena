import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/better-auth/server";

// Get all public builds (no authentication required, but session used for vote status)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authorFilter = searchParams.get("author");
    const sortBy = searchParams.get("sort") || "popular"; // "popular", "newest", "oldest"

    // Get session if user is authenticated (optional)
    const session = await getServerSession();
    const userId = session?.user?.id;

    // Determine orderBy based on sort parameter
    let orderBy: any;
    if (sortBy === "newest") {
      orderBy = { createdAt: "desc" };
    } else if (sortBy === "oldest") {
      orderBy = { createdAt: "asc" };
    } else {
      // Default: sort by popularity (upvotes - downvotes DESC)
      // We'll need to calculate this after fetching, or use raw SQL
      // For now, we'll fetch all and sort in memory, or use a computed field
      // MySQL doesn't support computed columns easily, so we'll sort after fetching
      orderBy = { createdAt: "desc" }; // Temporary, will sort by popularity after
    }

    let builds;
    try {
      builds = await prisma.build.findMany({
        where: {
          isPublic: true,
          ...(authorFilter && {
            author: {
              contains: authorFilter,
            },
          }),
        },
        orderBy,
        select: {
          id: true,
          name: true,
          code: true,
          author: true,
          authorTwitchUrl: true,
          authorYoutubeUrl: true,
          isPublic: true,
          upvotes: true,
          downvotes: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
        },
      });
    } catch (error: any) {
      // Fallback if migration hasn't been applied yet
      const errorMessage = error.message || error.toString() || "";
      if (
        errorMessage.includes("upvotes") ||
        errorMessage.includes("downvotes") ||
        errorMessage.includes("Unknown column") ||
        error.code === "P2009" // Prisma query validation error
      ) {
        console.warn("Vote columns not found, using fallback. Please run migration:", errorMessage);
        builds = await prisma.build.findMany({
          where: {
            isPublic: true,
            ...(authorFilter && {
              author: {
                contains: authorFilter,
              },
            }),
          },
          orderBy,
          select: {
            id: true,
            name: true,
            code: true,
            author: true,
            authorTwitchUrl: true,
            authorYoutubeUrl: true,
            isPublic: true,
            createdAt: true,
            updatedAt: true,
            userId: true,
          },
        });
        // Add default vote values
        builds = builds.map((build: any) => ({
          ...build,
          upvotes: 0,
          downvotes: 0,
        }));
      } else {
        throw error;
      }
    }

    // Sort by popularity if requested (upvotes - downvotes)
    let sortedBuilds = builds;
    if (sortBy === "popular") {
      sortedBuilds = [...builds].sort((a, b) => {
        const scoreA = a.upvotes - a.downvotes;
        const scoreB = b.upvotes - b.downvotes;
        return scoreB - scoreA; // Descending order
      });
    }

    // Get user votes if authenticated
    let userVotes: Record<string, "upvote" | "downvote"> = {};
    if (userId) {
      try {
        const votes = await prisma.buildVote.findMany({
          where: {
            userId,
            buildId: {
              in: sortedBuilds.map((b) => b.id),
            },
          },
          select: {
            buildId: true,
            voteType: true,
          },
        });

        votes.forEach((vote) => {
          userVotes[vote.buildId] = vote.voteType as "upvote" | "downvote";
        });
      } catch (error: any) {
        // Ignore if BuildVote table doesn't exist yet (migration not applied)
        if (!error.message?.includes("BuildVote")) {
          console.error("Error fetching user votes:", error);
        }
      }
    }

    // Add user vote status to each build
    const buildsWithVotes = sortedBuilds.map((build) => ({
      ...build,
      userVote: userVotes[build.id] || null,
    }));

    return NextResponse.json(buildsWithVotes);
  } catch (error: any) {
    console.error("Error fetching public builds:", error);
    return NextResponse.json(
      { error: "Error fetching public builds" },
      { status: 500 }
    );
  }
}

