import { getPageContent, getGalleryImages } from '@/lib/api';
import GalleryClient from './GalleryClient';
import PageHero from '@/components/PageHero';

export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
  const content = await getPageContent('gallery');
  const allItems = await getGalleryImages();
  
  // Determine unique years and most recent year
  const years = Array.from(new Set(allItems.map(item => item.year).filter(Boolean)))
    .sort((a, b) => b - a);
    
  const mostRecentYear = years[0] || null;
  const initialItems = mostRecentYear 
    ? allItems.filter(item => item.year === mostRecentYear)
    : [];

  const hero = content?.hero || {};

  return (
    <>
      <PageHero 
        title="RunnerX"
        titleAccent={hero.title_accent || "Gallery"}
        bgImage={hero.bg_image}
      />

      <section className="section" style={{ minHeight: '600px' }}>
        <GalleryClient 
          initialItems={initialItems} 
          availableYears={years} 
          defaultYear={mostRecentYear}
        />
      </section>
    </>
  );
}
