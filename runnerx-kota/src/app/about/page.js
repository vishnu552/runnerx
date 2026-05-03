import { getPageContent } from '@/lib/api';
import PageHero from '@/components/PageHero';

export const metadata = {
  title: 'About',
  description: 'Learn about RunnerX Kota Marathon — our mission, story, and vision for Kota\'s biggest running event.',
};

export default async function AboutPage() {
  const content = await getPageContent('about');
  // Fallbacks for content
  const hero = content?.hero || {};
  const mission = content?.mission || {};
  const vision = content?.vision || {};

  return (
    <>
      <PageHero 
        title={hero.title}
        titleAccent={hero.title_accent}
        bgImage={hero.bg_image}
      />

      {/* Mission */}
      <section className="section">
        <div className="container">
          <div className="about-text w-full max-w-5xl mx-auto">
            {mission.title && <h3>{mission.title}</h3>}
            {mission.paragraph1 && <p>{mission.paragraph1}</p>}
            {mission.paragraph2 && <p>{mission.paragraph2}</p>}
            {mission.paragraph3 && <p>{mission.paragraph3}</p>}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="section bg-[var(--brand-blue)] text-white">
        <div className="container">
          <div className="section-header mb-[60px]">
            <h2 className="overview-title flex flex-wrap items-baseline justify-center gap-5 !text-white !shadow-none">
              <span>{vision.title}</span>
              <span className="overview-title-outline !m-0 !tracking-[0.04em] !text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.8)' }}>
                {vision.title_accent}
              </span>
            </h2>
          </div>

          <div className="features-grid">
            {(vision.features || []).map((feature, i) => (
              <div className="feature-card border-white/20 bg-white/10" key={i}>
                {feature.title && <h3 className="feature-title text-2xl font-bold text-white mb-3">{feature.title}</h3>}
                {feature.desc && <p className="feature-desc text-[1.05rem] font-medium text-white/90">{feature.desc}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
