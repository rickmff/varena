import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Get all public builds (no authentication required)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authorFilter = searchParams.get("author");

    const builds = await prisma.build.findMany({
      where: {
        isPublic: true,
        ...(authorFilter && {
          author: {
            contains: authorFilter,
          },
        }),
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        code: true,
        author: true,
        authorTwitchUrl: true,
        authorYoutubeUrl: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
    });

    return NextResponse.json(builds);
  } catch (error: any) {
    console.error("Error fetching public builds:", error);
    return NextResponse.json(
      { error: "Error fetching public builds" },
      { status: 500 }
    );
  }
}

