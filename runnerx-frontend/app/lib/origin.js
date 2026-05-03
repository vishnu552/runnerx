/**
 * Origin detection and site mapping utilities.
 * Used to track which city site the user came from.
 */

export const ALLOWED_ORIGINS = ['KTA', 'JDH', 'UDP'];

export const SITE_CONFIG = {
  KTA: {
    code: 'KTA',
    name: 'Kota',
    fullName: 'Kota Half Marathon',
    url: process.env.NEXT_PUBLIC_ORIGIN_KTA || 'http://localhost:3000',
  },
  JDH: {
    code: 'JDH',
    name: 'Jodhpur',
    fullName: 'Jodhpur Half Marathon',
    url: process.env.NEXT_PUBLIC_ORIGIN_JDH || 'http://localhost:3003',
  },
  UDP: {
    code: 'UDP',
    name: 'Udaipur',
    fullName: 'Udaipur Half Marathon',
    url: process.env.NEXT_PUBLIC_ORIGIN_UDP || 'http://localhost:3004',
  },
};

export function getOriginConfig(originCode) {
  return SITE_CONFIG[originCode] || null;
}

export function getCityFromCode(code) {
  return SITE_CONFIG[code]?.name || code;
}

/**
 * Server-side: read origin from cookies
 */
export async function getOriginFromCookies() {
  const { cookies } = await import('next/headers');
  const { ORIGIN_COOKIE_NAME } = await import('./constants');
  const cookieStore = await cookies();
  const origin = cookieStore.get(ORIGIN_COOKIE_NAME)?.value || null;
  return {
    code: origin,
    config: origin ? getOriginConfig(origin) : null,
  };
}

/**
 * Get the registration URL for an event based on its siteFor code.
 * Since registration stays on city sites, we link to the correct city site.
 */
export function getRegistrationUrl(event) {
  const siteConfig = SITE_CONFIG[event.siteFor];
  if (!siteConfig) return '#';
  return `${siteConfig.url}/event-register/${event.id}`;
}
