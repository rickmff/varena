import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/better-auth/server";
import { isAdmin } from "@/lib/utils/admin";

interface RouteParams {
  params: Promise<{
    userId: string;
  }>;
}

// DELETE /api/admin/badges/[userId] - Remove a badge from a user
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession();

    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { userId } = await params;

    // Check if badge exists
    const badge = await prisma.userBadge.findUnique({
      where: {
        userId: userId,
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

    if (!badge) {
      return NextResponse.json(
        { error: "Badge not found" },
        { status: 404 }
      );
    }

    // Delete the badge
    await prisma.userBadge.delete({
      where: {
        userId: userId,
      },
    });

    return NextResponse.json({
      message: "Badge removed successfully",
      removedBadge: {
        userId: badge.userId,
        badgeType: badge.badgeType,
      },
    });
  } catch (error: any) {
    console.error("[Admin API] Error removing badge:", error);
    return NextResponse.json(
      { error: "Error removing badge" },
      { status: 500 }
    );
  }
}

