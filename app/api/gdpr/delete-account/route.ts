import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/better-auth/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/better-auth/auth";

// DELETE /api/gdpr/delete-account - Delete user account and all data (GDPR Right to Erasure)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json().catch(() => ({}));
    const { confirmEmail } = body;

    // Verify email confirmation
    if (!confirmEmail || confirmEmail !== session.user.email) {
      return NextResponse.json(
        { error: "Email confirmation required. Please provide your email address to confirm account deletion." },
        { status: 400 }
      );
    }

    // Get user data for logging (before deletion)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        _count: {
          select: {
            builds: true,
            votes: true,
            sessions: true,
            accounts: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete all user data (cascade will handle related records)
    // This will delete:
    // - User account
    // - All builds (cascade)
    // - All votes (cascade)
    // - All sessions (cascade)
    // - All OAuth accounts (cascade)
    await prisma.user.delete({
      where: { id: userId },
    });

    // Also invalidate all sessions in Better Auth
    try {
      // Sign out from Better Auth
      // The session will be invalidated when the user record is deleted
      // Better Auth should handle this automatically via database triggers
    } catch (authError) {
      console.error("[GDPR Delete] Error invalidating auth sessions:", authError);
      // Continue with deletion even if auth cleanup fails
    }

    // Return success response
    return NextResponse.json({
      message: "Account and all associated data have been permanently deleted",
      deletedData: {
        email: user.email,
        name: user.name,
        buildsDeleted: user._count.builds,
        votesDeleted: user._count.votes,
        sessionsDeleted: user._count.sessions,
        accountsDeleted: user._count.accounts,
      },
      deletionDate: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[GDPR Delete] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete account. Please try again or contact support." },
      { status: 500 }
    );
  }
}

