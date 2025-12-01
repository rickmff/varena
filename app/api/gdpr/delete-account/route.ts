import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/better-auth/server";
import prisma from "@/lib/prisma";

// DELETE /api/gdpr/delete-account - Delete user account and all data (GDPR Right to Erasure)
export async function DELETE(request: Request) {
  console.log("[GDPR Delete] DELETE endpoint called");
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

    // Delete all user data in a transaction to ensure atomicity
    // Order matters: delete dependent records first, then the user
    await prisma.$transaction(async (tx) => {
      // 1. Delete all builds owned by the user
      // Build has onDelete: SetNull, so we need to delete explicitly
      // This will also cascade delete votes on those builds
      await tx.build.deleteMany({
        where: { userId: userId },
      });

      // 2. Delete any remaining votes by the user (on other users' builds)
      // These won't be deleted by build cascade since they're on different builds
      await tx.buildVote.deleteMany({
        where: { userId: userId },
      });

      // 3. Delete all sessions (cascade would handle this, but being explicit)
      await tx.session.deleteMany({
        where: { userId: userId },
      });

      // 4. Delete all OAuth accounts (cascade would handle this, but being explicit)
      await tx.account.deleteMany({
        where: { userId: userId },
      });

      // 5. Finally, delete the user account from Prisma
      // This should work now that all dependent records are deleted
      await tx.user.delete({
        where: { id: userId },
      });
    });

    // 6. Delete user from Better Auth tables
    // Better Auth creates its own 'user' table (lowercase) separate from Prisma's 'User' table
    // The Better Auth user table stores the actual authentication credentials
    try {
      // Better Auth typically uses a lowercase 'user' table
      // We need to delete from this table to prevent login after Prisma deletion
      await prisma.$executeRawUnsafe(
        `DELETE FROM \`user\` WHERE id = ?`,
        userId
      );
      console.log("[GDPR Delete] Deleted user from Better Auth 'user' table");

      // Also ensure Better Auth sessions are deleted (they might be in a separate table)
      // Better Auth may use 'session' table (lowercase) or the same Session table
      try {
        await prisma.$executeRawUnsafe(
          `DELETE FROM \`session\` WHERE userId = ?`,
          userId
        );
        console.log("[GDPR Delete] Deleted sessions from Better Auth 'session' table");
      } catch (sessionError: any) {
        // Session table might not exist separately or already deleted
        if (sessionError.code !== 'ER_NO_SUCH_TABLE' && sessionError.code !== '42S02') {
          console.warn("[GDPR Delete] Could not delete from Better Auth session table:", sessionError.message);
        }
      }

      // Also delete from Better Auth account table if it exists separately
      try {
        await prisma.$executeRawUnsafe(
          `DELETE FROM \`account\` WHERE userId = ?`,
          userId
        );
        console.log("[GDPR Delete] Deleted accounts from Better Auth 'account' table");
      } catch (accountError: any) {
        // Account table might not exist separately or already deleted
        if (accountError.code !== 'ER_NO_SUCH_TABLE' && accountError.code !== '42S02') {
          console.warn("[GDPR Delete] Could not delete from Better Auth account table:", accountError.message);
        }
      }

      console.log("[GDPR Delete] User and all related data deleted successfully from both Prisma and Better Auth");
    } catch (authError: any) {
      // If the Better Auth 'user' table doesn't exist or has a different name, log but continue
      if (authError.code === 'ER_NO_SUCH_TABLE' || authError.code === '42S02') {
        console.warn("[GDPR Delete] Better Auth 'user' table not found - may use different table name or same as Prisma");
        // Try alternative table names
        const alternativeTables = ['better_auth_user', 'auth_user'];
        for (const tableName of alternativeTables) {
          try {
            await prisma.$executeRawUnsafe(
              `DELETE FROM \`${tableName}\` WHERE id = ?`,
              userId
            );
            console.log(`[GDPR Delete] Deleted user from Better Auth table: ${tableName}`);
            break;
          } catch (altError: any) {
            // Continue to next alternative
          }
        }
      } else {
        console.error("[GDPR Delete] Error during Better Auth cleanup:", authError);
        // Continue - Prisma user is already deleted
      }
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

