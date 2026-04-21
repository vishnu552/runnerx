const baseUrl = typeof window === 'undefined' 
  ? process.env.BACKEND_URL || 'http://localhost:3001'      // server: use localhost
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';  // client: use domain

export const API_URL = baseUrl;

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
      if (item.type === 'JSON') {
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

export async function getCategories(siteFor = 'KTA') {
  try {
    const res = await fetch(`${API_URL}/api/categories?siteFor=${siteFor}`, {
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      console.error('Failed to fetch categories');
      return null;
    }

    const data = await res.json();
    if (!data.success) {
      return null;
    }

    return data.categories.map(cat => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      distance: cat.distanceLabel,
      price: cat.price || 0,
      discountPrice: cat.discountPrice || null,
      raceDate: cat.raceDate || null,
      heroImage: cat.heroImage ? (cat.heroImage.startsWith('/') ? `${API_URL}${cat.heroImage}` : cat.heroImage) : null,
      tagline: cat.tagline || '',
      icon: cat.icon || '',
      order: cat.order || 0,
      isActive: cat.isActive,
      tabs: (cat.tabs || []).map(tab => ({
        id: tab.id,
        title: tab.title,
        body: tab.body,
        icon: tab.icon || '',
        sortOrder: tab.sortOrder,
      })),
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return null;
  }
}

export async function getCategoryBySlug(slug, siteFor = 'KTA') {
  try {
    const res = await fetch(`${API_URL}/api/categories/${slug}?siteFor=${siteFor}`, {
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      console.error(`Failed to fetch category: ${slug}`);
      return null;
    }

    const data = await res.json();
    if (!data.success || !data.category) {
      return null;
    }

    const cat = data.category;
    return {
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      distance: cat.distanceLabel,
      price: cat.price || 0,
      discountPrice: cat.discountPrice || null,
      raceDate: cat.raceDate || null,
      heroImage: cat.heroImage ? (cat.heroImage.startsWith('/') ? `${API_URL}${cat.heroImage}` : cat.heroImage) : null,
      tagline: cat.tagline || '',
      icon: cat.icon || '',
      order: cat.order || 0,
      isActive: cat.isActive,
      tabs: (cat.tabs || []).map(tab => ({
        id: tab.id,
        title: tab.title,
        body: tab.body,
        icon: tab.icon || '',
        sortOrder: tab.sortOrder,
      })),
    };
  } catch (error) {
    console.error(`Error fetching category ${slug}:`, error);
    return null;
  }
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

// Get a specific event by ID (for registration page)
export async function getEventById(eventId) {
  try {
    const res = await fetch(`${API_URL}/api/events/public/${eventId}`, {
      next: { revalidate: 60 }
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.success) return null;

    return data.event;
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

// Submit a registration (client-side, no caching)
export async function submitRegistration(registrationData) {
  const res = await fetch(`${API_URL}/api/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registrationData),
  });
  return res.json();
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

export async function getSponsors(siteFor = 'KTA') {
  try {
    const res = await fetch(`${API_URL}/api/sponsors?siteFor=${siteFor}`, {
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      console.error(`Failed to fetch sponsors for ${siteFor}`);
      return [];
    }

    const data = await res.json();
    if (!data.success) {
      return [];
    }
    
    return data.sponsors;
  } catch (error) {
    console.error(`Error fetching sponsors:`, error);
    return [];
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
