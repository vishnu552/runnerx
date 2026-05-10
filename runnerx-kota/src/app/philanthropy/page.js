import { getPageContent, getInfoSections } from '@/lib/api';
import TabsViewer from '@/components/TabsViewer';
import PageHero from '@/components/PageHero';

export const dynamic = 'force-dynamic';

export default async function PhilanthropyPage() {
  const content = await getPageContent('philanthropy');
  const sections = await getInfoSections('PHILANTHROPY');

  const hero = content?.hero || {};
  const tabs = sections.map(section => ({
    id: section.id,
    title: section.heading,
    body: section.content,
    sortOrder: section.sortOrder
  })).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <PageHero 
        title={hero.heading || "Philanthropy"}
        bgImage={hero.bg_image}
      />

      <div className="container" style={{ padding: '64px 0' }}>
        {/* Dynamic Tabs Rendered as Sidebar */}
        <div style={{ marginTop: '32px' }}>
          <TabsViewer tabs={tabs} />
        </div>
      </div>
    </>
  );
}
