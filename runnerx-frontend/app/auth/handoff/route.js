import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ALLOWED_ORIGINS } from '@/app/lib/origin';
import { COOKIE_NAME, ORIGIN_COOKIE_NAME } from '@/app/lib/constants';
import { resolvePostLoginUrl } from '@/app/lib/post-login-redirect';

/**
 * Auth Handoff Route Handler
 *
 * Sets authentication and origin cookies from URL parameters and redirects to the dashboard.
 * URL pattern: /auth/handoff?token=xxx&origin=KTA
 *
 * Kept for backwards compatibility with city sites that still post tokens by URL.
 * The new login flow lives at /login on this same host and sets cookies directly.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const origin = searchParams.get('origin');

  if (!token) {
    redirect('/login');
  }

  const safeOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : null;

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  if (safeOrigin) {
    cookieStore.set(ORIGIN_COOKIE_NAME, safeOrigin, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
  }

  const redirectUrl = await resolvePostLoginUrl(safeOrigin);
  redirect(redirectUrl);
}
