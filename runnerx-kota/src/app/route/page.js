import { getPageContent } from '@/lib/api';

export const metadata = {
  title: 'Route & Venue',
  description: 'Explore the scenic route of the RunnerX Kota Marathon along the Chambal River.',
};

export default async function RoutePage() {
  const content = await getPageContent('route');
  
  const hero = content?.hero || {};
  const map = content?.map || {};
  const startFinish = content?.start_finish || {};
  const aidStations = content?.aid_stations || {};
  const venueHighlights = content?.venue_highlights || {};

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="badge badge-primary" style={{ marginBottom: '16px' }}>{hero.badge || "Course Map"}</div>
          <h1 className="page-hero-title">{hero.title || "Route &"} <span style={{ color: 'var(--primary)' }}>{hero.title_accent || "Venue"}</span></h1>
          <p className="page-hero-subtitle">
            {hero.subtitle || "Run through the most scenic parts of Kota along the Chambal River."}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Main Map */}
          <div className="route-map-placeholder" style={{ marginBottom: '48px' }}>
            <span style={{ fontSize: '4rem', opacity: 0.3, color: 'var(--primary)' }}>📍</span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--text)' }}>{map.placeholder_text || "Detailed course map coming soon"}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{map.placeholder_desc || "Routes along Chambal Garden → Kota Barrage → Kishore Sagar Lake"}</p>
          </div>

          <div className="route-info-grid">
            <div className="detail-card">
              <h3 className="category-section-title">
                <span style={{ fontSize: '1.2rem' }}>🚩</span> {startFinish.title || "Start &"} {startFinish.title_accent || "Finish Points"}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {startFinish.subtitle || "Each category has a designated start point, with all races finishing at Chambal Garden."}
              </p>
            </div>

            <div className="detail-card">
              <h3 className="category-section-title">
                <span style={{ fontSize: '1.2rem' }}>💧</span> {aidStations.title || "On-Course"} {aidStations.title_accent || "Support"}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {aidStations.subtitle || "Everything you need along the way to keep you going strong."}
              </p>
              <div className="check-list" style={{ gridTemplateColumns: '1fr' }}>
                {(aidStations.items || [
                  { title: "Hydration Stations", desc: "Water and electrolyte stations at every 2-2.5 km for all categories. Energy gels available for 10K and Half Marathon runners." },
                  { title: "Medical Support", desc: "Trained medical teams stationed every 2-3 km. Ambulance support on standby. First aid at every hydration station." },
                  { title: "Parking & Access", desc: "Free parking at Chambal Garden and nearby designated areas. Easy access via Kota Junction Railway Station (5 km)." }
                ]).map((item, i) => (
                  <div className="check-list-item" key={i}>
                    <div>
                      <strong style={{ display: 'block', color: 'var(--text)' }}>{item.title}</strong>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{venueHighlights.title || "Venue"} <span className="accent">{venueHighlights.title_accent || "Highlights"}</span></h2>
            <p className="section-subtitle">
              {venueHighlights.subtitle || "Kota's most scenic landmarks along your route."}
            </p>
          </div>

          <div className="highlights-grid">
            {(venueHighlights.items || [
              { icon: "🌿", value: "Chambal Garden", label: "Start & Finish Zone" },
              { icon: "🌊", value: "Kota Barrage", label: "Iconic Riverside Point" },
              { icon: "🏛️", value: "Kishore Sagar", label: "Historic Lake" },
              { icon: "🎡", value: "Seven Wonders", label: "Park & Viewpoint" }
            ]).map((item, i) => (
              <div className="highlight-card" style={{ background: 'var(--surface-dark)', borderColor: 'var(--border-dark)' }} key={i}>
                <span className="highlight-icon">{item.icon}</span>
                <div className="highlight-value" style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>{item.value}</div>
                <div className="highlight-label">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
