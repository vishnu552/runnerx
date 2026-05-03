import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('runnerx-user-token')?.value;
  const { pathname } = request.nextUrl;

  const authRoutes = ['/auth', '/login', '/register', '/auth/forgot-password', '/auth/reset-password'];
  const protectedRoutes = ['/dashboard', '/event-register'];

  // Check if exactly matching or a subpath (e.g. /dashboard/profile)
  const isAuthRoute = authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3002';

  // 1. Redirect ALL /dashboard traffic to the shared dashboard
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    return NextResponse.redirect(new URL(dashboardUrl + pathname));
  }

  // 2. Local protection for registration (must have token to register)
  if (pathname.startsWith('/event-register') && !token) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // 3. If logged in, redirect away from auth pages to shared dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL(dashboardUrl + '/dashboard'));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
