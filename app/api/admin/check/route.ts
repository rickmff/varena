import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/better-auth/server";
import { isAdmin } from "@/lib/utils/admin";

// GET /api/admin/check - Check if current user is admin
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ isAdmin: false }, { status: 200 });
    }

    const adminStatus = isAdmin(session);

    return NextResponse.json({ isAdmin: adminStatus });
  } catch {
    return NextResponse.json({ isAdmin: false }, { status: 200 });
  }
}
