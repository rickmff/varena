import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/better-auth/server";
import prisma from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { buildIds, pageOffset = 0 } = await request.json();

    if (!Array.isArray(buildIds) || buildIds.length === 0) {
      return NextResponse.json(
        { error: "buildIds must be a non-empty array" },
        { status: 400 }
      );
    }

    // Verify all builds belong to the current user
    const builds = await prisma.build.findMany({
      where: {
        id: { in: buildIds },
        userId: session.user.id,
      },
      select: { id: true },
    });

    if (builds.length !== buildIds.length) {
      return NextResponse.json(
        { error: "Some builds were not found or don't belong to you" },
        { status: 403 }
      );
    }

    // Update sortOrder for each build in a transaction
    // pageOffset accounts for pagination (e.g. page 2 starts at offset 11)
    await prisma.$transaction(
      buildIds.map((id, index) =>
        prisma.build.update({
          where: { id },
          data: { sortOrder: pageOffset + index },
        })
      )
    );

    // Invalidate cache
    revalidateTag(`builds-${session.user.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering builds:", error);
    return NextResponse.json(
      { error: "Failed to reorder builds" },
      { status: 500 }
    );
  }
}
