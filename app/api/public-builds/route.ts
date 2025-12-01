import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/better-auth/server";
import { unstable_cache } from "next/cache";

// Get all public builds (no authentication required, but session used for vote status)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authorFilter = searchParams.get("author");
    const sortBy = searchParams.get("sort") || "popular"; // "popular", "newest", "oldest"
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50"); // Default 50 for public builds
    const skip = (page - 1) * limit;

    // Get session if user is authenticated (optional)
    const session = await getServerSession();
    const userId = session?.user?.id;

    // Cache key based on sort and author filter
    const cacheKey = `public-builds-${sortBy}-${authorFilter || "all"}`;

    // Cache public builds for 2 minutes (120 seconds)
    const getCachedBuilds = unstable_cache(
      async (sort: string, author: string | null) => {
        // Determine orderBy based on sort parameter
        let orderBy: any;
        if (sort === "newest") {
          orderBy = { createdAt: "desc" };
        } else if (sort === "oldest") {
          orderBy = { createdAt: "asc" };
        } else {
          // For popular, we'll sort by score (upvotes - downvotes) after fetching
          // MySQL doesn't support computed columns easily, so we sort in memory
          orderBy = { createdAt: "desc" }; // Temporary, will sort by popularity after
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
              // Exclude fields not needed: authorTwitchUrl, authorYoutubeUrl
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
        if (sort === "popular") {
          builds = [...builds].sort((a, b) => {
            const scoreA = a.upvotes - a.downvotes;
            const scoreB = b.upvotes - b.downvotes;
            return scoreB - scoreA; // Descending order
          });
        }

        return builds;
      },
      [cacheKey],
      {
        tags: ["public-builds"],
        revalidate: 120, // 2 minutes in seconds
      }
    );

    const builds = await getCachedBuilds(sortBy, authorFilter);

    // Get user votes if authenticated (only for builds in current page)
    let userVotes: Record<string, "upvote" | "downvote"> = {};
    if (userId && builds.length > 0) {
      try {
        // Only fetch votes for builds in the current page range
        const pageBuilds = builds.slice(skip, skip + limit);
        const buildIds = pageBuilds.map((b) => b.id);

        if (buildIds.length > 0) {
          const votes = await prisma.buildVote.findMany({
            where: {
              userId,
              buildId: {
                in: buildIds,
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
        }
      } catch (error: any) {
        // Ignore if BuildVote table doesn't exist yet (migration not applied)
        if (!error.message?.includes("BuildVote")) {
          console.error("Error fetching user votes:", error);
        }
      }
    }

    // Apply pagination
    const paginatedBuilds = builds.slice(skip, skip + limit);

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
  } catch (error: any) {
    console.error("Error fetching public builds:", error);
    return NextResponse.json(
      { error: "Error fetching public builds" },
      { status: 500 }
    );
  }
}

