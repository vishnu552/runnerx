import Link from 'next/link';

export default function CategoryPage({ category }) {
  return (
    <>
      {/* Hero */}
      <section className="category-hero">
        <div className="category-hero-inner">
          <div className="category-distance-badge">
            {category.icon && <span style={{ marginRight: 8 }}>{category.icon}</span>}
            {category.distance}
          </div>
          <h1 className="category-hero-title">{category.heroTitle || category.name}</h1>
          {category.heroSubtitle && (
            <p className="category-hero-tagline">{category.heroSubtitle}</p>
          )}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 24 }}>
            <span className="category-hero-price">
              ₹{category.price}
              <span> / person</span>
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontFamily: 'var(--font-subheading)' }}>
              {category.ageEligibility}
            </span>
          </div>
          <Link href={category.ctaLink || '/register'} className="btn btn-primary btn-lg">
            {category.ctaText || 'Register Now'} →
          </Link>
        </div>
      </section>

      {/* Description */}
      {category.description && (
        <section className="category-section">
          <div className="container">
            <div className="category-section-title">
              <span>📋</span> About This Race
            </div>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: 800 }}>
              {category.description}
            </p>
          </div>
        </section>
      )}

      {/* Route Details */}
      {category.route?.start && (
        <section className="category-section">
          <div className="container">
            <div className="category-section-title">
              <span>🗺️</span> Route Details
            </div>
            <div className="detail-grid">
              <div className="detail-card">
                <div className="detail-card-label">Start Point</div>
                <div className="detail-card-value">{category.route.start}</div>
              </div>
              <div className="detail-card">
                <div className="detail-card-label">Finish Point</div>
                <div className="detail-card-value">{category.route.finish}</div>
              </div>
              <div className="detail-card">
                <div className="detail-card-label">Terrain</div>
                <div className="detail-card-value">{category.route.terrain}</div>
              </div>
              <div className="detail-card">
                <div className="detail-card-label">Route Highlights</div>
                <div className="detail-card-value">{category.route.highlights}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Timing */}
      {category.timing?.flagOff && (
        <section className="category-section">
          <div className="container">
            <div className="category-section-title">
              <span>⏰</span> Race Day Timing
            </div>
            <div className="detail-grid">
              <div className="detail-card">
                <div className="detail-card-label">Reporting Time</div>
                <div className="detail-card-value">{category.timing.reportingTime}</div>
              </div>
              <div className="detail-card">
                <div className="detail-card-label">Flag-Off Time</div>
                <div className="detail-card-value">{category.timing.flagOff}</div>
              </div>
              <div className="detail-card">
                <div className="detail-card-label">Cut-Off Time</div>
                <div className="detail-card-value">{category.timing.cutOff}</div>
              </div>
              <div className="detail-card">
                <div className="detail-card-label">Age Eligibility</div>
                <div className="detail-card-value">{category.ageEligibility}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Highlights */}
      {category.highlights?.length > 0 && (
        <section className="category-section">
          <div className="container">
            <div className="category-section-title">
              <span>✨</span> Highlights
            </div>
            <div className="check-list">
              {category.highlights.map((item, i) => (
                <div key={i} className="check-list-item">{item}</div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Who Should Run */}
      {category.whoShouldRun?.length > 0 && (
        <section className="category-section">
          <div className="container">
            <div className="category-section-title">
              <span>👟</span> Who Should Run?
            </div>
            <div className="check-list">
              {category.whoShouldRun.map((item, i) => (
                <div key={i} className="check-list-item">{item}</div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* What's Included */}
      {category.included?.length > 0 && (
        <section className="category-section">
          <div className="container">
            <div className="category-section-title">
              <span>🎁</span> What's Included
            </div>
            <div className="check-list">
              {category.included.map((item, i) => (
                <div key={i} className="check-list-item">{item}</div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section section-light">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="cta-banner" style={{ maxWidth: 700, margin: '0 auto' }}>
            <div className="cta-title">
              Ready to {category.distance}?
            </div>
            <p className="cta-subtitle">
              Secure your spot before registrations close. Limited slots available.
            </p>
            <Link href={category.ctaLink || '/register'} className="btn btn-primary btn-lg">
              {category.ctaText || 'Register Now'} →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
