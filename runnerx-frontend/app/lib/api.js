const baseUrl = typeof window === 'undefined' 
  ? process.env.BACKEND_URL || 'http://localhost:3001'      // server: use internal URL
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';  // client: use public domain

export const API_URL = baseUrl;
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || '';

/**
 * Helper for client-side authenticated fetches to the backend.
 * Uses API_URL from env.
 */
export async function authenticatedFetch(path, options = {}) {
  const { getSessionTokenClient } = await import('./auth-client');
  const token = getSessionTokenClient();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = path.startsWith('http') ? path : `${API_URL}${path}`;
  
  return fetch(url, {
    ...options,
    headers,
  });
}

export async function getPageContent(page, siteFor = 'KTA') {
  try {
    const res = await fetch(`${API_URL}/api/page-content?page=${page}&siteFor=${siteFor}`, {
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      console.error(`Failed to fetch content for ${page}`);
      return null;
    }

    const data = await res.json();
    if (!data.success) {
      return null;
    }

    const grouped = {};
    for (const item of data.content) {
      if (!grouped[item.section]) {
        grouped[item.section] = {};
      }
      
      let parsedValue = item.value;
      if (item.type === 'IMAGE' && typeof parsedValue === 'string' && parsedValue.startsWith('/uploads/')) {
        parsedValue = `${API_URL}${parsedValue}`;
      } else if (item.type === 'JSON') {
        try {
          parsedValue = JSON.parse(item.value);
        } catch (e) {
          console.error(`Failed to parse JSON for key ${item.key}`, e);
        }
      }
      
      grouped[item.section][item.key] = parsedValue;
    }

    return grouped;
  } catch (error) {
    console.error(`Error fetching page content for ${page}:`, error);
    return null;
  }
}

export async function getGlobalContent(siteFor = 'KTA') {
  return getPageContent('global', siteFor);
}

export async function getEvents(siteFor = null) {
  try {
    const url = siteFor 
      ? `${API_URL}/api/events/public?siteFor=${siteFor}`
      : `${API_URL}/api/events/public`;
      
    const res = await fetch(url, {
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      console.error('Failed to fetch events');
      return [];
    }

    const data = await res.json();
    if (!data.success) {
      return [];
    }

    return data.events;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

export async function getEventById(id) {
  try {
    const res = await fetch(`${API_URL}/api/events/public/${id}`, {
      next: { revalidate: 60 }
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.success) return null;

    return data.event;
  } catch (error) {
    console.error(`Error fetching event ${id}:`, error);
    return null;
  }
}

// Get the single active (PUBLISHED) event for a site, with categories joined to templates
export async function getActiveEvent(siteFor = 'KTA') {
  try {
    const res = await fetch(`${API_URL}/api/events/public/active?siteFor=${siteFor}`, {
      next: { revalidate: 60 }
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.success) return null;

    return data.event;
  } catch (error) {
    console.error('Error fetching active event:', error);
    return null;
  }
}

// Get registrations for the currently logged-in user (server-side, needs token)
export async function getUserRegistrations(token) {
  try {
    if (!token) return [];
    const res = await fetch(`${API_URL}/api/auth/registrations`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.success) return [];
    return data.registrations;
  } catch (error) {
    console.error('Error fetching user registrations:', error);
    return [];
  }
}

// Get orders for the currently logged-in user (server-side, needs token)
export async function getUserOrders(token) {
  try {
    if (!token) return [];
    const res = await fetch(`${API_URL}/api/auth/orders`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.success) return [];
    return data.orders;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
}

// Get donations for the currently logged-in user (server-side, needs token)
export async function getUserDonations(token) {
  try {
    if (!token) return [];
    const res = await fetch(`${API_URL}/api/auth/donations`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.success) return [];
    return data.donations;
  } catch (error) {
    console.error('Error fetching user donations:', error);
    return [];
  }
}

// Get stories for the currently logged-in user (server-side, needs token)
export async function getUserStories(token) {
  try {
    if (!token) return [];
    const res = await fetch(`${API_URL}/api/auth/stories`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.success) return [];
    return data.stories;
  } catch (error) {
    console.error('Error fetching user stories:', error);
    return [];
  }
}

// Get Info Sections (FAQ, Terms, Privacy) for a site
export async function getInfoSections(pageType, siteFor = 'KTA') {
  try {
    const res = await fetch(
      `${API_URL}/api/info-sections?siteFor=${siteFor}&pageType=${pageType}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.success) return [];
    return data.sections;
  } catch (error) {
    console.error(`Error fetching info sections (${pageType}):`, error);
    return [];
  }
}

// Validate a coupon code (client-side, no caching)
export async function validateCoupon(code, siteFor, amount) {
  const res = await fetch(`${API_URL}/api/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, siteFor, amount }),
  });
  return res.json();
}
