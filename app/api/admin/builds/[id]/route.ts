import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/better-auth/server";
import { isAdmin } from "@/lib/utils/admin";
import { revalidateTag } from "next/cache";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// DELETE /api/admin/builds/[id] - Delete any build (admin only)
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

    await prisma.build.delete({
      where: { id },
    });

    if (build.userId) {
      revalidateTag(`builds-${build.userId}`);
    }
    if (build.isPublic) {
      revalidateTag("public-builds");
    }

    return NextResponse.json({
      message: "Build deleted successfully",
      deletedBuild: {
        id: build.id,
        name: build.name,
        author: build.author,
      }
    });
  } catch (error) {
    logger.error("Error deleting build (admin)", error);
    return NextResponse.json(
      { error: "Error deleting build" },
      { status: 500 }
    );
  }
}
