import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/better-auth/server";
import prisma from "@/lib/prisma";

export async function PUT(request: Request) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  if (typeof body.profilePublic !== "boolean") {
    return NextResponse.json({ error: "Invalid value" }, { status: 400 });
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data: { profilePublic: body.profilePublic },
  });

  return NextResponse.json({ success: true });
}
