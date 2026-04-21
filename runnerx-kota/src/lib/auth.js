import { cookies } from 'next/headers';
import { API_URL } from './api';

const COOKIE_NAME = 'runnerx-user-token';

/**
 * Stores the authentication token securely in the frontend.
 */
export async function setSessionToken(token) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: false, // Set to false so client-side can read it for direct API calls
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Client-side helper to get the token (since 'cookies()' only works on server)
 */
export function getSessionTokenClient() {
  if (typeof window === 'undefined') return null;
  const name = COOKIE_NAME + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
}

/**
 * Removes the authentication token from the frontend.
 */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

/**
 * Fetches the currently authenticated user from the backend.
 * @returns {Promise<Object|null>} The user object or null if not authenticated
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store' // Always fetch fresh user data
    });

    if (!res.ok) {
      // If unauthorized, token is likely invalid or expired
      if (res.status === 401) {
        await destroySession();
      }
      return null;
    }

    const data = await res.json();
    if (!data.success || !data.user) {
      return null;
    }

    // Frontend must stay user-only; admin tokens are not kept in this app.
    if (data.user.role !== 'USER') {
      await destroySession();
      return null;
    }

    return data.user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}
