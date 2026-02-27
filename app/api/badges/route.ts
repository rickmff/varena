import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/badges - Get badges for specific users (public endpoint)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIds = searchParams.get("userIds");

    if (!userIds) {
      return NextResponse.json({ badges: [] });
    }

    // Get badges for specific users
    const userIdList = userIds.split(",").map((id) => id.trim()).filter(Boolean);

    if (userIdList.length === 0) {
      return NextResponse.json({ badges: [] });
    }

    const badges = await prisma.userBadge.findMany({
      where: {
        userId: {
          in: userIdList,
        },
      },
      select: {
        id: true,
        userId: true,
        badgeType: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ badges });
  } catch (error: any) {
    console.error("[Badges API] Error fetching badges:", error);
    return NextResponse.json(
      { error: "Error fetching badges" },
      { status: 500 }
    );
  }
}

