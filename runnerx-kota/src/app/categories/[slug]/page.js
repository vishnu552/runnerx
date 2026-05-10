import { getCategoryBySlug, getActiveEvent } from '@/lib/api';
import { categories as fallbackCategories } from '@/data/categories';
import TabsViewer from '@/components/TabsViewer';
import PageHero from '@/components/PageHero';
import Link from 'next/link';

export async function generateStaticParams() {
  const slugs = ['3km', '5km', '10km', 'half-marathon', 'virtual-marathon'];
  return slugs.map((slug) => ({ slug }));
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

  return (
    <>
      <PageHero 
        title={category.name}
        bgImage={category.heroImage}
      />

      <div className="container" style={{ padding: '64px 0' }}>
        {/* Dynamic Tabs Rendered as Sidebar */}
        <div style={{ marginTop: '32px' }}>
          <TabsViewer tabs={category.tabs?.sort((a, b) => a.sortOrder - b.sortOrder) || []} />
        </div>
      </div>

    </>
  );
}
