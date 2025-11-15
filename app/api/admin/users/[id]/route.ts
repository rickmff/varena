import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/better-auth/server";
import { isAdmin } from "@/lib/utils/admin";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// DELETE /api/admin/users/[id] - Delete a user (admin only)
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
      console.log(`[Admin API] Non-admin user ${session.user.email} attempted to delete user`);
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Prevent admin from deleting themselves
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if user exists
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

    // Delete the user (cascade will delete builds, votes, sessions, accounts)
    await prisma.user.delete({
      where: { id },
    });

    console.log(`[Admin API] Admin ${session.user.email} deleted user ${user.email} (${user.name || "unnamed"})`);

    return NextResponse.json({
      message: "User deleted successfully",
      deletedUser: {
        email: user.email,
        name: user.name,
      }
    });
  } catch (error: any) {
    console.error("[Admin API] Error deleting user:", error);
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

    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (!isAdmin(session)) {
      console.log(`[Admin API] Non-admin user ${session.user.email} attempted to ban/unban user`);
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { banned } = body;

    // Validate banned field
    if (typeof banned !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request - banned must be a boolean" },
        { status: 400 }
      );
    }

    // Prevent admin from banning themselves
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot ban your own account" },
        { status: 400 }
      );
    }

    // Check if user exists
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

    // Update user banned status
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

    console.log(
      `[Admin API] Admin ${session.user.email} ${banned ? "banned" : "unbanned"} user ${user.email} (${user.name || "unnamed"})`
    );

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("[Admin API] Error updating user:", error);
    return NextResponse.json(
      { error: "Error updating user" },
      { status: 500 }
    );
  }
}

