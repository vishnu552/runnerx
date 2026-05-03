import { getPageContent, getInfoSections } from '@/lib/api';
import PageHero from '@/components/PageHero';

export const metadata = {
  title: 'Event Rules — RunnerX Kota',
  description: 'Rules, regulations, and guidelines for the RunnerX Kota Marathon.',
};

export default async function EventRulesPage() {
  const content = await getPageContent('event-rules');
  const sections = await getInfoSections('EVENT_RULES');

  const hero = content?.hero || {};

  return (
    <>
      <PageHero 
        title={hero.heading || "Event Rules"}
        bgImage={hero.bg_image}
      />

      <div className="legal-content">
        {sections.sort((a, b) => a.sortOrder - b.sortOrder).map((section, index) => (
          <div key={section.id || index} style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.8rem', color: 'black', marginBottom: '20px' }}>{section.heading}</h2>
            <div
              className="rich-text"
              style={{ lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
