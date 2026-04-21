import { eventInfo as fallbackEventInfo } from '@/data/categories';
import { getPageContent, getGlobalContent } from '@/lib/api';

export const metadata = {
  title: 'Contact — RunnerX Dashboard',
};

export default async function DashboardContactPage() {
  const content = await getPageContent('contact');
  const globalContent = await getGlobalContent();

  const email = globalContent?.event_info?.email || fallbackEventInfo.email;
  const phone = globalContent?.event_info?.phone || fallbackEventInfo.phone;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="card" style={{ padding: '32px' }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700,
          color: 'var(--text)', marginBottom: '8px', textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          Contact
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Have questions about an event? Need help with your registration? We're here to help.
        </p>
      </div>

      {/* Contact info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '24px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{
            width: 42, height: 42, borderRadius: '10px', background: 'rgba(11,110,79,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email</div>
            <a href={`mailto:${email}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem' }}>{email}</a>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{
            width: 42, height: 42, borderRadius: '10px', background: 'rgba(11,110,79,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Phone</div>
            <a href={`tel:${phone}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem' }}>{phone}</a>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{
            width: 42, height: 42, borderRadius: '10px', background: 'rgba(11,110,79,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Hours</div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text)', fontWeight: 500 }}>Mon–Sat: 10 AM – 6 PM</p>
          </div>
        </div>
      </div>

      {/* Contact form */}
      <div className="card" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
          Send a Message
        </h2>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input type="text" className="form-input" placeholder="Your name" required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" placeholder="you@example.com" required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Related Event</label>
            <select className="form-input">
              <option value="">Select an event (optional)</option>
              <option value="kota">Kota Half Marathon</option>
              <option value="jodhpur">Jodhpur Marathon</option>
              <option value="udaipur">Udaipur Run</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea className="form-input" rows={4} placeholder="How can we help?" required style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ minWidth: 180 }}>Send Message</button>
          </div>
        </form>
      </div>

      {/* FAQs */}
      <div className="card" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { q: 'How do I change my race category?', a: 'Go to "My Events" in your dashboard, click "Change & Upgrade Entry", and select your new category. Price differences apply.' },
            { q: 'Can I transfer my registration?', a: 'Bib numbers are non-transferable per our terms. Please contact support for special cases.' },
            { q: 'How do I get my BIB number?', a: 'Your BIB number is generated automatically after successful registration and will be visible in "My Events".' },
            { q: 'What is the refund policy?', a: 'Registration fees are non-refundable. Check the Policy section for full details.' },
          ].map((faq, i) => (
            <details key={i} style={{ padding: '14px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-alt)' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>{faq.q}</summary>
              <p style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
