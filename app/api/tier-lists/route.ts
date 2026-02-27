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

// GET - List tier lists (user's own or public)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isPublic = searchParams.get("public") === "true";
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // Get current user session if available
    let session: any = null;
    try {
      session = await getServerSession();
    } catch (error) {
      // Session fetch failed, continue without session
    }

    if (isPublic) {
      // Public tier lists - anyone can view
      const tierLists = await prisma.spellTierList.findMany({
        where: { isPublic: true },
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
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      return NextResponse.json({
        tierLists: tierLists.map((t: any) => ({
          id: t.id,
          name: t.name,
          isPublic: t.isPublic,
          tiers: t.tiersJson,
          upvotes: t.upvotes,
          downvotes: t.downvotes,
          userVote: t.votes?.[0]?.voteType || null,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
          author: t.user?.name || "Anonymous",
          userId: t.user?.id || null,
          userImage: t.user?.image || null,
        })),
      });
    }

    // User's own tier lists - requires auth
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!session.user.email) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    // Ensure user exists in User table (sync from AuthUser)
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      // User doesn't exist, create it
      user = await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name || null,
          image: session.user.image || null,
          emailVerified: session.user.emailVerified ? new Date() : null,
        },
      });
    } else if (user.id !== session.user.id) {
      // User exists but with different ID - migrate
      await prisma.spellTierList.updateMany({
        where: { userId: user.id },
        data: { userId: session.user.id },
      });
      await prisma.spellTierListVote.updateMany({
        where: { userId: user.id },
        data: { userId: session.user.id },
      });
      await prisma.user.delete({ where: { id: user.id } });
      user = await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name || null,
          image: session.user.image || null,
          emailVerified: session.user.emailVerified ? new Date() : null,
        },
      });
    }

    const tierLists = await prisma.spellTierList.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      tierLists: tierLists.map((t) => ({
        id: t.id,
        name: t.name,
        isPublic: t.isPublic,
        tiers: t.tiersJson,
        upvotes: t.upvotes,
        downvotes: t.downvotes,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error("[TierLists API] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load tier lists" },
      { status: 500 }
    );
  }
}

// POST - Create a new tier list
export async function POST(request: Request) {
  try {
    let session: any = null;
    try {
      session = await getServerSession();
    } catch (error) {
      console.error("[TierLists API] Session error:", error);
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

    if (!session.user.email) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    // Ensure user exists in User table (sync from AuthUser)
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    // If user exists but with different ID, migrate tier lists and update
    if (user && user.id !== session.user.id) {
      // Migrate all tier lists from old user ID to new user ID
      await prisma.spellTierList.updateMany({
        where: { userId: user.id },
        data: { userId: session.user.id },
      });

      await prisma.spellTierListVote.updateMany({
        where: { userId: user.id },
        data: { userId: session.user.id },
      });

      // Delete the old user record
      await prisma.user.delete({
        where: { id: user.id },
      });

      // Create new user with correct ID
      user = await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name || null,
          image: session.user.image || null,
          emailVerified: session.user.emailVerified ? new Date() : null,
        },
      });
    } else if (user) {
      // User exists with correct ID, just update
      user = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: session.user.name || null,
          image: session.user.image || null,
          emailVerified: session.user.emailVerified ? new Date() : null,
        },
      });
    } else {
      // User doesn't exist, create it
      user = await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name || null,
          image: session.user.image || null,
          emailVerified: session.user.emailVerified ? new Date() : null,
        },
      });
    }

    const userIdToUse = user.id;

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("[TierLists API] JSON parse error:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { name, tiers, isPublic } = body as {
      name: string;
      tiers: TierPayload;
      isPublic?: boolean;
    };

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!validateTiers(tiers)) {
      console.error("[TierLists API] Invalid tiers:", JSON.stringify(tiers));
      return NextResponse.json(
        { error: "Invalid tier data" },
        { status: 400 }
      );
    }

    const safeName = name.trim().slice(0, 100);

    // Check if user already has a tier list with this name
    const existing = await prisma.spellTierList.findFirst({
      where: {
        userId: userIdToUse,
        name: safeName,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A tier list with this name already exists" },
        { status: 400 }
      );
    }

    const tierList = await prisma.spellTierList.create({
      data: {
        userId: userIdToUse,
        name: safeName,
        isPublic: !!isPublic,
        tiersJson: tiers,
      },
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
    console.error("[TierLists API] POST error:", error?.message || error);
    console.error("[TierLists API] POST stack:", error?.stack);
    return NextResponse.json(
      { error: error?.message || "Failed to create tier list" },
      { status: 500 }
    );
  }
}
