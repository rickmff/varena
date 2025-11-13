import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/better-auth/auth';

export async function middleware(request: NextRequest) {
  // Verify session using Better Auth
  const cookieHeader = request.headers.get('cookie') || '';
  const session = await auth.api.getSession({
    headers: {
      cookie: cookieHeader,
    },
  });

  // List of protected routes that require authentication
  // Note: /builds/create is accessible anonymously, but saving requires auth
  const protectedRoutes = [
    '/admin',
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
  matcher: ['/admin/:path*', '/profile/:path*'],
};