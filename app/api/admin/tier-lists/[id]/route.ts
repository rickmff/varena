import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/better-auth/server";
import { isAdmin } from "@/lib/utils/admin";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// DELETE /api/admin/tier-lists/[id] - Delete any tier list (admin only)
export async function DELETE(request: Request, { params }: RouteParams) {
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

    const { id } = await params;

    const tierList = await prisma.spellTierList.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        userId: true,
        user: {
          select: { name: true },
        },
      },
    });

    if (!tierList) {
      return NextResponse.json(
        { error: "Tier list not found" },
        { status: 404 }
      );
    }

    await prisma.spellTierList.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Tier list deleted successfully",
      deletedTierList: {
        id: tierList.id,
        name: tierList.name,
        author: tierList.user?.name || "Anonymous",
      },
    });
  } catch (error: any) {
    console.error("[Admin API] Error deleting tier list:", error);
    return NextResponse.json(
      { error: "Error deleting tier list" },
      { status: 500 }
    );
  }
}
