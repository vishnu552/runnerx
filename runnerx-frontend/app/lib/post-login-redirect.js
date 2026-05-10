import { ALLOWED_ORIGINS, SITE_CONFIG } from './origin';
import { getActiveEvent } from './api';

export function isAllowedRedirectUrl(url) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const allowedHosts = Object.values(SITE_CONFIG)
      .map((s) => {
        try {
          return new URL(s.url).host;
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    return allowedHosts.includes(parsed.host);
  } catch {
    return false;
  }
}

export async function resolvePostLoginUrl(originCode, redirectParam = null) {
  if (redirectParam && isAllowedRedirectUrl(redirectParam)) {
    return redirectParam;
  }

  const safeOrigin = ALLOWED_ORIGINS.includes(originCode) ? originCode : null;
  if (!safeOrigin) {
    return '/dashboard/register';
  }

  try {
    const activeEvent = await getActiveEvent(safeOrigin);
    if (activeEvent && activeEvent.status === 'PUBLISHED') {
      const registrationEnd = new Date(activeEvent.registrationEnd);
      if (new Date() <= registrationEnd) {
        return `/dashboard/event-register/${activeEvent.id}`;
      }
    }
  } catch (error) {
    console.error('Error resolving post-login URL:', error);
  }

  return '/dashboard/register';
}
