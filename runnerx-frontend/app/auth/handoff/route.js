import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ALLOWED_ORIGINS } from '@/app/lib/origin';
import { COOKIE_NAME, ORIGIN_COOKIE_NAME } from '@/app/lib/constants';

/**
 * Auth Handoff Route Handler
 * 
 * Sets authentication and origin cookies from URL parameters and redirects to the dashboard.
 * URL pattern: /auth/handoff?token=xxx&origin=KTA
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const origin = searchParams.get('origin');

  if (!token) {
    redirect('/login');
  }

  // Validate origin code
  const safeOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : null;

  const cookieStore = await cookies();

  // Set the auth cookie
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  // Store the origin site (only if valid)
  if (safeOrigin) {
    cookieStore.set(ORIGIN_COOKIE_NAME, safeOrigin, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
  }

  // Redirect to dashboard (specifically the register page as per recent requirements)
  redirect('/dashboard/register');
}
