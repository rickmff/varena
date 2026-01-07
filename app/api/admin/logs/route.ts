import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/better-auth/server";
import { isAdmin } from "@/lib/utils/admin";
import { logger } from "@/lib/logger";

// GET /api/admin/logs - Get system logs (admin only)
export async function GET(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    const recentSessions = await prisma.session.findMany({
      take: limit,
      skip: offset,
      orderBy: { expires: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    const recentBadges = await prisma.userBadge.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    const recentVotes = await prisma.buildVote.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        build: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const recentSignups = await prisma.user.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    const logs = [
      ...recentSignups.map((user) => ({
        id: `signup-${user.id}`,
        type: "signup" as const,
        userId: user.id,
        userName: user.name || null,
        userEmail: user.email || null,
        details: "New user signed up",
        timestamp: user.createdAt,
        metadata: { userId: user.id },
      })),
      ...recentSessions.map((session) => ({
        id: `session-${session.id}`,
        type: "login" as const,
        userId: session.userId,
        userName: session.user?.name || null,
        userEmail: session.user?.email || null,
        details: "User logged in",
        timestamp: session.expires,
        metadata: { sessionId: session.id },
      })),
      ...recentBadges.map((badge) => ({
        id: `badge-${badge.id}`,
        type: "badge" as const,
        userId: badge.userId,
        userName: badge.user?.name || null,
        userEmail: badge.user?.email || null,
        details: `Badge "${badge.badgeType}" assigned`,
        timestamp: badge.createdAt,
        metadata: { badgeType: badge.badgeType, badgeId: badge.id },
      })),
      ...recentVotes.map((vote) => ({
        id: `vote-${vote.id}`,
        type: "vote" as const,
        userId: vote.userId,
        userName: vote.user?.name || null,
        userEmail: vote.user?.email || null,
        details: `${vote.voteType} on build "${vote.build.name}"`,
        timestamp: vote.createdAt,
        metadata: {
          voteType: vote.voteType,
          buildId: vote.buildId,
          buildName: vote.build.name,
        },
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ logs: logs.slice(0, limit) });
  } catch (error) {
    logger.error("Error fetching logs", error);
    return NextResponse.json(
      { error: "Error fetching logs" },
      { status: 500 }
    );
  }
}
