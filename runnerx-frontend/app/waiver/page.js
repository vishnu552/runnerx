import { getGlobalContent, getInfoSections } from '@/app/lib/api';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Waiver',
  description: 'Waiver and release form for RunnerX events.',
};

// Fallback contact info
const fallbackContact = {
  email: 'info@runnerx.in',
  phone: '+91 98765 43210',
  location: 'India',
};

export default async function WaiverPage() {
  const globalContent = await getGlobalContent();
  const sections = await getInfoSections('WAIVER', 'GLOBAL');

  const email = globalContent?.event_info?.email || fallbackContact.email;
  const phone = globalContent?.event_info?.phone || fallbackContact.phone;
  const address = globalContent?.event_info?.location || fallbackContact.location;

  return (
    <>
      <section className="legal-page-hero">
        <div className="legal-page-hero-inner">
          <h1>Waiver</h1>
        </div>
      </section>

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
