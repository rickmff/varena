import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/better-auth/server";
import { isAdmin } from "@/lib/utils/admin";
import { logger } from "@/lib/logger";

// GET /api/admin/badges - Get all badges or badges for specific users
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
    const userIds = searchParams.get("userIds");

    let badges;
    if (userIds) {
      const userIdList = userIds.split(",").map((id) => id.trim()).filter(Boolean);
      badges = await prisma.userBadge.findMany({
        where: {
          userId: { in: userIdList },
        },
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
    } else {
      badges = await prisma.userBadge.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    return NextResponse.json({ badges });
  } catch (error) {
    logger.error("Error fetching badges", error);
    return NextResponse.json(
      { error: "Error fetching badges" },
      { status: 500 }
    );
  }
}

// POST /api/admin/badges - Assign or update a badge for a user
export async function POST(request: Request) {
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

    const body = await request.json();
    const { userId, badgeType = "verified", description = "Verified by V Arena staff" } = body;

    if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
      return NextResponse.json(
        { error: "Invalid request - userId is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const badge = await prisma.userBadge.upsert({
      where: { userId },
      update: { badgeType, description },
      create: { userId, badgeType, description },
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

    return NextResponse.json({ badge });
  } catch (error) {
    logger.error("Error assigning badge", error);
    return NextResponse.json(
      { error: "Error assigning badge" },
      { status: 500 }
    );
  }
}
