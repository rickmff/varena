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
        spellTierLists: {
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
        spellTierListVotes: {
          include: {
            tierList: {
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
            spellTierLists: true,
            spellTierListVotes: true,
          },
        },
      },
    });

    // Fetch auth-related data separately from AuthUser
    const authUser = await prisma.authUser.findUnique({
      where: { id: userId },
      include: {
        accounts: {
          select: {
            id: true,
            providerId: true,
            accountId: true,
            createdAt: true,
          },
        },
        sessions: {
          select: {
            id: true,
            expiresAt: true,
            ipAddress: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
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
      accounts: authUser?.accounts.map((account) => ({
        id: account.id,
        provider: account.providerId,
        accountId: account.accountId,
        createdAt: account.createdAt,
      })) || [],
      sessions: authUser?.sessions.map((session) => ({
        id: session.id,
        expiresAt: session.expiresAt,
        ipAddress: session.ipAddress,
        createdAt: session.createdAt,
      })) || [],
      builds: user.builds,
      votes: user.votes.map((vote) => ({
        id: vote.id,
        buildId: vote.buildId,
        buildName: vote.build.name,
        voteType: vote.voteType,
        createdAt: vote.createdAt,
      })),
      spellTierLists: user.spellTierLists,
      spellTierListVotes: user.spellTierListVotes.map((vote) => ({
        id: vote.id,
        tierListId: vote.tierListId,
        tierListName: vote.tierList.name,
        voteType: vote.voteType,
        createdAt: vote.createdAt,
      })),
      statistics: {
        totalBuilds: user._count.builds,
        totalVotes: user._count.votes,
        totalSpellTierLists: user._count.spellTierLists,
        totalSpellTierListVotes: user._count.spellTierListVotes,
        activeSessions: authUser?._count.sessions || 0,
        linkedAccounts: authUser?._count.accounts || 0,
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

