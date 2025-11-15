import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/better-auth/server";
import { isAdmin } from "@/lib/utils/admin";
import { revalidateTag } from "next/cache";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// DELETE /api/admin/builds/[id] - Delete any build (admin only)
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
      console.log(`[Admin API] Non-admin user ${session.user.email} attempted to delete build`);
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if build exists
    const build = await prisma.build.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        author: true,
        userId: true,
        isPublic: true,
      },
    });

    if (!build) {
      return NextResponse.json(
        { error: "Build not found" },
        { status: 404 }
      );
    }

    // Delete the build (cascade will delete votes)
    await prisma.build.delete({
      where: { id },
    });

    // Invalidate caches
    if (build.userId) {
      revalidateTag(`builds-${build.userId}`);
    }
    if (build.isPublic) {
      revalidateTag("public-builds");
    }

    console.log(
      `[Admin API] Admin ${session.user.email} deleted build "${build.name}" by ${build.author} (owner: ${build.userId || "none"})`
    );

    return NextResponse.json({
      message: "Build deleted successfully",
      deletedBuild: {
        id: build.id,
        name: build.name,
        author: build.author,
      }
    });
  } catch (error: any) {
    console.error("[Admin API] Error deleting build:", error);
    return NextResponse.json(
      { error: "Error deleting build" },
      { status: 500 }
    );
  }
}

