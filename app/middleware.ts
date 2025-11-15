import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/better-auth/auth';
import { isAdminEmail } from '@/lib/utils/admin';

export async function middleware(request: NextRequest) {
  // Verify session using Better Auth
  const cookieHeader = request.headers.get('cookie') || '';
  const session = await auth.api.getSession({
    headers: {
      cookie: cookieHeader,
    },
  });

  // Check if user is banned
  if (session?.user) {
    // We need to check the database for banned status
    // For now, we'll check this in the API routes
    // The banned check will be more effective at the API level
  }

  // Check if accessing admin routes
  const isAdminRoute = request.nextUrl.pathname.startsWith('/capibara');

  if (isAdminRoute) {
    // Admin routes require authentication
    if (!session?.user) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(signInUrl);
    }

    // Admin routes require admin status
    if (!isAdminEmail(session.user.email)) {
      const errorUrl = new URL('/auth/error', request.url);
      errorUrl.searchParams.set('error', 'AccessDenied');
      return NextResponse.redirect(errorUrl);
    }
  }

  // List of protected routes that require authentication
  // Note: /builds/create is accessible anonymously, but saving requires auth
  const protectedRoutes = [
    '/profile',
  ];

  // Check if current route requires authentication
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !session?.user) {
    // Create redirect URL with callbackUrl
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/capibara/:path*', '/profile/:path*'],
};