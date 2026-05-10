const baseUrl = typeof window === 'undefined'
  ? process.env.BACKEND_URL || 'http://localhost:3001'      // server: use internal URL
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';  // client: use public domain

export const API_URL = baseUrl;
// Public URL for assets (image src) — must be reachable from the user's browser,
// so always use NEXT_PUBLIC_API_URL even when running on the server.
export const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || baseUrl;
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || '';
export async function getPageContent(page, siteFor = 'KTA') {
  try {
    const res = await fetch(`${API_URL}/api/page-content?page=${page}&siteFor=${siteFor}`, {
      cache: 'no-store'
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
        parsedValue = `${PUBLIC_API_URL}${parsedValue}`;
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

export async function getGalleryImages(siteFor = 'KTA', year = null) {
  try {
    const params = new URLSearchParams({ siteFor });
    if (year) params.append('year', year);
    
    const res = await fetch(`${API_URL}/api/gallery-images?${params.toString()}`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error('Failed to fetch gallery images');
      return [];
    }

    const data = await res.json();
    if (!data.success) return [];

    return data.images.map(img => ({
      ...img,
      imagePath: img.imagePath.startsWith('/uploads/') ? `${PUBLIC_API_URL}${img.imagePath}` : img.imagePath
    }));
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return [];
  }
}

export async function getCategories(siteFor = 'KTA') {
  try {
    const res = await fetch(`${API_URL}/api/categories?siteFor=${siteFor}`, {
      cache: 'no-store'
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
      heroImage: cat.heroImage ? (cat.heroImage.startsWith('/uploads/') ? `${PUBLIC_API_URL}${cat.heroImage}` : cat.heroImage) : null,
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
    return [];
  }
}

export async function getCategoryBySlug(slug, siteFor = 'KTA') {
  try {
    const res = await fetch(`${API_URL}/api/categories/${slug}?siteFor=${siteFor}`, {
      cache: 'no-store'
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
      heroImage: cat.heroImage ? (cat.heroImage.startsWith('/uploads/') ? `${PUBLIC_API_URL}${cat.heroImage}` : cat.heroImage) : null,
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
      cache: 'no-store'
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

// Get the single active (PUBLISHED) event for a site, with categories joined to templates
export async function getActiveEvent(siteFor = 'KTA') {
  try {
    const res = await fetch(`${API_URL}/api/events/public/active?siteFor=${siteFor}`, {
      cache: 'no-store'
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

export async function getSponsors(siteFor = 'KTA') {
  try {
    const res = await fetch(`${API_URL}/api/sponsors?siteFor=${siteFor}`, {
      cache: 'no-store'
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

export async function getRunnersInfo(siteFor = 'KTA') {
  try {
    const res = await fetch(`${API_URL}/api/runners-info?siteFor=${siteFor}`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error(`Failed to fetch runners info for ${siteFor}`);
      return [];
    }

    const data = await res.json();
    if (!data.success) return [];

    return data.items.map(item => ({
      ...item,
      image: item.image.startsWith('/uploads/') ? `${PUBLIC_API_URL}${item.image}` : item.image
    }));
  } catch (error) {
    console.error(`Error fetching runners info:`, error);
    return [];
  }
}

// Get Info Sections (FAQ, Terms, Privacy) for a site
export async function getInfoSections(pageType, siteFor = 'KTA') {
  try {
    const res = await fetch(
      `${API_URL}/api/info-sections?siteFor=${siteFor}&pageType=${pageType}`,
      { cache: 'no-store' }
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
