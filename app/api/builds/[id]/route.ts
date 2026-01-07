import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/better-auth/server";
import prisma from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { isValidEnglishAlphabet } from "@/lib/utils";
import { logger } from "@/lib/logger";

// Helper function to check if a build code is empty
function isEmptyBuild(code: string): boolean {
  if (!code || typeof code !== "string") return true;
  return code.replace(/0/g, "").trim().length === 0;
}

// Helper function to check if a build is complete
function isBuildComplete(code: string): boolean {
  if (!code || typeof code !== "string" || code.length < 78) return false;

  try {
    const elixir = code[0];
    const amulet = code[70];
    const armour = code.slice(71, 75);
    const blood = code.slice(75, 78);
    const spells = code.slice(14, 30);
    const weapons = code.slice(30, 70);
    const passives = code.slice(9, 14);

    if (elixir === '0' || !elixir) return false;
    if (amulet === '0' || !amulet) return false;
    if (armour.replace(/0/g, "").length === 0) return false;
    if (blood.length !== 3 || blood.includes('0') || blood.replace(/0/g, "").length < 3) return false;

    if (spells.length < 16) return false;
    if (spells[0] === '0' || !spells[0]) return false;
    if (spells[5] === '0' || !spells[5]) return false;
    if (spells[10] === '0' || !spells[10]) return false;
    if (spells[15] === '0' || !spells[15]) return false;

    let hasWeapon = false;
    for (let i = 0; i < 8; i++) {
      const weaponStart = i * 5;
      if (weapons[weaponStart] && weapons[weaponStart] !== '0') {
        hasWeapon = true;
        break;
      }
    }
    if (!hasWeapon) return false;

    if (passives.length < 5) return false;
    for (let i = 0; i < 5; i++) {
      if (passives[i] === '0' || !passives[i]) return false;
    }

    return true;
  } catch (error) {
    logger.error("Error checking build completeness", error);
    return false;
  }
}

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Update a build
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { name, description, code, author, authorTwitchUrl, authorYoutubeUrl, isPublic } = await request.json();

    // Validate name
    if (name !== undefined && name !== null && name.trim() && !isValidEnglishAlphabet(name.trim())) {
      return NextResponse.json(
        { error: "Build name can only contain English alphabet characters, numbers, and spaces" },
        { status: 400 }
      );
    }

    // Validate description
    if (description !== undefined && description !== null && description.trim() && !isValidEnglishAlphabet(description.trim())) {
      return NextResponse.json(
        { error: "Build description can only contain English alphabet characters, numbers, and spaces" },
        { status: 400 }
      );
    }

    // Verify build belongs to user
    const existingBuild = await prisma.build.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingBuild) {
      return NextResponse.json(
        { error: "Build not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check public build limit when changing from private to public
    const willBePublic = isPublic !== undefined ? isPublic : existingBuild.isPublic;
    if (willBePublic && !existingBuild.isPublic) {
      const buildCodeToCheck = code !== undefined ? code : existingBuild.code;

      if (isEmptyBuild(buildCodeToCheck)) {
        return NextResponse.json(
          { error: "Cannot make an empty build public. Please add items to your build first." },
          { status: 400 }
        );
      }

      if (!isBuildComplete(buildCodeToCheck)) {
        return NextResponse.json(
          { error: "Cannot make an incomplete build public. Please fill all required slots first." },
          { status: 400 }
        );
      }

      const publicBuildCount = await prisma.build.count({
        where: {
          userId: session.user.id,
          isPublic: true,
        },
      });

      if (publicBuildCount >= 5) {
        return NextResponse.json(
          { error: "You can only have 5 public builds. Please make another build private first." },
          { status: 400 }
        );
      }
    }

    const build = await prisma.build.update({
      where: { id },
      data: {
        name: name || existingBuild.name,
        description: description || existingBuild.description,
        code: code || existingBuild.code,
        author: author || existingBuild.author,
        authorTwitchUrl: authorTwitchUrl !== undefined ? authorTwitchUrl : existingBuild.authorTwitchUrl,
        authorYoutubeUrl: authorYoutubeUrl !== undefined ? authorYoutubeUrl : existingBuild.authorYoutubeUrl,
        isPublic: isPublic !== undefined ? isPublic : existingBuild.isPublic,
      },
    });

    // Invalidate caches
    revalidateTag(`builds-${session.user.id}`);
    if (isPublic !== undefined && isPublic !== existingBuild.isPublic) {
      revalidateTag("public-builds");
    }

    return NextResponse.json(build);
  } catch (error) {
    logger.error("Error updating build", error);
    return NextResponse.json(
      { error: "Error updating build" },
      { status: 500 }
    );
  }
}

// Delete a build
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify build belongs to user
    const existingBuild = await prisma.build.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingBuild) {
      return NextResponse.json(
        { error: "Build not found or unauthorized" },
        { status: 404 }
      );
    }

    const wasPublic = existingBuild.isPublic;

    await prisma.build.delete({
      where: { id },
    });

    // Invalidate caches
    revalidateTag(`builds-${session.user.id}`);
    if (wasPublic) {
      revalidateTag("public-builds");
    }

    return NextResponse.json({ message: "Build deleted successfully" });
  } catch (error) {
    logger.error("Error deleting build", error);
    return NextResponse.json(
      { error: "Error deleting build" },
      { status: 500 }
    );
  }
}
