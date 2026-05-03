import { getPageContent, getGlobalContent } from '@/app/lib/api';
import ContactForm from './ContactForm';

const fallbackEventInfo = {
  email: 'contact@runnerx.in',
  phone: '+91 9876543210',
};

export const metadata = {
  title: 'Contact — RunnerX Dashboard',
};

export const dynamic = 'force-dynamic';

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
        {/* <p style={{ color: 'var(--text-secondary)' }}>
          Have questions about an event? Need help with your registration? We're here to help.
        </p> */}
      </div>

      {/* Contact info - Single Row */}
      <div className="card" style={{ 
        padding: '24px 32px', 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '40px', 
        alignItems: 'center',
        background: 'white'
      }}>
        {/* Email */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '8px', background: 'rgba(255,200,60,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffc83c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</div>
            <a href={`mailto:${email}`} style={{ color: 'var(--text)', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>{email}</a>
          </div>
        </div>

        {/* Phone */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '8px', background: 'rgba(255,200,60,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffc83c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</div>
            <a href={`tel:${phone}`} style={{ color: 'var(--text)', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>{phone}</a>
          </div>
        </div>

        {/* Hours */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '8px', background: 'rgba(255,200,60,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffc83c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hours</div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 700, margin: 0 }}>Mon–Sat: 10 AM – 6 PM</p>
          </div>
        </div>
      </div>

      {/* Contact form */}
      <ContactForm />
    </div>
  );
}
