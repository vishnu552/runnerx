import { getCategories } from '@/lib/api';
import { categories as fallbackCategories } from '@/data/categories';
import PageHero from '@/components/PageHero';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await getCategories('KTA');
  const cats = categories || fallbackCategories;

  return (
    <>
      <PageHero 
        title="Race"
        titleAccent="Categories"
      />

      <section className="section" style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="categories-grid">
            {cats.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="category-card"
              >
                <div className="category-card-body">
                  <span className="category-card-icon">{cat.icon}</span>
                  <span className="category-card-distance">
                    {cat.distance}
                  </span>
                  <h3 className="category-card-name">{cat.name}</h3>
                  <p className="category-card-desc">
                    {cat.tagline || cat.description?.slice(0, 120)}
                  </p>
                </div>
                <div className="category-card-footer">
                  <span className="category-card-link">
                    View Details →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
