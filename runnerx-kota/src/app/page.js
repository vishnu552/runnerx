import Link from 'next/link';
import Image from 'next/image';
import { categories as fallbackCategories, eventInfo as fallbackEventInfo } from '@/data/categories';
import CountdownTimer from '@/components/CountdownTimer';
import CategorySlider from '@/components/CategorySlider';
import { getPageContent, getGlobalContent, getCategories, getEvents, getSponsors, getRunnersInfo, PUBLIC_API_URL } from '@/lib/api';
import SponsorSlider from '@/components/SponsorSlider';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [content, globalContent, categories, eventsData, sponsors, runnersInfoData] = await Promise.all([
    getPageContent('home'),
    getGlobalContent(),
    getCategories(),
    getEvents(),
    getSponsors(),
    getRunnersInfo('KTA')
  ]);
  
  const cats = categories || fallbackCategories;
  const runnersInfo = (runnersInfoData && runnersInfoData.length > 0) ? runnersInfoData : [
    { title: "Bib Collection", image: "/images/overview-runner.png", link: "/bib-collection" },
    { title: "Race Start Timings", image: "/images/overview-runner.png", link: "/event-rules" },
    { title: "Route Maps", image: "/images/overview-runner.png", link: "/route" },
    { title: "Venue Maps", image: "/images/overview-runner.png", link: "/venue" },
    { title: "Runner's Guides", image: "/images/overview-runner.png", link: "/guides" },
    { title: "Medical Advisory", image: "/images/overview-runner.png", link: "/medical-advisory" }
  ];
  const hero = content?.hero;
  const overview = content?.overview;
  const ambassador = content?.ambassador;
  const initiatives = content?.initiatives;
  const countdown = content?.countdown;
  const categoriesHeader = content?.categories_header;
  const sponsorsHeader = content?.sponsors_header;
  const aboutFooter = content?.about_footer;
  console.log(hero);
  const expectedParticipants = globalContent?.event_info?.expected_participants || fallbackEventInfo.expectedParticipants;

  let nearestEvent = null;
  if (eventsData && eventsData.length > 0) {
    // Filter for KOTA site only
    const kotaEvents = eventsData.filter(e => e.siteFor === 'KOTA');
    
    const futureEvents = kotaEvents.filter(e => new Date(e.date) > new Date());
    if (futureEvents.length > 0) {
      futureEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
      nearestEvent = futureEvents[0];
    } else if (kotaEvents.length > 0) {
      nearestEvent = kotaEvents.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    }
  }

  const formattedDate = nearestEvent ? new Date(nearestEvent.date).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  }) : (hero?.date || "November 15, 2026");

  const dateIso = nearestEvent ? nearestEvent.date : (countdown?.target_date || "2026-11-15T05:30:00+05:30");
  console.log(dateIso);
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
        <section className="hero-banner mt-[calc(var(--header-height,72px)+var(--countdown-height,42px))]" id="hero">
          <Image
            src={hero.banner_image || ""}
            alt={"runnerx kota half marathon"}
            width={1920}
            height={600}
            priority
            unoptimized
            className="hero-banner-image"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
          {/* <div className="hero-banner-overlay"></div> */}
        </section>
      )}

      {/* ===== EVENT OVERVIEW (like TMM's Overview section) ===== */}
      {hasValue(overview) && (
        <section className="overview-section" id="overview" style={{ padding: 0 }}>
          {/* Text Section with Background */}
          <div className="py-16 md:py-32" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
              <Image
                src={overview.image || "/images/overview-runner.png"}
                alt={overview.image_alt || "Aerial view of marathon runners"}
                fill
                unoptimized
                style={{ objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(255, 255, 255, 0.5)' }}></div>
            </div>

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ textAlign: 'left', maxWidth: '800px' }}>
                <div className="overview-title">{overview.title_line1 || "EVENT"}</div>
                <div className="overview-title-outline">{overview.title_line2 || "OVERVIEW"}</div>
                <p className="overview-text" style={{ maxWidth: '100%', marginBottom: 0, color: 'black', fontWeight: 500 }}>
                  {overview.text || "Welcome to the 1st Edition of RunnerX Kota Marathon — a celebration of endurance, community, and the vibrant spirit of Hadoti. Run through the scenic Chambal Riverfront, past historic landmarks, and experience the energy of Kota like never before. With four race categories from a family-friendly 3K Fun Run to the ultimate Half Marathon challenge, there's a race for every runner."}
                </p>
              </div>
            </div>
          </div>

          {/* Feature Cards Section */}
          <div className="container" style={{marginBottom:'40px', marginTop: '40px' }}>
            <div className="overview-cards" style={{ marginTop: 0 }}>
              {(() => {
                const getCardImage = (val, fallback) => {
                  if (!val || typeof val !== 'string') return fallback;
                  const cleanVal = val.trim();
                  if (cleanVal.startsWith('/uploads')) return `${PUBLIC_API_URL}${cleanVal}`;
                  if (cleanVal.startsWith('/') || cleanVal.startsWith('http')) return cleanVal;
                  return fallback;
                };

                return (
                  <>
                    <div className="overview-card">
                      <div className="overview-card-image-wrapper">
                        <Image
                          src={getCardImage(overview.card1_desc, "/images/cat-3k.png")}
                          alt={overview.card1_title || "Category"}
                          width={600}
                          height={400}
                          unoptimized
                          style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                      </div>
                      <div className="overview-card-content">
                        <div className="overview-card-title">{overview.card1_title}</div>
                      </div>
                    </div>
                    <div className="overview-card accent-card">
                      <div className="overview-card-image-wrapper">
                        <Image
                          src={getCardImage(overview.card2_desc, "/images/cat-half.png")}
                          alt={overview.card2_title || "Participants"}
                          width={600}
                          height={400}
                          unoptimized
                          style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                      </div>
                      {/* <div className="overview-card-content">
                        <div className="overview-card-title">{overview.card2_title}</div>
                      </div> */}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </section>
      )}
      {hasValue(countdown) && (
        <section className="section section-light" id="countdown">
          <div className="container">
            <div className="section-title" style={{ textAlign: 'center' }}>
               {countdown.title}
            </div>
            <CountdownTimer targetDate={dateIso} />
          </div>
        </section>
      )}

      {/* ===== RACE CATEGORIES (Expanding Accordion with RunnersInfo Data) ===== */}
      {hasValue(categoriesHeader) && (
        <section className="section bg-white overflow-hidden" id="categories" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
          <div className="container">
            <div className="section-header mb-12">
              <h2 className="section-title">
                {categoriesHeader.title || "RACE"} <span className="outline-text">{categoriesHeader.title_accent || "CATEGORIES"}</span>
              </h2>
            </div>

            {/* Desktop Accordion */}
            <div className="hidden md:flex md:flex-row gap-4 h-[500px] group/container">
              {runnersInfo.map((item, idx) => (
                <Link 
                  key={idx}
                  href={item.link || '#'}
                  className={`relative overflow-hidden transition-all duration-700 ease-in-out cursor-pointer group rounded-2xl
                    ${idx === 0 ? 'flex-[4] group-hover/container:flex-1' : 'flex-1'} 
                    hover:!flex-[4] h-full`}
                >
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <Image
                      src={item.image || "/images/overview-runner.png"}
                      alt={item.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 group-hover:from-black/90" />
                  </div>

                  {/* Content Container */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                    
                    {/* Vertical Title (Visible when card is narrow) - Instant toggle */}
                    <div className={`absolute bottom-12 left-1/2 -translate-x-1/2
                      ${idx === 0 
                        ? 'opacity-0 group-hover/container:opacity-100 group-hover:!opacity-0' 
                        : 'opacity-100 group-hover:opacity-0'} 
                      pointer-events-none`}
                    >
                      <h3 className="text-white text-xl md:text-2xl font-bold uppercase tracking-[0.25em] -rotate-90 whitespace-nowrap drop-shadow-lg w-max origin-left translate-x-1/2">
                        {item.title}
                      </h3>
                    </div>

                    {/* Horizontal Title (Visible when expanded) - Instant toggle */}
                    <div className={`w-full relative z-10
                      ${idx === 0 
                        ? 'opacity-100 group-hover/container:opacity-0 group-hover:!opacity-100' 
                        : 'opacity-0 group-hover:opacity-100'}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-white text-2xl md:text-3xl font-black italic uppercase leading-none drop-shadow-xl">
                          {item.title}
                        </h3>
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white flex items-center justify-center text-black flex-shrink-0 transition-transform duration-500 group-hover:rotate-45 shadow-lg">
                          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile Slider */}
            <CategorySlider items={runnersInfo} />
          </div>
        </section>
      )}
      {/* ===== AMBASSADOR SECTION (like TMM's International Event Ambassador) ===== */}
      {hasValue(ambassador) && (
        <section className="ambassador-section" id="ambassador">
          <div className="ambassador-grid">
            <div className="ambassador-title-block">
              <div className="ambassador-header-group">
                <span className="ambassador-title">{ambassador.title_line1}</span>
                <span className="ambassador-title-italic">{ambassador.title_line2}</span>
              </div>
            </div>
            <div className="ambassador-image-wrap">
              <Image
                src={ambassador.image || "/images/ambassador.png"}
                alt={ambassador.image_alt || "Event Ambassador"}
                width={500}
                height={600}
                unoptimized
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
            <div>
              <div className="ambassador-name">{ambassador.name}</div>
              <p className="ambassador-text">
                {ambassador.bio_paragraph1}
              </p>
              <p className="ambassador-text">
                {ambassador.bio_paragraph2}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ===== INITIATIVES SECTION (like TMM) ===== */}
      {hasValue(initiatives) && (
        <section className="initiatives-section" id="initiatives">
          <div className="initiatives-title">{initiatives.title || "INITIATIVES"}</div>
          <div className="px-5" style={{ textAlign: 'center', maxWidth: '600px', margin: '-32px auto 48px', color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7' }}>
            {initiatives.subtitle || "Since its inception, RunnerX Kota Marathon has been committed to promoting health, sustainability, and the transformative power of running."}
          </div>
          <div className="initiatives-grid">
            {(() => {
              let items = [];
              if (initiatives) {
                if (initiatives.item1_title || initiatives.item2_title) {
                  if (initiatives.item1_title) {
                    items.push({ title: initiatives.item1_title, image: initiatives.item1_image || "/images/initiative-green.png", alt: initiatives.item1_title });
                  }
                  if (initiatives.item2_title) {
                    items.push({ title: initiatives.item2_title, image: initiatives.item2_image || "/images/initiative-community.png", alt: initiatives.item2_title });
                  }
                } else if (initiatives.items) {
                  items = Array.isArray(initiatives.items) ? initiatives.items : [];
                }
              }
              if (items.length === 0) {
                items = [
                  { title: "Green Run Initiative", image: "/images/initiative-green.png", alt: "Green Run Initiative" },
                  { title: "Community Fitness Drive", image: "/images/initiative-community.png", alt: "Community Fitness Drive" }
                ];
              }
              return items;
            })().map((item, i) => (
              <div className="initiative-card" key={i}>
                <Image
                  src={item.image?.startsWith('/uploads') ? `${PUBLIC_API_URL}${item.image}` : item.image}
                  alt={item.alt || item.title}
                  fill
                  unoptimized
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
                        src={s.image?.startsWith('/') ? `${PUBLIC_API_URL}${s.image}` : s.image}
                        alt={s.name || "Title Sponsor"} 
                        width={180}
                        height={70}
                        unoptimized
                        style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Separator */}
            {sponsors?.filter(s => s.title?.toLowerCase() === 'title sponsor').length > 0 && 
             sponsors?.filter(s => s.title?.toLowerCase() === 'associate sponsor').length > 0 && (
              <div style={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.1)', margin: '48px 0' }}></div>
            )}

            {/* Associate Sponsors */}
            {sponsors?.filter(s => s.title?.toLowerCase() === 'associate sponsor').length > 0 && (
              <div className="sponsors-tier">
                <div className="sponsors-tier-label">Associate Sponsor</div>
                <div className="sponsors-logos">
                  {sponsors.filter(s => s.title?.toLowerCase() === 'associate sponsor').map(s => (
                    <div key={s.id} className="sponsor-logo-box" style={{ width: '180px', height: '80px', padding: '8px' }}>
                      <Image 
                        src={s.image?.startsWith('/') ? `${PUBLIC_API_URL}${s.image}` : s.image}
                        alt={s.name || "Associate Sponsor"} 
                        width={160}
                        height={60}
                        unoptimized
                        style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Separator */}
            {sponsors?.filter(s => s.title?.toLowerCase() === 'associate sponsor').length > 0 && 
             sponsors?.filter(s => !['title sponsor', 'associate sponsor'].includes(s.title?.toLowerCase())).length > 0 && (
              <div style={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.1)', margin: '48px 0' }}></div>
            )}

            {/* Partners / Regular Sponsors */}
            {sponsors?.filter(s => !['title sponsor', 'associate sponsor'].includes(s.title?.toLowerCase())).length > 0 && (
              <div className="sponsors-tier">
                <div className="sponsors-tier-label">Partners</div>
                <SponsorSlider 
                  sponsors={sponsors.filter(s => !['title sponsor', 'associate sponsor'].includes(s.title?.toLowerCase()))} 
                  apiUrl={PUBLIC_API_URL}
                />
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
            unoptimized
            className="about-footer-bg"
            style={{ objectFit: 'cover' }}
          />
          <div className="about-footer-overlay"></div>
          <div className="about-footer-content">
            <div className="about-footer-title">{aboutFooter.title_line1 || "ABOUT"}</div>
            <div className="about-footer-title-outline">{aboutFooter.title_line2 || "RUNNERX"}</div>
            <p className="about-footer-text">
              {aboutFooter.text }
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
