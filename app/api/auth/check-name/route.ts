import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        name: name,
      },
    });

    return NextResponse.json({ available: !existingUser });
  } catch (error) {
    console.error("Error checking name availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

