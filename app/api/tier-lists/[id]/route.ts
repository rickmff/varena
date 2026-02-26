import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/better-auth/server";
import prisma from "@/lib/prisma";

type TierKey = "S" | "A" | "B" | "C" | "D" | "Unranked";

type TierPayload = {
  [key in TierKey]: string[];
};

function validateTiers(data: any): data is TierPayload {
  const tierKeys: TierKey[] = ["S", "A", "B", "C", "D", "Unranked"];
  if (typeof data !== "object" || data === null) return false;
  for (const key of tierKeys) {
    if (!Array.isArray(data[key])) return false;
    if (!data[key].every((v: any) => typeof v === "string")) return false;
  }
  return true;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get a specific tier list
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    let session: any = null;
    try {
      session = await getServerSession();
    } catch (error) {
      // Continue without session
    }

    const tierList = await prisma.spellTierList.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        ...(session?.user?.id
          ? {
              votes: {
                where: { userId: session.user.id },
                select: { voteType: true },
              },
            }
          : {}),
      },
    });

    if (!tierList) {
      return NextResponse.json(
        { error: "Tier list not found" },
        { status: 404 }
      );
    }

    // Check access: must be owner or public
    const isOwner = session?.user?.id === tierList.userId;
    if (!isOwner && !tierList.isPublic) {
      return NextResponse.json(
        { error: "Tier list not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: tierList.id,
      name: tierList.name,
      isPublic: tierList.isPublic,
      tiers: tierList.tiersJson,
      upvotes: tierList.upvotes,
      downvotes: tierList.downvotes,
      userVote: (tierList as any).votes?.[0]?.voteType || null,
      createdAt: tierList.createdAt.toISOString(),
      updatedAt: tierList.updatedAt.toISOString(),
      author: tierList.user?.name || "Anonymous",
      userId: tierList.user?.id || null,
      userImage: tierList.user?.image || null,
      isOwner,
    });
  } catch (error: any) {
    console.error("[TierList API] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load tier list" },
      { status: 500 }
    );
  }
}

// PUT - Update a tier list
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    let session: any = null;
    try {
      session = await getServerSession();
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to get session" },
        { status: 401 }
      );
    }

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check ownership
    const existing = await prisma.spellTierList.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Tier list not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, tiers, isPublic } = body as {
      name?: string;
      tiers?: TierPayload;
      isPublic?: boolean;
    };

    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Invalid name" },
          { status: 400 }
        );
      }
      const safeName = name.trim().slice(0, 100);

      // Check if name is taken by another tier list of this user
      if (safeName !== existing.name) {
        const duplicate = await prisma.spellTierList.findFirst({
          where: {
            userId: session.user.id,
            name: safeName,
            NOT: { id },
          },
        });

        if (duplicate) {
          return NextResponse.json(
            { error: "A tier list with this name already exists" },
            { status: 400 }
          );
        }
      }

      updateData.name = safeName;
    }

    if (tiers !== undefined) {
      if (!validateTiers(tiers)) {
        return NextResponse.json(
          { error: "Invalid tier data" },
          { status: 400 }
        );
      }
      updateData.tiersJson = tiers;
    }

    if (isPublic !== undefined) {
      updateData.isPublic = !!isPublic;
    }

    const tierList = await prisma.spellTierList.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      id: tierList.id,
      name: tierList.name,
      isPublic: tierList.isPublic,
      tiers: tierList.tiersJson,
      upvotes: tierList.upvotes,
      downvotes: tierList.downvotes,
      createdAt: tierList.createdAt.toISOString(),
      updatedAt: tierList.updatedAt.toISOString(),
    });
  } catch (error: any) {
    console.error("[TierList API] PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update tier list" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a tier list
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    let session: any = null;
    try {
      session = await getServerSession();
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to get session" },
        { status: 401 }
      );
    }

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check ownership
    const existing = await prisma.spellTierList.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Tier list not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.spellTierList.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[TierList API] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete tier list" },
      { status: 500 }
    );
  }
}
