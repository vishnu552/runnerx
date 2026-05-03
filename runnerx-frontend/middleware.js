import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('runnerx-user-token')?.value;
  const { pathname } = request.nextUrl;

  const protectedRoutes = ['/dashboard'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  // If accessing a protected route without a token, redirect to login fallback
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
};
