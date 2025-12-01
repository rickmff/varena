import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/better-auth/server";
import prisma from "@/lib/prisma";

// GET /api/gdpr/export-data - Export all user data (GDPR Right to Access)
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Fetch all user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: {
          select: {
            id: true,
            type: true,
            provider: true,
          },
        },
        builds: {
          select: {
            id: true,
            name: true,
            isPublic: true,
            upvotes: true,
            downvotes: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        votes: {
          include: {
            build: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            builds: true,
            votes: true,
            sessions: true,
            accounts: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prepare export data (exclude sensitive fields)
    const exportData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        banned: user.banned,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accounts: user.accounts,
      builds: user.builds,
      votes: user.votes.map((vote) => ({
        id: vote.id,
        buildId: vote.buildId,
        buildName: vote.build.name,
        voteType: vote.voteType,
        createdAt: vote.createdAt,
      })),
      statistics: {
        totalBuilds: user._count.builds,
        totalVotes: user._count.votes,
        activeSessions: user._count.sessions,
        linkedAccounts: user._count.accounts,
      },
      exportDate: new Date().toISOString(),
      exportFormat: "JSON",
      gdprCompliant: true,
    };

    // Return as downloadable JSON file
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="varena-data-export-${userId}-${Date.now()}.json"`,
      },
    });
  } catch (error: any) {
    console.error("[GDPR Export] Error:", error);
    return NextResponse.json(
      { error: "Failed to export user data" },
      { status: 500 }
    );
  }
}

