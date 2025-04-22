import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, applicationDefault } from 'firebase-admin/app';

// Initialize Firebase Admin SDK
initializeApp({
  credential: applicationDefault(),
});

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await getAuth().verifyIdToken(token);
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: '/admin/:path*',
};