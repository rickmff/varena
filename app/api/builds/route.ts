import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/better-auth/server";
import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";

// Helper function to check if a build code is empty (all zeros)
function isEmptyBuild(code: string): boolean {
  if (!code || typeof code !== "string") return true;
  // Remove all zeros and check if anything remains
  return code.replace(/0/g, "").trim().length === 0;
}

// Helper function to check if a build is complete (all required slots filled)
function isBuildComplete(code: string): boolean {
  if (!code || typeof code !== "string" || code.length < 78) return false;

  try {
    // Import the converter function dynamically to avoid circular dependencies
    // For now, we'll check the code structure directly
    // A complete build needs:
    // - elixir (char 0): not '0'
    // - amulet (char 70): not '0'
    // - armour (chars 71-74): not all '0'
    // - blood (chars 75-77): all 3 chars not '0'
    // - spells: dash (char 10), spell1 (char 0 of spells), spell2 (char 5 of spells), ultimate (char 15 of spells): all not '0'
    // - weapons: at least one weapon slot filled (chars 30-69)
    // - passives: 5 passives (chars 9-13): all not '0'

    const elixir = code[0];
    const amulet = code[70];
    const armour = code.slice(71, 75);
    const blood = code.slice(75, 78);
    const spells = code.slice(14, 30);
    const weapons = code.slice(30, 70);
    const passives = code.slice(9, 14);

    // Check elixir
    if (elixir === '0' || !elixir) return false;

    // Check amulet
    if (amulet === '0' || !amulet) return false;

    // Check armour (should not be all zeros)
    if (armour.replace(/0/g, "").length === 0) return false;

    // Check blood (all 3 chars must be non-zero)
    if (blood.length !== 3 || blood.includes('0') || blood.replace(/0/g, "").length < 3) return false;

    // Check spells: dash (index 10), spell1 (index 0), spell2 (index 5), ultimate (index 15)
    if (spells.length < 16) return false;
    if (spells[0] === '0' || !spells[0]) return false; // spell1
    if (spells[5] === '0' || !spells[5]) return false; // spell2
    if (spells[10] === '0' || !spells[10]) return false; // dash
    if (spells[15] === '0' || !spells[15]) return false; // ultimate

    // Check weapons (at least one weapon slot should be filled)
    // Each weapon is 5 chars, so we check if any of the 8 weapon slots has a non-zero first char
    let hasWeapon = false;
    for (let i = 0; i < 8; i++) {
      const weaponStart = i * 5;
      if (weapons[weaponStart] && weapons[weaponStart] !== '0') {
        hasWeapon = true;
        break;
      }
    }
    if (!hasWeapon) return false;

    // Check passives (all 5 should be filled)
    if (passives.length < 5) return false;
    for (let i = 0; i < 5; i++) {
      if (passives[i] === '0' || !passives[i]) return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking build completeness:", error);
    return false;
  }
}

// Create a new build
export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name, description, code, author, authorTwitchUrl, authorYoutubeUrl, isPublic } = await request.json();

    // Only name and code are required
    if (!name || !code) {
      return NextResponse.json(
        { error: "Required fields: name, code" },
        { status: 400 }
      );
    }

    // Ensure user exists in Prisma (sync with Better Auth)
    // This handles cases where the user was created in Better Auth but sync hook failed
    if (!session.user.email) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    // Check if user exists by email (source of truth)
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    // If user exists but with different ID, migrate builds and update
    if (user && user.id !== session.user.id) {
      // Migrate all builds from old user ID to new user ID
      await prisma.build.updateMany({
        where: { userId: user.id },
        data: { userId: session.user.id },
      });

      // Migrate accounts and sessions if they exist
      await prisma.account.updateMany({
        where: { userId: user.id },
        data: { userId: session.user.id },
      });

      await prisma.session.updateMany({
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

    // Derive author from session user if not provided
    const buildAuthor = author || session.user.name || session.user.email || "Anonymous";
    const buildDescription = description || "";

    // Check if a build with the same name already exists for this user
    const existingBuild = await prisma.build.findFirst({
      where: {
        name,
        userId: userIdToUse,
      },
    });

    if (existingBuild) {
      return NextResponse.json(
        { error: "A build with this name already exists" },
        { status: 400 }
      );
    }

    // Check public build limit (5 per user) and validate empty/incomplete builds
    if (isPublic === true) {
      // Prevent making empty builds public
      if (isEmptyBuild(code)) {
        return NextResponse.json(
          { error: "Cannot make an empty build public. Please add items to your build first." },
          { status: 400 }
        );
      }

      // Prevent making incomplete builds public
      if (!isBuildComplete(code)) {
        return NextResponse.json(
          { error: "Cannot make an incomplete build public. Please fill all required slots (armour, amulet, elixir, blood, spells, weapons, and passives) first." },
          { status: 400 }
        );
      }

      const publicBuildCount = await prisma.build.count({
        where: {
          userId: userIdToUse,
          isPublic: true,
        },
      });

      if (publicBuildCount >= 5) {
        return NextResponse.json(
          { error: "You can only have 5 public builds. Please make another build private or delete a public build first." },
          { status: 400 }
        );
      }
    }

    const build = await prisma.build.create({
      data: {
        name,
        description: buildDescription,
        code,
        author: buildAuthor,
        authorTwitchUrl: authorTwitchUrl || null,
        authorYoutubeUrl: authorYoutubeUrl || null,
        isPublic: isPublic === true,
        userId: userIdToUse,
      },
    });

    // Invalidate cache for this user's builds
    revalidateTag(`builds-${userIdToUse}`);

    return NextResponse.json(build, { status: 201 });
  } catch (error: any) {
    console.error("Error creating build:", error);
    // Return more detailed error in development
    const errorMessage = process.env.NODE_ENV === "development"
      ? error?.message || String(error)
      : "Error creating build";

    return NextResponse.json(
      { error: errorMessage, details: process.env.NODE_ENV === "development" ? error : undefined },
      { status: 500 }
    );
  }
}

// List user builds
export async function GET(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Cache builds for 1 week (604800 seconds), keyed by user ID
    const getCachedBuilds = unstable_cache(
      async (userId: string) => {
        return await prisma.build.findMany({
          where: {
            userId,
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      },
      [`builds-${session.user.id}`],
      {
        tags: [`builds-${session.user.id}`],
        revalidate: 604800, // 1 week in seconds
      }
    );

    const builds = await getCachedBuilds(session.user.id);

    return NextResponse.json(builds);
  } catch (error: any) {
    console.error("Error fetching builds:", error);
    return NextResponse.json(
      { error: "Error fetching builds" },
      { status: 500 }
    );
  }
}





