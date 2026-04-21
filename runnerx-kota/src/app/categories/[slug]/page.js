import Link from 'next/link';
import { getCategoryBySlug, getActiveEvent } from '@/lib/api';
import { categories as fallbackCategories } from '@/data/categories';
import TabsViewer from '@/components/TabsViewer';

export async function generateStaticParams() {
  const slugs = ['3km', '5km', '10km', 'half-marathon', 'virtual-marathon'];
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    const fallback = fallbackCategories.find(c => c.slug === slug);
    if (!fallback) return {};
    return {
      title: `${fallback.name} — ${fallback.distance}`,
      description: fallback.tagline,
    };
  }
  return {
    title: `${category.name} — ${category.distance}`,
    description: category.tagline,
  };
}

function getFallbackCategory(slug) {
  const found = fallbackCategories.find(c => c.slug === slug);
  if (!found) return null;
  return found;
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  let category = await getCategoryBySlug(slug);

  if (!category) {
    category = getFallbackCategory(slug);
  }

  if (!category) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <h1>Category Not Found</h1>
        <Link href="/categories" className="btn btn-primary" style={{ marginTop: 24 }}>
          View All Categories
        </Link>
      </div>
    );
  }

  // Load active event to get live pricing and the registration link
  const activeEvent = await getActiveEvent('KTA');
  const eventCategory = activeEvent?.categories?.find(
    ec => ec.category?.slug === slug
  );

  // Use event-specific pricing if available, otherwise fall back to template
  const price = eventCategory?.price ?? category.price ?? 0;
  const discountPrice = eventCategory?.discountPrice ?? category.discountPrice ?? null;
  const raceDate = eventCategory?.startTime ?? category.raceDate ?? null;

  // Registration link: link to the active event's registration page, or show disabled state
  const registerHref = activeEvent ? `/event-register/${activeEvent.id}` : null;

  return (
    <>
      {/* Hero */}
      <section className="category-hero" style={{ 
        backgroundImage: category.heroImage ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url(${category.heroImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: undefined
      }}>
        <div className="container category-hero-inner">
          <div className="category-distance-badge">
            {category.icon && <span style={{ marginRight: 8 }}>{category.icon}</span>}
            {category.distance}
          </div>
          <h1 className="category-hero-title" style={{ fontWeight: 900, fontStyle: 'italic' }}>{category.name}</h1>
          {category.tagline && (
            <p className="category-hero-tagline" style={{ fontWeight: 500, opacity: 0.9 }}>{category.tagline}</p>
          )}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
            <span className="category-hero-price" style={{ color: 'white', fontWeight: 900 }}>
              {discountPrice ? (
                <>
                  <span style={{ textDecoration: 'line-through', opacity: 0.6, fontSize: '0.8em', marginRight: 10, fontWeight: 700 }}>₹{price}</span>
                  <span style={{ color: '#ffdc50' }}>₹{discountPrice}</span>
                </>
              ) : (
                <>₹{price}</>
              )}
              <span style={{ fontSize: '0.45em', opacity: 0.8, textTransform: 'uppercase', marginLeft: 4 }}>/ person</span>
            </span>
            {raceDate && (
              <span style={{ fontSize: '1.2rem', color: '#ffdc50', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic' }}>
                <span style={{ filter: 'grayscale(0)' }}>📅</span> {new Date(raceDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
          {registerHref ? (
            <Link href={registerHref} className="btn btn-primary btn-lg" style={{
              backgroundColor: 'var(--primary)',
              borderColor: 'var(--primary)',
              color: 'white',
              fontWeight: 900,
              textTransform: 'uppercase',
              fontStyle: 'italic',
              padding: '16px 40px',
              boxShadow: '0 10px 30px rgba(0,160,255,0.4)',
              transform: 'skew(-10deg)',
              display: 'inline-block'
            }}>
              Register Now →
            </Link>
          ) : (
            <span className="btn btn-primary btn-lg" style={{
              backgroundColor: 'var(--text-muted)',
              borderColor: 'var(--text-muted)',
              cursor: 'not-allowed',
              opacity: 0.7,
            }}>
              Registration Not Open
            </span>
          )}
        </div>
      </section>

      <div className="container" style={{ padding: '64px 0' }}>
        {/* Dynamic Tabs Rendered as Sidebar */}
        <div style={{ marginTop: '32px' }}>
          <TabsViewer tabs={category.tabs?.sort((a, b) => a.sortOrder - b.sortOrder) || []} />
        </div>
      </div>

      <style>{`
        .rich-text {
          font-size: 1.1rem;
          line-height: 1.8;
          color: var(--text-secondary);
        }
        .rich-text p {
          margin-bottom: 1.5rem;
        }
        .rich-text ul {
          list-style: none;
          padding: 0;
          margin-bottom: 1.5rem;
        }
        .rich-text li {
          position: relative;
          padding-left: 28px;
          margin-bottom: 12px;
        }
        .rich-text li::before {
          content: "✓";
          position: absolute;
          left: 0;
          color: var(--primary);
          font-weight: bold;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 1.5rem;
        }
        .detail-item {
          background: var(--bg-alt);
          padding: 20px;
          border-radius: 12px;
          border: 1px solid var(--border);
        }
        .detail-item strong {
          display: block;
          font-size: 0.9rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
      `}</style>
    </>
  );
}
