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

// GET current user's tier list or a public one by username
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userName = searchParams.get("userName");

    if (userName) {
      // Public lookup by username
      const user = await prisma.user.findFirst({
        where: { name: userName },
        select: { id: true, name: true },
      });

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      const spellTierDelegate = (prisma as any).spellTierList;
      if (!spellTierDelegate) {
        return NextResponse.json(
          { error: "Spell tier list storage is not configured on the server." },
          { status: 500 }
        );
      }

      const tierList = await spellTierDelegate.findUnique({
        where: { userId: user.id },
      });

      if (!tierList || !tierList.isPublic) {
        return NextResponse.json(
          { error: "Spell tier list is not public for this user" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        user: {
          id: user.id,
          name: user.name,
        },
        tierList: {
          id: tierList.id,
          title: tierList.title,
          isPublic: tierList.isPublic,
          tiers: tierList.tiersJson,
        },
      });
    }

    // Authenticated user's own tier list
    let session: any = null;
    try {
      session = await getServerSession();
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to get session", code: "FAILED_TO_GET_SESSION" },
        { status: 401 }
      );
    }

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const spellTierDelegate = (prisma as any).spellTierList;
    if (!spellTierDelegate) {
      return NextResponse.json(
        { error: "Spell tier list storage is not configured on the server." },
        { status: 500 }
      );
    }

    const tierList = await spellTierDelegate.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      tierList: tierList
        ? {
            id: tierList.id,
            title: tierList.title,
            isPublic: tierList.isPublic,
            tiers: tierList.tiersJson,
          }
        : null,
    });
  } catch (error: any) {
    console.error("[SpellTierList API] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load spell tier list" },
      { status: 500 }
    );
  }
}

// PUT to create/update current user's tier list
export async function PUT(request: Request) {
  try {
    let session: any = null;
    try {
      session = await getServerSession();
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to get session", code: "FAILED_TO_GET_SESSION" },
        { status: 401 }
      );
    }

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tiers, isPublic, title } = body as {
      tiers: TierPayload;
      isPublic?: boolean;
      title?: string;
    };

    if (!validateTiers(tiers)) {
      return NextResponse.json(
        { error: "Invalid tier data" },
        { status: 400 }
      );
    }

    const safeTitle =
      typeof title === "string" && title.trim().length > 0
        ? title.trim().slice(0, 100)
        : "Spell Tier List";

    const spellTierDelegate = (prisma as any).spellTierList;
    if (!spellTierDelegate) {
      return NextResponse.json(
        { error: "Spell tier list storage is not configured on the server." },
        { status: 500 }
      );
    }

    const tierList = await spellTierDelegate.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        title: safeTitle,
        isPublic: !!isPublic,
        tiersJson: tiers,
      },
      update: {
        title: safeTitle,
        isPublic: !!isPublic,
        tiersJson: tiers,
      },
    });

    return NextResponse.json({
      id: tierList.id,
      title: tierList.title,
      isPublic: tierList.isPublic,
      tiers: tierList.tiersJson,
    });
  } catch (error: any) {
    console.error("[SpellTierList API] PUT error:", error);
    return NextResponse.json(
      { error: "Failed to save spell tier list" },
      { status: 500 }
    );
  }
}


