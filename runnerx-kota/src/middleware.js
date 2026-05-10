import { NextResponse } from 'next/server';

const DASHBOARD_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3002';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Forward leftover legacy traffic to the shared dashboard.
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    return NextResponse.redirect(new URL(DASHBOARD_URL + pathname));
  }
  if (pathname === '/event-register' || pathname.startsWith('/event-register/')) {
    return NextResponse.redirect(new URL(`${DASHBOARD_URL}/dashboard${pathname}`));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
