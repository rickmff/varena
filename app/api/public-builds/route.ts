import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/better-auth/server";
import { unstable_cache } from "next/cache";
import { logger } from "@/lib/logger";

// Get all public builds (no authentication required, but session used for vote status)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authorFilter = searchParams.get("author");
    const sortBy = searchParams.get("sort") || "popular";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Get session if user is authenticated (optional)
    let session: any = null;
    try {
      session = await getServerSession();
    } catch (error) {
      // Session fetch failed, continue without session
    }
    const userId = session?.user?.id;


    // Cache key based on sort and author filter
    const cacheKey = `public-builds-${sortBy}-${authorFilter || "all"}`;

    // Cache public builds for 2 minutes
    const getCachedBuilds = unstable_cache(
      async (sort: string, author: string | null) => {
        let orderBy: { createdAt: "desc" | "asc" };
        if (sort === "newest") {
          orderBy = { createdAt: "desc" };
        } else if (sort === "oldest") {
          orderBy = { createdAt: "asc" };
        } else {
          orderBy = { createdAt: "desc" };
        }

        let builds;
        try {
          builds = await prisma.build.findMany({
            where: {
              isPublic: true,
              ...(author && {
                author: {
                  contains: author,
                },
              }),
            },
            orderBy,
            select: {
              id: true,
              name: true,
              code: true,
              author: true,
              isPublic: true,
              upvotes: true,
              downvotes: true,
              createdAt: true,
              updatedAt: true,
              userId: true,
            },
          });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (
            errorMessage.includes("upvotes") ||
            errorMessage.includes("downvotes") ||
            errorMessage.includes("Unknown column")
          ) {
            logger.warn("Vote columns not found, using fallback");
            builds = await prisma.build.findMany({
              where: {
                isPublic: true,
                ...(author && {
                  author: {
                    contains: author,
                  },
                }),
              },
              orderBy,
              select: {
                id: true,
                name: true,
                code: true,
                author: true,
                isPublic: true,
                createdAt: true,
                updatedAt: true,
                userId: true,
              },
            });
            builds = builds.map((build) => ({
              ...build,
              upvotes: 0,
              downvotes: 0,
            }));
          } else {
            throw error;
          }
        }

        // Sort by popularity if requested
        if (sort === "popular") {
          builds = [...builds].sort((a, b) => {
            const scoreA = a.upvotes - a.downvotes;
            const scoreB = b.upvotes - b.downvotes;
            return scoreB - scoreA;
          });
        }

        return builds;
      },
      [cacheKey],
      {
        tags: ["public-builds"],
        revalidate: 120,
      }
    );

    const builds = await getCachedBuilds(sortBy, authorFilter);

    // Apply pagination first
    const paginatedBuilds = builds.slice(skip, skip + limit);

    // OPTIMIZATION: Only fetch session and votes if user might be authenticated
    // Check for session cookie before making expensive getServerSession call
    const hasCookie = request.headers.get("cookie")?.includes("better-auth");

    let userVotes: Record<string, "upvote" | "downvote"> = {};

    if (hasCookie && paginatedBuilds.length > 0) {
      try {
        const session = await getServerSession();

        if (session?.user?.id) {
          const buildIds = paginatedBuilds.map((b) => b.id);

          const votes = await prisma.buildVote.findMany({
            where: {
              userId: session.user.id,
              buildId: { in: buildIds },
            },
            select: {
              buildId: true,
              voteType: true,
            },
          });

          votes.forEach((vote) => {
            userVotes[vote.buildId] = vote.voteType as "upvote" | "downvote";
          });
        }
      } catch (error) {
        // Ignore session/vote fetch errors for public endpoint
        logger.debug("Could not fetch user votes", { error });
      }
    }

    // Add user vote status to each build
    const buildsWithVotes = paginatedBuilds.map((build) => ({
      ...build,
      userVote: userVotes[build.id] || null,
    }));

    return NextResponse.json({
      builds: buildsWithVotes,
      total: builds.length,
      page,
      limit,
      totalPages: Math.ceil(builds.length / limit),
    });
  } catch (error) {
    logger.error("Error fetching public builds", error);
    return NextResponse.json(
      { error: "Error fetching public builds" },
      { status: 500 }
    );
  }
}
