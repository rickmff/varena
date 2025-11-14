import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/better-auth/server";
import prisma from "@/lib/prisma";

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

    return NextResponse.json({ message: "Build deletada com sucesso" });
  } catch (error: any) {
    console.error("Error deleting build:", error);
    return NextResponse.json(
      { error: "Erro ao deletar build" },
      { status: 500 }
    );
  }
}





