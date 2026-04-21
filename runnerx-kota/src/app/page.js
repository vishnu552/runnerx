import Link from 'next/link';
import Image from 'next/image';
import { categories as fallbackCategories, eventInfo as fallbackEventInfo } from '@/data/categories';
import CountdownTimer from '@/components/CountdownTimer';
import { getPageContent, getGlobalContent, getCategories, getEvents, getSponsors, API_URL } from '@/lib/api';

export default async function HomePage() {
  const [content, globalContent, categories, eventsData, sponsors] = await Promise.all([
    getPageContent('home'),
    getGlobalContent(),
    getCategories(),
    getEvents(),
    getSponsors()
  ]);
  
  const cats = categories || fallbackCategories;
  const hero = content?.hero;
  const overview = content?.overview;
  const ambassador = content?.ambassador;
  const initiatives = content?.initiatives;
  const countdown = content?.countdown;
  const categoriesHeader = content?.categories_header;
  const sponsorsHeader = content?.sponsors_header;
  const aboutFooter = content?.about_footer;
  
  const expectedParticipants = globalContent?.event_info?.expected_participants || fallbackEventInfo.expectedParticipants;

  let nearestEvent = null;
  if (eventsData && eventsData.length > 0) {
    const futureEvents = eventsData.filter(e => new Date(e.date) > new Date());
    if (futureEvents.length > 0) {
      futureEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
      nearestEvent = futureEvents[0];
    } else {
      nearestEvent = eventsData.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    }
  }

  const formattedDate = nearestEvent ? new Date(nearestEvent.date).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  }) : (hero?.date || "November 15, 2026");

  const dateIso = nearestEvent ? nearestEvent.date : (countdown?.target_date || "2026-11-15T05:30:00+05:30");

  // Helper to check if a section object has any meaningful content (not just empty strings)
  const hasValue = (obj) => {
    if (!obj) return false;
    return Object.values(obj).some(val => {
      if (val === null || val === undefined || val === '') return false;
      if (Array.isArray(val)) return val.length > 0;
      if (typeof val === 'object') return Object.keys(val).length > 0;
      return true;
    });
  };

  return (
    <>
      {/* ===== HERO BANNER (Full-width image like TMM) ===== */}
      {hasValue(hero) && (
        <section className="hero-banner" id="hero">
          <Image
            src={hero.banner_image || "/images/hero-banner.png"}
            alt={hero.banner_alt || "Marathon runners at dawn on a bridge"}
            fill
            priority
            className="hero-banner-image"
            style={{ objectFit: 'cover' }}
          />
          <div className="hero-banner-overlay"></div>
          <div className="hero-banner-content">
            <div className="hero-banner-inner">
              <div className="hero-race-day">{hero.label || "Race Day"}</div>
              <div className="hero-date-big">{formattedDate}</div>
              <div className="mt-8 flex justify-start">
                <Link 
                  href="/dashboard/register"
                  className="btn btn-primary btn-lg"
                  style={{ 
                    padding: '16px 40px', 
                    fontSize: '1.2rem', 
                    fontWeight: 900,
                    fontStyle: 'italic',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    transform: 'skew(-10deg)',
                  }}
                >
                  Register Now →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== EVENT OVERVIEW (like TMM's Overview section) ===== */}
      {hasValue(overview) && (
        <section className="overview-section" id="overview">
          <div className="container">
            <div className="grid items-start gap-12 md:grid-cols-2">
              <div>
                <div className="overview-title">{overview.title_line1 || "EVENT"}</div>
                <div className="overview-title-outline">{overview.title_line2 || "OVERVIEW"}</div>
                <p className="overview-text">
                  {overview.text || "Welcome to the 1st Edition of RunnerX Kota Marathon — a celebration of endurance, community, and the vibrant spirit of Hadoti. Run through the scenic Chambal Riverfront, past historic landmarks, and experience the energy of Kota like never before. With four race categories from a family-friendly 3K Fun Run to the ultimate Half Marathon challenge, there's a race for every runner."}
                </p>
              </div>
              <div className="overview-image-container overview-image-wrapper hidden md:block">
                <Image
                  src={overview.image || "/images/overview-runner.png"}
                  alt={overview.image_alt || "Aerial view of marathon runners"}
                  width={400}
                  height={300}
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
            </div>

            {/* Feature Cards (like TMM's sponsor/feature cards) */}
            <div className="overview-cards">
              <div className="overview-card">
                <div className="overview-card-title">{overview.card1_title || "4 Race Categories"}</div>
                <div className="overview-card-desc">{overview.card1_desc || "3K Fun Run • 5K Sprint • 10K Challenge • Half Marathon"}</div>
              </div>
              <div className="overview-card accent-card">
                <div className="overview-card-title">{overview.card2_title || `${expectedParticipants} Runners`}</div>
                <div className="overview-card-desc">{overview.card2_desc || "Join the biggest running event in Hadoti region"}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== AMBASSADOR SECTION (like TMM's International Event Ambassador) ===== */}
      {hasValue(ambassador) && (
        <section className="ambassador-section" id="ambassador">
          <div className="ambassador-grid">
            <div className="ambassador-title-block">
              <div className="ambassador-title">{ambassador.title_line1 || "LOCAL"}</div>
              <div className="ambassador-title-italic">{ambassador.title_line2 || "EVENT AMBASSADOR"}</div>
            </div>
            <div className="ambassador-image-wrap">
              <Image
                src={ambassador.image || "/images/ambassador.png"}
                alt={ambassador.image_alt || "Event Ambassador"}
                width={500}
                height={600}
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
            <div>
              <div className="ambassador-name">{ambassador.name || "Rajesh Sharma | 2026"}</div>
              <p className="ambassador-text">
                {ambassador.bio_paragraph1 || "A celebrated marathon runner from Rajasthan, Rajesh Sharma has been inspiring thousands of young athletes across the state. With multiple podium finishes in national marathons and a passion for community fitness, he embodies the spirit of RunnerX."}
              </p>
              <p className="ambassador-text">
                {ambassador.bio_paragraph2 || "His dedication to promoting running culture in Kota and beyond has made him a natural choice as the ambassador for the inaugural edition of RunnerX Kota Marathon. He believes every journey to the finish line starts with a single brave step."}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ===== INITIATIVES SECTION (like TMM) ===== */}
      {hasValue(initiatives) && (
        <section className="initiatives-section" id="initiatives">
          <div className="initiatives-title">{initiatives.title || "INITIATIVES"}</div>
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '-32px auto 48px', color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7' }}>
            {initiatives.subtitle || "Since its inception, RunnerX Kota Marathon has been committed to promoting health, sustainability, and the transformative power of running."}
          </div>
          <div className="initiatives-grid">
            {(initiatives.items || [
              { title: "Green Run Initiative", image: "/images/initiative-green.png", alt: "Green Run Initiative" },
              { title: "Community Fitness Drive", image: "/images/initiative-community.png", alt: "Community Fitness Drive" }
            ]).map((item, i) => (
              <div className="initiative-card" key={i}>
                <Image
                  src={item.image}
                  alt={item.alt || item.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
                <div className="initiative-card-overlay">
                  <div className="initiative-card-label">
                    {item.title}
                    <span className="initiative-card-arrow">›</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== COUNTDOWN ===== */}
      {hasValue(countdown) && (
        <section className="section section-light" id="countdown">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title" style={{ color: 'var(--text)' }}>
                 {countdown.title || "Event Starts"} <span className="accent">{countdown.title_accent || "In"}</span>
              </h2>
            </div>
            <CountdownTimer targetDate={dateIso} />
          </div>
        </section>
      )}

      {/* ===== RACE CATEGORIES ===== */}
      {hasValue(categoriesHeader) && (
        <section className="section" id="categories" style={{ paddingTop: '40px' }}>
          <div className="container">
            <div className="section-header">
              <div className="badge badge-primary">{categoriesHeader.badge || "Choose Your Race"}</div>
              <h2 className="section-title" style={{ color: 'var(--text)' }}>
                {categoriesHeader.title || "Race"} <span className="accent">{categoriesHeader.title_accent || "Categories"}</span>
              </h2>
              <p className="section-subtitle">
                {categoriesHeader.subtitle || "From a family-friendly Fun Run to the ultimate Half Marathon challenge — there's a race for every runner."}
              </p>
            </div>

            <div className="categories-grid">
              {cats.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  className="category-card"
                >
                  <div className="category-card-body">
                    <span className="category-card-icon">{cat.icon}</span>
                    <span className="category-card-distance">
                      {cat.distance}
                    </span>
                    <h3 className="category-card-name">{cat.name}</h3>
                    <p className="category-card-desc">
                      {cat.description?.slice(0, 120)}...
                    </p>
                  </div>
                  <div className="category-card-footer">
                    <span className="category-card-link">
                      Details →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== SPONSORS ===== */}
      {hasValue(sponsorsHeader) && (
        <section className="sponsors-section" id="sponsors">
          <div className="container">
            <div className="sponsors-title" style={{ marginBottom: '48px' }}>
              {sponsorsHeader.title || "SPONSORS"} <span className="outline-text">{sponsorsHeader.title_outline || "& PARTNERS"}</span>
            </div>

            {/* Title Sponsors */}
            {sponsors?.filter(s => s.title?.toLowerCase() === 'title sponsor').length > 0 && (
              <div className="sponsors-tier">
                <div className="sponsors-tier-label">Title Sponsor</div>
                <div className="sponsors-logos">
                  {sponsors.filter(s => s.title?.toLowerCase() === 'title sponsor').map(s => (
                    <div key={s.id} className="sponsor-logo-box" style={{ width: '200px', height: '90px', padding: '10px' }}>
                      <Image 
                        src={s.image?.startsWith('/') ? `${API_URL}${s.image}` : s.image} 
                        alt={s.name || "Title Sponsor"} 
                        width={180}
                        height={70}
                        style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Associate Sponsors */}
            {sponsors?.filter(s => s.title?.toLowerCase() === 'associate sponsor').length > 0 && (
              <div className="sponsors-tier">
                <div className="sponsors-tier-label">Associate Sponsor</div>
                <div className="sponsors-logos">
                  {sponsors.filter(s => s.title?.toLowerCase() === 'associate sponsor').map(s => (
                    <div key={s.id} className="sponsor-logo-box" style={{ width: '180px', height: '80px', padding: '8px' }}>
                      <Image 
                        src={s.image?.startsWith('/') ? `${API_URL}${s.image}` : s.image} 
                        alt={s.name || "Associate Sponsor"} 
                        width={160}
                        height={60}
                        style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Partners / Regular Sponsors */}
            {sponsors?.filter(s => !['title sponsor', 'associate sponsor'].includes(s.title?.toLowerCase())).length > 0 && (
              <div className="sponsors-tier">
                <div className="sponsors-tier-label">Partners</div>
                <div className="partner-marquee-container">
                  <div className="partner-marquee-track">
                    {[...sponsors.filter(s => !['title sponsor', 'associate sponsor'].includes(s.title?.toLowerCase())), 
                      ...sponsors.filter(s => !['title sponsor', 'associate sponsor'].includes(s.title?.toLowerCase())),
                      ...sponsors.filter(s => !['title sponsor', 'associate sponsor'].includes(s.title?.toLowerCase()))
                    ].map((s, idx) => (
                      <div key={`${s.id}-${idx}`} className="partner-sponsor-item">
                        <div className="partner-logo-box">
                          <Image 
                            src={s.image?.startsWith('/') ? `${API_URL}${s.image}` : s.image} 
                            alt={s.name || "Partner"} 
                            width={120}
                            height={60}
                            style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                          />
                        </div>
                        <div className="partner-sponsor-title">{s.title || "Partner"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== ABOUT RUNNERX (like TMM's About Procam section) ===== */}
      {hasValue(aboutFooter) && (
        <section className="about-footer-section" id="about-runnerx">
          <Image
            src={aboutFooter.bg_image || "/images/about-runnerx.png"}
            alt={aboutFooter.bg_alt || "Marathon panoramic view"}
            fill
            className="about-footer-bg"
            style={{ objectFit: 'cover' }}
          />
          <div className="about-footer-overlay"></div>
          <div className="about-footer-content">
            <div className="about-footer-title">{aboutFooter.title_line1 || "ABOUT"}</div>
            <div className="about-footer-title-outline">{aboutFooter.title_line2 || "RUNNERX"}</div>
            <p className="about-footer-text">
              {aboutFooter.text || "RunnerX is dedicated to building a vibrant running community in Rajasthan. Our events bring together runners of all levels, promote healthy lifestyles, and celebrate the unique cultural heritage of each host city."}
            </p>
            <Link href="/about" className="btn btn-primary btn-lg">
              Know More
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
