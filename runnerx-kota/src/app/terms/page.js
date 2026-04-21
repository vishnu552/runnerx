import { eventInfo as fallbackEventInfo } from '@/data/categories';
import { getPageContent, getGlobalContent, getInfoSections } from '@/lib/api';

export const metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and conditions for participating in the RunnerX Kota Marathon.',
};

// Hardcoded fallbacks — only used if DB has no Terms sections yet
const fallbackTermsSections = [
  {
    heading: '1. Registration & Participation',
    content: `By registering for the event, you agree to the following terms:

• You must provide accurate and complete information during registration.
• Registrations are non-transferable without prior official approval.
• The organizers reserve the right to verify your age and identity before the race.
• You agree to follow all instructions given by event officials, medical staff, and volunteers.`,
  },
  {
    heading: '2. Health & Safety',
    content: `Running a marathon involves physical exertion. By participating, you acknowledge that:

• You are physically fit and have sufficiently trained for the chosen distance.
• You do not have any medical condition that would make your participation unsafe.
• You consent to receiving medical treatment from event medical staff if required.
• The organizers are not liable for any injuries, illness, or medical emergencies that occur during or as a result of the event.`,
  },
  {
    heading: '3. Refunds & Cancellations',
    content: `Please note our policy regarding registration fees:

• No Refunds: Registration fees are strictly non-refundable under any circumstances.
• Event Cancellation: If the event is cancelled due to force majeure (extreme weather, natural disasters, government orders, pandemic restrictions), registrations will automatically be transferred to a rescheduled date or the next edition.
• Category changes (e.g., from Half Marathon to 10K) are subject to availability and administrative fees, with no refund of the price difference.`,
  },
  {
    heading: '4. Media & Photography',
    content: `By participating in the event, you grant the organizers and their partners:

• The right to use photographs, motion pictures, recordings, or any other media record of the event for legitimate promotional purposes.
• This includes publishing event photos on our website, social media channels, and marketing materials.`,
  },
  {
    heading: '5. Race Conduct & Disqualification',
    content: `Organizers reserve the right to disqualify any participant and remove them from the course for any of the following reasons:

• Failing to follow the designated route.
• Using non-authorized transportation (bicycles, vehicles) during the race.
• Behaving aggressively or inappropriately towards volunteers, staff, or other participants.
• Littering outside the designated waste disposal zones at hydration stations.
• Running without an official event bib or using someone else's bib.`,
  },
  {
    heading: '6. Personal Property',
    content: 'While baggage drop facilities may be provided, the organizers are not responsible for any loss, theft, or damage to personal property left at the venue, baggage drop, or along the course. Please avoid bringing valuables to the event.',
  },
  {
    heading: '7. Amendments to Terms',
    content: 'The organizers reserve the right to modify these terms and conditions at any time. Any changes will be posted on this page and will be effective immediately upon posting. Continued participation in the event constitutes acceptance of any modified terms.',
  },
];

export default async function TermsPage() {
  const content = await getPageContent('terms');
  const globalContent = await getGlobalContent();
  const sections = await getInfoSections('TERMS');

  const hero = content?.hero || {};
  const legal = content?.legal || {};

  const eventName = globalContent?.event_info?.name || fallbackEventInfo.name;
  const email = globalContent?.event_info?.email || fallbackEventInfo.email;
  const phone = globalContent?.event_info?.phone || fallbackEventInfo.phone;
  const address = globalContent?.event_info?.location || fallbackEventInfo.location;

  // Use DB sections if available, otherwise fall back to hardcoded
  const termsSections = sections.length > 0 ? sections : fallbackTermsSections;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">{hero.title || "Terms & Conditions"}</h1>
          <p className="page-hero-subtitle">
            {hero.subtitle || "Please read these terms carefully before registering for the event."}
          </p>
        </div>
      </section>

      <div className="legal-content">
        <p className="last-updated">{legal.last_updated || "Last updated: March 26, 2026"}</p>

        {termsSections.map((section, index) => (
          <div key={section.id || index} style={{ marginBottom: '32px' }}>
            <h2>{section.heading}</h2>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
              {section.content}
            </div>
          </div>
        ))}

        <h2>{termsSections.length + 1}. Contact Us</h2>
        <p>
          If you have any questions regarding these Terms and Conditions, please reach out to us:
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
