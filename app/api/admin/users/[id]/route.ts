import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/better-auth/server";
import { isAdmin } from "@/lib/utils/admin";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// DELETE /api/admin/users/[id] - Delete a user (admin only)
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

    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        email: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "User deleted successfully",
      deletedUser: {
        email: user.email,
        name: user.name,
      }
    });
  } catch (error) {
    logger.error("Error deleting user", error);
    return NextResponse.json(
      { error: "Error deleting user" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/[id] - Ban/unban a user (admin only)
export async function PUT(request: Request, { params }: RouteParams) {
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
    const body = await request.json();
    const { banned } = body;

    if (typeof banned !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request - banned must be a boolean" },
        { status: 400 }
      );
    }

    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot ban your own account" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        email: true,
        name: true,
        banned: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { banned },
      select: {
        id: true,
        email: true,
        name: true,
        banned: true,
        createdAt: true,
        _count: {
          select: {
            builds: true,
            votes: true,
          },
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    logger.error("Error updating user", error);
    return NextResponse.json(
      { error: "Error updating user" },
      { status: 500 }
    );
  }
}
