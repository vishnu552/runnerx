import { eventInfo as fallbackEventInfo } from '@/data/categories';
import { getPageContent, getGlobalContent } from '@/lib/api';

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the RunnerX Kota Marathon team.',
};

export default async function ContactPage() {
  const content = await getPageContent('contact');
  const globalContent = await getGlobalContent();
  
  const hero = content?.hero || {};
  const form = content?.form || {};
  const info = content?.info || {};

  const email = globalContent?.event_info?.email || fallbackEventInfo.email;
  const phone = globalContent?.event_info?.phone || fallbackEventInfo.phone;
  const address = globalContent?.event_info?.location || fallbackEventInfo.location;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="badge badge-primary" style={{ marginBottom: '16px' }}>{hero.badge || "Reach Out"}</div>
          <h1 className="page-hero-title">{hero.title || "Contact"} <span style={{ color: 'var(--primary)' }}>{hero.title_accent || "Us"}</span></h1>
          <p className="page-hero-subtitle">
            {hero.subtitle || "Have questions about the event? Want to partner or volunteer? We'd love to hear from you."}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-form-container">
              <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '24px' }}>{form.title || "Send us a Message"}</h2>
              <form className="contact-form">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-input" placeholder="Your full name" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" placeholder="you@example.com" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select className="form-input" required>
                    <option value="">Select a topic</option>
                    <option value="registration">Registration Issue</option>
                    <option value="sponsorship">Sponsorship Inquiry</option>
                    <option value="volunteer">Volunteer Sign-up</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea className="form-textarea" placeholder="How can we help you?" required></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>Send Message</button>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  {form.disclaimer || ""}
                </p>
              </form>
            </div>

            <div className="contact-info-container">
              <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '32px' }}>{info.title || "Contact Information"}</h2>
              
              <div className="contact-info-list" style={{ marginBottom: '40px' }}>
                {/* <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </div>
                  <div>
                    <div className="contact-info-label">Address</div>
                    <div className="contact-info-value">{address}</div>
                  </div>
                </div> */}
                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </div>
                  <div>
                    <div className="contact-info-label">Email</div>
                    <div className="contact-info-value"><a href={`mailto:${email}`}>{email}</a></div>
                  </div>
                </div>
                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  </div>
                  <div>
                    <div className="contact-info-label">Phone</div>
                    <div className="contact-info-value"><a href={`tel:${phone}`}>{phone}</a></div>
                  </div>
                </div>
                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </div>
                  <div>
                    <div className="contact-info-label">Contact Hours</div>
                    <div className="contact-info-value">
                      Monday – Saturday: 10:00 AM – 6:00 PM<br />
                      Sunday: Closed
                    </div>
                  </div>
                </div>
              </div>

              {/* Social */}
              <div style={{ marginTop: '32px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: '#000', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Follow Us
                </h3>
                <div className="footer-social">
                  <a href={fallbackEventInfo.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>
                    <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c.796 0 1.441.645 1.441 1.44s-.645 1.44-1.441 1.44c-.795 0-1.439-.645-1.439-1.44s.644-1.44 1.439-1.44z"/></svg>
                  </a>
                  <a href={fallbackEventInfo.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>
                    <svg viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                  </a>
                  <a href={fallbackEventInfo.social.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>
                    <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
