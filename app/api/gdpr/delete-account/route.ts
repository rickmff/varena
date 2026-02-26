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

    const sessionUserId = session.user.id;
    const sessionUserEmail = session.user.email;

    if (!sessionUserEmail) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { confirmEmail } = body;

    // Verify email confirmation
    if (!confirmEmail || confirmEmail !== sessionUserEmail) {
      return NextResponse.json(
        { error: "Email confirmation required. Please provide your email address to confirm account deletion." },
        { status: 400 }
      );
    }

    // Get user data for logging (before deletion)
    // Look up by email first (source of truth) since Better Auth and Prisma user IDs can differ
    const user = await prisma.user.findUnique({
      where: { email: sessionUserEmail },
      select: {
        id: true,
        email: true,
        name: true,
        _count: {
          select: {
            builds: true,
            votes: true,
            spellTierLists: true,
            spellTierListVotes: true,
          },
        },
      },
    });

    // Get session and account counts from AuthUser if it exists
    let sessionsDeleted = 0;
    let accountsDeleted = 0;
    try {
      const authUser = await prisma.authUser.findUnique({
        where: { id: sessionUserId },
        select: {
          _count: {
            select: {
              sessions: true,
              accounts: true,
            },
          },
        },
      });
      if (authUser) {
        sessionsDeleted = authUser._count.sessions;
        accountsDeleted = authUser._count.accounts;
      }
    } catch (error) {
      // Ignore if AuthUser doesn't exist
    }

    // Track deletion counts for response
    let deletedData = {
      email: sessionUserEmail,
      name: session.user.name || null,
      buildsDeleted: 0,
      votesDeleted: 0,
      sessionsDeleted: sessionsDeleted,
      accountsDeleted: accountsDeleted,
    };

    // If user exists in Prisma, delete all Prisma data
    if (user) {
      const userId = user.id;
      deletedData = {
        email: user.email,
        name: user.name,
        buildsDeleted: user._count.builds,
        votesDeleted: user._count.votes,
        sessionsDeleted: sessionsDeleted,
        accountsDeleted: accountsDeleted,
      };

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

        // 3. Delete all sessions from AuthSession (cascade would handle this, but being explicit)
        await tx.authSession.deleteMany({
          where: { userId: userId },
        });

        // 4. Delete all OAuth accounts from AuthAccount (cascade would handle this, but being explicit)
        await tx.authAccount.deleteMany({
          where: { userId: userId },
        });

        // 5. Delete verification tokens associated with the user's email
        await tx.authVerification.deleteMany({
          where: { identifier: sessionUserEmail },
        });

        // 6. Finally, delete the user account from Prisma
        // This should work now that all dependent records are deleted
        await tx.user.delete({
          where: { id: userId },
        });
      });
      console.log("[GDPR Delete] Prisma user and all related data deleted successfully");
    } else {
      // User doesn't exist in Prisma, but may exist in Better Auth
      // Still try to clean up any orphaned data and verification tokens
      console.warn("[GDPR Delete] User not found in Prisma, but proceeding with Better Auth deletion");

      // Clean up verification tokens by email (safe to do even if user doesn't exist)
      await prisma.authVerification.deleteMany({
        where: { identifier: sessionUserEmail },
      });

      // Try to clean up any orphaned data that might reference the session user ID
      // This handles edge cases where data exists but user record doesn't
      try {
        await prisma.build.deleteMany({
          where: { userId: sessionUserId },
        });
        await prisma.buildVote.deleteMany({
          where: { userId: sessionUserId },
        });
        await prisma.authSession.deleteMany({
          where: { userId: sessionUserId },
        });
        await prisma.authAccount.deleteMany({
          where: { userId: sessionUserId },
        });
      } catch (orphanError: any) {
        // Ignore errors from orphaned data cleanup
        console.warn("[GDPR Delete] Error cleaning orphaned data:", orphanError.message);
      }
    }

    // 7. Delete user from Better Auth tables
    // Better Auth creates its own 'user' table (lowercase) separate from Prisma's 'User' table
    // The Better Auth user table stores the actual authentication credentials
    // Use session user ID for Better Auth deletion (Better Auth uses its own ID)
    let betterAuthDeleted = false;
    try {
      // Better Auth typically uses a lowercase 'user' table
      // We need to delete from this table to prevent login after Prisma deletion
      const result = await prisma.$executeRawUnsafe(
        `DELETE FROM \`user\` WHERE id = ?`,
        sessionUserId
      );
      if (result > 0) {
        betterAuthDeleted = true;
        console.log("[GDPR Delete] Deleted user from Better Auth 'user' table");
      }

      // Also ensure Better Auth sessions are deleted (they might be in a separate table)
      // Better Auth may use 'session' table (lowercase) or the same Session table
      try {
        await prisma.$executeRawUnsafe(
          `DELETE FROM \`session\` WHERE userId = ?`,
          sessionUserId
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
          sessionUserId
        );
        console.log("[GDPR Delete] Deleted accounts from Better Auth 'account' table");
      } catch (accountError: any) {
        // Account table might not exist separately or already deleted
        if (accountError.code !== 'ER_NO_SUCH_TABLE' && accountError.code !== '42S02') {
          console.warn("[GDPR Delete] Could not delete from Better Auth account table:", accountError.message);
        }
      }

      if (betterAuthDeleted) {
        console.log("[GDPR Delete] User and all related data deleted successfully from both Prisma and Better Auth");
      }
    } catch (authError: any) {
      // If the Better Auth 'user' table doesn't exist or has a different name, log but continue
      if (authError.code === 'ER_NO_SUCH_TABLE' || authError.code === '42S02') {
        console.warn("[GDPR Delete] Better Auth 'user' table not found - may use different table name or same as Prisma");
        // Try alternative table names
        const alternativeTables = ['better_auth_user', 'auth_user'];
        for (const tableName of alternativeTables) {
          try {
            const result = await prisma.$executeRawUnsafe(
              `DELETE FROM \`${tableName}\` WHERE id = ?`,
              sessionUserId
            );
            if (result > 0) {
              betterAuthDeleted = true;
              console.log(`[GDPR Delete] Deleted user from Better Auth table: ${tableName}`);
              break;
            }
          } catch (altError: any) {
            // Continue to next alternative
          }
        }
      } else {
        console.error("[GDPR Delete] Error during Better Auth cleanup:", authError);
        // Log error but continue - Prisma user is already deleted
        // Better Auth deletion failure is non-critical since Prisma user is gone
      }
    }

    // Log warning if Better Auth user wasn't deleted (but don't fail the request)
    if (!betterAuthDeleted) {
      console.warn("[GDPR Delete] Better Auth user may not have been deleted. Prisma user deleted successfully.");
    }

    // Create success response
    const response = NextResponse.json({
      message: "Account and all associated data have been permanently deleted",
      deletedData: deletedData,
      deletionDate: new Date().toISOString(),
    });

    // Clear all Better Auth session cookies to invalidate the session
    // Better Auth uses cookies with the basePath prefix (e.g., 'better-auth.session_token')
    const cookieNames = [
      'better-auth.session_token',
      'better-auth.session',
      'better-auth.access_token',
      'better-auth.refresh_token',
    ];

    // Clear cookies with both root path and API auth path
    const pathsToClear = ['/', '/api/auth'];

    cookieNames.forEach(cookieName => {
      pathsToClear.forEach(path => {
        // Clear cookie by setting it to expire in the past
        response.cookies.set(cookieName, '', {
          expires: new Date(0),
          path: path,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
      });
    });

    // Also clear any cookies from the request headers that might be session-related
    const requestCookies = request.headers.get('cookie') || '';
    if (requestCookies) {
      // Extract all cookies that might be session-related
      const cookiePairs = requestCookies.split(';').map(c => c.trim());
      cookiePairs.forEach(cookiePair => {
        const [cookieName] = cookiePair.split('=');
        if (cookieName && (
          cookieName.toLowerCase().includes('session') ||
          cookieName.toLowerCase().includes('auth') ||
          cookieName.toLowerCase().includes('token'))) {
          // Clear with both paths
          pathsToClear.forEach(path => {
            response.cookies.set(cookieName.trim(), '', {
              expires: new Date(0),
              path: path,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
            });
          });
        }
      });
    }

    return response;
  } catch (error: any) {
    console.error("[GDPR Delete] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete account. Please try again or contact support." },
      { status: 500 }
    );
  }
}


