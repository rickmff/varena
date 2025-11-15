import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/better-auth/server";
import prisma from "@/lib/prisma";
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

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Atualizar uma build
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { name, description, code, author, authorTwitchUrl, authorYoutubeUrl, isPublic } = await request.json();

    // Verificar se a build pertence ao usuário
    const existingBuild = await prisma.build.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingBuild) {
      return NextResponse.json(
        { error: "Build não encontrada ou não autorizado" },
        { status: 404 }
      );
    }

    // Check public build limit when changing from private to public
    const willBePublic = isPublic !== undefined ? isPublic : existingBuild.isPublic;
    if (willBePublic && !existingBuild.isPublic) {
      // Use the code from the request if provided, otherwise use existing build code
      const buildCodeToCheck = code !== undefined ? code : existingBuild.code;

      // Prevent making empty builds public
      if (isEmptyBuild(buildCodeToCheck)) {
        return NextResponse.json(
          { error: "Cannot make an empty build public. Please add items to your build first." },
          { status: 400 }
        );
      }

      // Prevent making incomplete builds public
      if (!isBuildComplete(buildCodeToCheck)) {
        return NextResponse.json(
          { error: "Cannot make an incomplete build public. Please fill all required slots (armour, amulet, elixir, blood, spells, weapons, and passives) first." },
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
          { error: "You can only have 5 public builds. Please make another build private or delete a public build first." },
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

    // Invalidate cache when public/private status changes (or any update)
    // This ensures the cache is refreshed when builds are modified
    revalidateTag(`builds-${session.user.id}`);

    return NextResponse.json(build);
  } catch (error: any) {
    console.error("Error updating build:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar build" },
      { status: 500 }
    );
  }
}

// Deletar uma build
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verificar se a build pertence ao usuário
    const existingBuild = await prisma.build.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingBuild) {
      return NextResponse.json(
        { error: "Build não encontrada ou não autorizado" },
        { status: 404 }
      );
    }

    await prisma.build.delete({
      where: { id },
    });

    // Invalidate cache for this user's builds
    revalidateTag(`builds-${session.user.id}`);

    return NextResponse.json({ message: "Build deletada com sucesso" });
  } catch (error: any) {
    console.error("Error deleting build:", error);
    return NextResponse.json(
      { error: "Erro ao deletar build" },
      { status: 500 }
    );
  }
}





