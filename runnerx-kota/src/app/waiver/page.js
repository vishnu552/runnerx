import { eventInfo as fallbackEventInfo } from '@/data/categories';
import { getPageContent, getGlobalContent, getInfoSections } from '@/lib/api';
import PageHero from '@/components/PageHero';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Waiver',
  description: 'Waiver and release form for the RunnerX Kota Marathon.',
};

export default async function WaiverPage() {
  const content = await getPageContent('waiver');
  const globalContent = await getGlobalContent();
  const sections = await getInfoSections('WAIVER', 'GLOBAL');

  const hero = content?.hero || {};
  const email = globalContent?.event_info?.email || fallbackEventInfo.email;
  const phone = globalContent?.event_info?.phone || fallbackEventInfo.phone;
  const address = globalContent?.event_info?.location || fallbackEventInfo.location;

  return (
    <>
      <PageHero 
        title={hero.title || "Waiver"}
        bgImage={hero.bg_image}
      />

      <div className="legal-content">
        {sections.length > 0 ? (
          sections.map((section, index) => (
            <div key={section.id || index} style={{ marginBottom: '32px' }}>
              <h2>{section.heading}</h2>
              <div
                style={{ lineHeight: 1.8 }}
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            </div>
          ))
        ) : (
          <div style={{ marginBottom: '32px' }}>
            <p>No waiver sections have been added yet.</p>
          </div>
        )}
      </div>
    </>
  );
}
