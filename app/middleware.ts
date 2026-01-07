import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/better-auth/auth';
import { isAdminEmail } from '@/lib/utils/admin';

// Routes that require admin access
const ADMIN_ROUTES = ['/capybara', '/database'];

// Routes that require authentication
const PROTECTED_ROUTES = ['/profile'];

// Auth routes that authenticated users should not access
const AUTH_ROUTES = ['/auth/signin', '/auth/signup', '/auth/reset'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check route types
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

  // Only fetch session if the route actually needs it
  // This reduces unnecessary database calls for public routes
  if (!isAdminRoute && !isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  // Verify session using Better Auth
  const cookieHeader = request.headers.get('cookie') || '';
  const session = await auth.api.getSession({
    headers: {
      cookie: cookieHeader,
    },
  });

  // Handle auth routes - redirect authenticated users away
  if (isAuthRoute && session?.user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Handle admin routes
  if (isAdminRoute) {
    if (!session?.user) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname + request.nextUrl.search);
      return NextResponse.redirect(signInUrl);
    }

    if (!isAdminEmail(session.user.email)) {
      const errorUrl = new URL('/auth/error', request.url);
      errorUrl.searchParams.set('error', 'AccessDenied');
      return NextResponse.redirect(errorUrl);
    }
  }

  // Handle protected routes
  if (isProtectedRoute && !session?.user) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname + request.nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Admin routes
    '/capybara/:path*',
    '/database/:path*',
    // Protected routes
    '/profile/:path*',
    // Auth routes
    '/auth/signin',
    '/auth/signup',
    '/auth/reset',
    '/auth/reset/:path*',
  ],
};
