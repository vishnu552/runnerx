import { eventInfo as fallbackEventInfo } from '@/data/categories';
import { getPageContent, getGlobalContent, getInfoSections } from '@/lib/api';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for RunnerX Kota Marathon — how we collect, use, and protect your data.',
};

// Hardcoded fallbacks — only used if DB has no Privacy sections yet
const fallbackPrivacySections = [
  {
    heading: '1. Information We Collect',
    content: `When you register for the event, we may collect the following personal information:

• Full name, date of birth, and gender
• Email address and phone number
• Emergency contact details
• T-shirt size and blood group (for medical emergencies)
• Running history and previous race times (optional)
• Payment information (processed securely through third-party payment gateways)`,
  },
  {
    heading: '2. How We Use Your Information',
    content: `Your information is used for the following purposes:

• Processing and managing your event registration
• Sending event-related communications (bib collection, route updates, etc.)
• Providing on-course medical support when needed
• Publishing race results and timing data
• Improving our events and services
• Sending marketing communications about future events (with your consent)`,
  },
  {
    heading: '3. Cookie Policy',
    content: `Our website uses cookies to enhance your browsing experience. Cookies are small text files stored on your device that help us understand how you use our website. We use:

• Essential cookies: Required for the website to function properly
• Analytics cookies: Help us understand website traffic and usage patterns
• Marketing cookies: Used to deliver relevant advertisements (only with consent)`,
  },
  {
    heading: '4. Third-Party Services',
    content: `We may share your data with trusted third-party service providers who assist in organizing the event, including:

• Timing and race result management partners
• Payment processing services
• Email and communication platforms
• Event photography partners (race photos may be published online)

We do not sell your personal information to any third party for commercial purposes.`,
  },
  {
    heading: '5. Data Security',
    content: 'We implement industry-standard security measures to protect your personal information, including SSL encryption, secure servers, and access controls. However, no method of electronic transmission is 100% secure.',
  },
  {
    heading: '6. Your Rights',
    content: `You have the right to:

• Access the personal data we hold about you
• Request correction of inaccurate data
• Request deletion of your data (subject to legal requirements)
• Opt out of marketing communications at any time
• Withdraw consent for data processing`,
  },
];

export default async function PrivacyPolicyPage() {
  const content = await getPageContent('privacy');
  const globalContent = await getGlobalContent();
  const sections = await getInfoSections('PRIVACY');

  const hero = content?.hero || {};
  const legal = content?.legal || {};

  const email = globalContent?.event_info?.email || fallbackEventInfo.email;
  const phone = globalContent?.event_info?.phone || fallbackEventInfo.phone;
  const address = globalContent?.event_info?.location || fallbackEventInfo.location;

  // Use DB sections if available, otherwise fall back to hardcoded
  const privacySections = sections.length > 0 ? sections : fallbackPrivacySections;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">{hero.title || "Privacy Policy"}</h1>
          <p className="page-hero-subtitle">
            {hero.subtitle || "Your privacy matters to us. Here's how we handle your information."}
          </p>
        </div>
      </section>

      <div className="legal-content">
        <p className="last-updated">{legal.last_updated || "Last updated: March 26, 2026"}</p>

        {privacySections.map((section, index) => (
          <div key={section.id || index} style={{ marginBottom: '32px' }}>
            <h2>{section.heading}</h2>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
              {section.content}
            </div>
          </div>
        ))}

        <h2>{privacySections.length + 1}. Contact Us</h2>
        <p>
          For any privacy-related inquiries or to exercise your rights, please contact us at:
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
