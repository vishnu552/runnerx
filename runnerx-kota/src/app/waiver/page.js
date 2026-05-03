import { eventInfo as fallbackEventInfo } from '@/data/categories';
import { getGlobalContent, getInfoSections } from '@/lib/api';
import PageHero from '@/components/PageHero';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Liability Waiver',
  description: 'Liability waiver and release form for the RunnerX Kota Marathon.',
};

export default async function WaiverPage() {
  const globalContent = await getGlobalContent();
  const sections = await getInfoSections('WAIVER', 'GLOBAL');

  const email = globalContent?.event_info?.email || fallbackEventInfo.email;
  const phone = globalContent?.event_info?.phone || fallbackEventInfo.phone;
  const address = globalContent?.event_info?.location || fallbackEventInfo.location;

  return (
    <>
      <PageHero 
        title="Liability Waiver"
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
            <p>No liability waiver sections have been added yet.</p>
          </div>
        )}

        <h2>Contact Us</h2>
        <p>
          If you have any questions regarding this waiver, please reach out to us:
        </p>
        <ul>
          <li>Email: {email}</li>
          <li>Phone: {phone}</li>
          <li>Address: {address}</li>
        </ul>
      </div>
    </>
  );
}
