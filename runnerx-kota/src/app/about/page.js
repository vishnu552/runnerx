import { eventInfo as fallbackEventInfo } from '@/data/categories';
import { getPageContent, getGlobalContent } from '@/lib/api';

export const metadata = {
  title: 'About',
  description: 'Learn about RunnerX Kota Marathon — our mission, story, and vision for Kota\'s biggest running event.',
};

export default async function AboutPage() {
  const content = await getPageContent('about');
  const globalContent = await getGlobalContent();
  
  // Fallbacks for content
  const hero = content?.hero || {};
  const mission = content?.mission || {};
  const vision = content?.vision || {};
  const timeline = content?.timeline || {};
  const team = content?.team || {};
  
  const eventDate = globalContent?.event_info?.date || fallbackEventInfo.date;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="badge badge-primary" style={{ marginBottom: '16px' }}>{hero.badge || "Our Story"}</div>
          <h1 className="page-hero-title">{hero.title || "About"} <span style={{ color: 'var(--primary)' }}>{hero.title_accent || "RunnerX Kota"}</span></h1>
          <p className="page-hero-subtitle">
            {hero.subtitle || "Bringing the spirit of world-class marathon events to the heart of Hadoti region."}
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="section">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <h3>{mission.title || "Our Mission"}</h3>
              <p>
                {mission.paragraph1 || "RunnerX Kota Marathon is born from a simple belief — every city deserves a world-class running event. Kota, known for its educational institutions and the scenic Chambal River, is the perfect canvas for a marathon that celebrates both fitness and community."}
              </p>
              <p>
                {mission.paragraph2 || "Inspired by iconic events like the Tata Mumbai Marathon and the Vedanta Delhi Half Marathon, we aim to create an experience that puts Kota on the running map of India. From the beginner taking their first steps in the 3 KM Fun Run to the seasoned athlete conquering the Half Marathon — RunnerX Kota is for everyone."}
              </p>
              <p>
                {mission.paragraph3 || "Our routes are designed to showcase the beauty of Kota — the serene Chambal Garden, the majestic Kota Barrage, the historic Kishore Sagar Lake, and the vibrant streets that make this city unique."}
              </p>
            </div>
            <div className="about-image-placeholder">
              <span style={{ fontSize: '4rem', opacity: 0.3, color: 'var(--primary)' }}>🏃‍♂️</span>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="section section-dark">
        <div className="container">
          <div className="section-header">
            <div className="badge badge-secondary">{vision.badge || "Our Vision"}</div>
            <h2 className="section-title">{vision.title || "More Than"} <span className="accent">{vision.title_accent || "a Marathon"}</span></h2>
            <p className="section-subtitle">
              {vision.subtitle || "We're building a movement that goes beyond race day."}
            </p>
          </div>

          <div className="features-grid">
            {(vision.features || [
              { icon: "🌿", title: "Green Running", desc: "Eco-friendly event management with biodegradable cups, minimal plastic use, and post-event clean-up drives along the Chambal riverside." },
              { icon: "🎓", title: "Student Power", desc: "Special engagement for Kota's massive student community — promoting fitness alongside academics. Discounted entries for students." },
              { icon: "❤️", title: "Run for a Cause", desc: "A portion of every registration goes to local NGOs supporting education, health, and environmental conservation in the Hadoti region." }
            ]).map((feature, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon-wrap">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Day Timeline (temporarily hidden) */}
      {false && (
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="badge badge-primary">{timeline.badge || "Race Day"}</div>
            <h2 className="section-title">{timeline.title || "Event Day"} <span className="accent">{timeline.title_accent || "Timeline"}</span></h2>
            <p className="section-subtitle">
              Here&apos;s how the big day unfolds — {eventDate}
            </p>
          </div>

          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <div className="timeline">
              {(timeline.items || [
                { time: "4:00 AM", title: "Gates Open", desc: "Venue gates open. Bib collection & bag drop for registered runners." },
                { time: "4:30 AM", title: "Half Marathon Reporting", desc: "Half Marathon runners assemble at Nayapura Circle start line." },
                { time: "5:30 AM", title: "Half Marathon Flag-Off", desc: "The flagship 21.1 KM race begins at dawn." },
                { time: "6:30 AM", title: "10 KM Challenge Flag-Off", desc: "10 KM runners start from Kota Barrage." },
                { time: "7:00 AM", title: "5 KM Sprint Flag-Off", desc: "Sprint category runners start from Chambal Garden." },
                { time: "7:30 AM", title: "3 KM Fun Run Flag-Off", desc: "Fun Run begins! Families, kids, and beginners start their journey." },
                { time: "9:00 AM", title: "Prize Ceremony & Breakfast", desc: "Awards, celebrations, and post-race breakfast for all finishers." }
              ]).map((item, i) => (
                <div className="timeline-item" key={i}>
                  <div className="timeline-time">{item.time}</div>
                  <div className="timeline-title">{item.title}</div>
                  <div className="timeline-desc">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Organizers / Meet the Team (temporarily hidden) */}
      {false && (
      <section className="section section-dark">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{team.title || "Meet"} <span className="accent">{team.title_accent || "the Team"}</span></h2>
            <p className="section-subtitle">
              {team.subtitle || "RunnerX Kota is organized by a passionate team of runners, event managers, and community leaders dedicated to making Kota a running city."}
            </p>
          </div>

          <div className="cta-banner">
            <h2 className="cta-title">{team.cta_title || "Want to Volunteer?"}</h2>
            <p className="cta-subtitle">
              {team.cta_subtitle || "We need 500+ volunteers on race day. Be part of the team that makes it happen!"}
            </p>
            <a href={team.cta_button_link || "/contact"} className="btn btn-primary btn-lg">
              {team.cta_button_text || "Get in Touch →"}
            </a>
          </div>
        </div>
      </section>
      )}
    </>
  );
}
