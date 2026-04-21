import { getPageContent, getInfoSections } from '@/lib/api';

export const metadata = {
  title: 'FAQ',
  description: 'Frequently Asked Questions about the RunnerX Kota Marathon.',
};

// Hardcoded fallbacks — only used if DB has no FAQ sections yet
const fallbackFaqItems = [
  {
    heading: 'How do I register for the marathon?',
    content: 'Registration will open soon on our website. You will be able to register online by selecting your preferred category, filling in your details, and making the payment. Follow our social media for registration announcements.',
  },
  {
    heading: 'What are the age requirements for each category?',
    content: '3 KM Fun Run: 6 years and above. 5 KM Sprint: 12 years and above. 10 KM Challenge: 16 years and above. Half Marathon: 18 years and above. Participants under 18 must have a parent/guardian\'s consent.',
  },
];

export default async function FaqPage() {
  const content = await getPageContent('faq');
  const sections = await getInfoSections('FAQ');

  const hero = content?.hero || {};
  const footer = content?.footer || {};

  // Use DB sections if available, otherwise fall back to hardcoded
  const faqItems = sections.length > 0
    ? sections
    : fallbackFaqItems;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="badge badge-primary" style={{ marginBottom: '16px' }}>{hero.badge || "Help"}</div>
          <h1 className="page-hero-title">{hero.title || "Frequently Asked"} <span style={{ color: 'var(--primary)' }}>{hero.title_accent || "Questions"}</span></h1>
          <p className="page-hero-subtitle">
            {hero.subtitle || "Got questions? We've got answers. Find everything you need to know about the event."}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="faq-list">
            {faqItems.map((faq, index) => (
              <details key={faq.id || index} className="faq-item-details">
                <summary className="faq-question-summary">
                  {faq.heading}
                  <span className="faq-icon-summary"></span>
                </summary>
                <div className="faq-answer-summary" style={{ whiteSpace: 'pre-wrap' }}>
                  {faq.content}
                </div>
              </details>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '56px' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '1rem' }}>
              {footer.text || "Still have questions? We're happy to help!"}
            </p>
            <a href={footer.cta_link || "/contact"} className="btn btn-primary">{footer.cta_text || "Contact Us →"}</a>
          </div>
        </div>
      </section>
    </>
  );
}
