import Image from 'next/image';
import { getPageContent } from '@/lib/api';

export const metadata = {
  title: 'Gallery',
  description: 'Photos and memories from the RunnerX Kota Marathon.',
};

export default async function GalleryPage() {
  const content = await getPageContent('gallery');
  
  const hero = content?.hero || {};
  const pageContent = content?.content || {};

  const galleryItems = pageContent?.items || [
    { title: "Runners at Dawn", desc: "Early morning start along Chambal River" },
    { title: "Fun Run Families", desc: "3 KM Fun Run with families and kids" },
    { title: "Sprint Finish", desc: "Exciting 5 KM sprint finish line moments" },
    { title: "Challenge Route", desc: "10 KM runners passing Kota Barrage" },
    { title: "Half Marathon Start", desc: "The flagship race flag-off at dawn" },
    { title: "Medal Moment", desc: "Finishers celebrating with their medals" },
    { title: "Kota Skyline", desc: "Beautiful view of Kota from the route" },
    { title: "Community Spirit", desc: "Volunteers and supporters cheering runners" }
  ];

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="badge badge-primary" style={{ marginBottom: '16px' }}>{hero.badge || "Moments"}</div>
          <h1 className="page-hero-title">RunnerX <span style={{ color: 'var(--primary)' }}>{hero.title_accent || "Gallery"}</span></h1>
          <p className="page-hero-subtitle">
            {hero.subtitle || "Capturing the energy, emotion, and spirit of running in Kota."}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px', color: 'var(--text-secondary)' }}>
            <p>{pageContent.notice || "📸 Images from our upcoming event will be showcased here. Stay tuned!"}</p>
          </div>

          <div className="gallery-grid">
            {galleryItems.map((item, index) => (
              <div key={index} className="gallery-item" style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/3' }}>
                <Image
                  src={`/images/gallery/placeholder-${(index % 4) + 1}.png`} 
                  alt={item.title} 
                  fill
                  style={{ objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', color: 'white', opacity: 0, transition: 'opacity 0.3s ease' }} className="gallery-hover-info">
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', margin: 0, letterSpacing: '0.04em' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.8rem', opacity: 0.8, margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
