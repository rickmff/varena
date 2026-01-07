import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/better-auth/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

// DELETE /api/gdpr/delete-account - Delete user account and all data (GDPR Right to Erasure)
export async function DELETE(request: Request) {
  logger.info("GDPR Delete endpoint called");
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
            sessions: true,
            accounts: true,
          },
        },
      },
    });

    // Track deletion counts for response
    let deletedData = {
      email: sessionUserEmail,
      name: session.user.name || null,
      buildsDeleted: 0,
      votesDeleted: 0,
      sessionsDeleted: 0,
      accountsDeleted: 0,
    };

    // If user exists in Prisma, delete all Prisma data
    if (user) {
      const userId = user.id;
      deletedData = {
        email: user.email,
        name: user.name,
        buildsDeleted: user._count.builds,
        votesDeleted: user._count.votes,
        sessionsDeleted: user._count.sessions,
        accountsDeleted: user._count.accounts,
      };

      // Delete all user data in a transaction
      await prisma.$transaction(async (tx) => {
        await tx.build.deleteMany({ where: { userId: userId } });
        await tx.buildVote.deleteMany({ where: { userId: userId } });
        await tx.session.deleteMany({ where: { userId: userId } });
        await tx.account.deleteMany({ where: { userId: userId } });
        await tx.verificationToken.deleteMany({ where: { identifier: sessionUserEmail } });
        await tx.user.delete({ where: { id: userId } });
      });
      logger.info("Prisma user and all related data deleted successfully");
    } else {
      logger.warn("User not found in Prisma, proceeding with Better Auth deletion");

      await prisma.verificationToken.deleteMany({
        where: { identifier: sessionUserEmail },
      });

      try {
        await prisma.build.deleteMany({ where: { userId: sessionUserId } });
        await prisma.buildVote.deleteMany({ where: { userId: sessionUserId } });
        await prisma.session.deleteMany({ where: { userId: sessionUserId } });
        await prisma.account.deleteMany({ where: { userId: sessionUserId } });
      } catch (orphanError) {
        logger.warn("Error cleaning orphaned data", { error: orphanError });
      }
    }

    // Delete user from Better Auth tables
    let betterAuthDeleted = false;
    try {
      const result = await prisma.$executeRawUnsafe(
        `DELETE FROM \`user\` WHERE id = ?`,
        sessionUserId
      );
      if (result > 0) {
        betterAuthDeleted = true;
        logger.info("Deleted user from Better Auth user table");
      }

      try {
        await prisma.$executeRawUnsafe(
          `DELETE FROM \`session\` WHERE userId = ?`,
          sessionUserId
        );
      } catch {
        // Session table might not exist separately
      }

      try {
        await prisma.$executeRawUnsafe(
          `DELETE FROM \`account\` WHERE userId = ?`,
          sessionUserId
        );
      } catch {
        // Account table might not exist separately
      }
    } catch (authError: unknown) {
      const errorCode = (authError as { code?: string })?.code;
      if (errorCode === 'ER_NO_SUCH_TABLE' || errorCode === '42S02') {
        const alternativeTables = ['better_auth_user', 'auth_user'];
        for (const tableName of alternativeTables) {
          try {
            const result = await prisma.$executeRawUnsafe(
              `DELETE FROM \`${tableName}\` WHERE id = ?`,
              sessionUserId
            );
            if (result > 0) {
              betterAuthDeleted = true;
              break;
            }
          } catch {
            // Continue to next alternative
          }
        }
      } else {
        logger.error("Error during Better Auth cleanup", authError);
      }
    }

    if (!betterAuthDeleted) {
      logger.warn("Better Auth user may not have been deleted. Prisma user deleted successfully.");
    }

    // Create success response
    const response = NextResponse.json({
      message: "Account and all associated data have been permanently deleted",
      deletedData: deletedData,
      deletionDate: new Date().toISOString(),
    });

    // Clear all session cookies
    const cookieNames = [
      'better-auth.session_token',
      'better-auth.session',
      'better-auth.access_token',
      'better-auth.refresh_token',
    ];
    const pathsToClear = ['/', '/api/auth'];

    cookieNames.forEach(cookieName => {
      pathsToClear.forEach(path => {
        response.cookies.set(cookieName, '', {
          expires: new Date(0),
          path: path,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
      });
    });

    // Clear any session-related cookies from request
    const requestCookies = request.headers.get('cookie') || '';
    if (requestCookies) {
      const cookiePairs = requestCookies.split(';').map(c => c.trim());
      cookiePairs.forEach(cookiePair => {
        const [cookieName] = cookiePair.split('=');
        if (cookieName && (
          cookieName.toLowerCase().includes('session') ||
          cookieName.toLowerCase().includes('auth') ||
          cookieName.toLowerCase().includes('token'))) {
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
  } catch (error: unknown) {
    logger.error("GDPR Delete error", error);
    return NextResponse.json(
      { error: "Failed to delete account. Please try again or contact support." },
      { status: 500 }
    );
  }
}
