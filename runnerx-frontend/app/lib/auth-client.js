import { COOKIE_NAME } from './constants';

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
