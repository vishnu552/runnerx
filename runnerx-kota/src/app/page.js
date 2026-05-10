import Link from "next/link";
import Image from "next/image";
import CountdownTimer from "@/components/CountdownTimer";
import CategorySection from "@/components/CategorySection";
import SponsorSlider from "@/components/SponsorSlider";
import {
  getPageContent,
  getCategories,
  getSponsors,
  getRunnersInfo,
  PUBLIC_API_URL,
} from "@/lib/api";

export const dynamic = "force-dynamic";

// ─── Shared helpers ───────────────────────────────────────────────────────────
const hasValue = (obj) => {
  if (!obj) return false;
  return Object.values(obj).some((val) => {
    if (val === null || val === undefined || val === "") return false;
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === "object") return Object.keys(val).length > 0;
    return true;
  });
};

const resolveImage = (val) => {
  if (!val || typeof val !== "string") return null;
  const v = val.trim();
  if (!v) return null;
  if (v.startsWith("/uploads")) return `${PUBLIC_API_URL}${v}`;
  if (v.startsWith("/") || v.startsWith("http")) return v;
  return null;
};

// ─── Main Page Component ──────────────────────────────────────────────────────
export default async function HomePage() {
  // Fetch components in parallel.
  // Note: categories and sponsors are also fetched in Layout.
  // Next.js fetch cache will ensure these don't result in redundant network calls.
  const [homeContent, categories, sponsors, runnersInfo] =
    await Promise.all([
      getPageContent("home", "KTA"),
      getCategories("KTA"),
      getSponsors("KTA"),
      getRunnersInfo("KTA"),
    ]);

  const content = homeContent || {};
  const hero = content?.hero;
  const overview = content?.overview;
  const ambassador = content?.ambassador;
  const initiatives = content?.initiatives;
  const countdown = content?.countdown;
  const categoriesHeader = content?.categories_header;
  const sponsorsHeader = content?.sponsors_header;
  const aboutFooter = content?.about_footer;

  const targetDate = countdown?.target_date;
  const dateIso = typeof targetDate === "string" && !isNaN(new Date(targetDate).getTime())
    ? targetDate
    : null;
  return (
    <>
      {/* ===== HERO BANNER ===== */}
      {hero?.banner_image && (
        <section
          className="hero-banner mt-[calc(var(--header-height,72px)+var(--countdown-height,42px))]"
          id="hero"
        >
          <Image
            src={hero.banner_image}
            alt="runnerx kota half marathon"
            width={1920}
            height={600}
            priority
            className="hero-banner-image"
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </section>
      )}

      {/* ===== EVENT OVERVIEW ===== */}
      {hasValue(overview) && (
        <section
          className="overview-section"
          id="overview"
          style={{ padding: 0 }}
        >
          <div
            className="py-16 md:py-32"
            style={{ position: "relative", overflow: "hidden" }}
          >
            {overview.image && (
              <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                <Image
                  src={overview.image}
                  alt={overview.image_alt || ""}
                  fill
                  style={{ objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(255, 255, 255, 0.5)",
                  }}
                ></div>
              </div>
            )}

            <div
              className="container"
              style={{ position: "relative", zIndex: 1 }}
            >
              <div style={{ textAlign: "left", maxWidth: "800px" }}>
                {overview.title_line1 && (
                  <div className="overview-title">{overview.title_line1}</div>
                )}
                {overview.title_line2 && (
                  <div className="overview-title-outline">
                    {overview.title_line2}
                  </div>
                )}
                {overview.text && (
                  <p
                    className="overview-text"
                    style={{
                      maxWidth: "100%",
                      marginBottom: 0,
                      color: "black",
                      fontWeight: 500,
                    }}
                  >
                    {overview.text}
                  </p>
                )}
              </div>
            </div>
          </div>

          {(resolveImage(overview.card1_desc) ||
            resolveImage(overview.card2_desc) ||
            overview.card1_title ||
            overview.card2_title) && (
            <div
              className="container"
              style={{ marginBottom: "40px", marginTop: "40px" }}
            >
              <div className="overview-cards" style={{ marginTop: 0 }}>
                {(resolveImage(overview.card1_desc) ||
                  overview.card1_title) && (
                  <div className="overview-card">
                    {resolveImage(overview.card1_desc) && (
                      <div className="overview-card-image-wrapper">
                        <Image
                          src={resolveImage(overview.card1_desc)}
                          alt={overview.card1_title || ""}
                          width={600}
                          height={400}
                          style={{
                            width: "100%",
                            height: "auto",
                            display: "block",
                          }}
                        />
                      </div>
                    )}
                    {overview.card1_title && (
                      <div className="overview-card-content">
                        <div className="overview-card-title">
                          {overview.card1_title}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {(resolveImage(overview.card2_desc) ||
                  overview.card2_title) && (
                  <div className="overview-card accent-card">
                    {resolveImage(overview.card2_desc) && (
                      <div className="overview-card-image-wrapper">
                        <Image
                          src={resolveImage(overview.card2_desc)}
                          alt={overview.card2_title || ""}
                          width={600}
                          height={400}
                          style={{
                            width: "100%",
                            height: "auto",
                            display: "block",
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ===== COUNTDOWN ===== */}
      {hasValue(countdown) && dateIso && (
        <section className="section section-light" id="countdown">
          <div className="container">
            {countdown.title && (
              <div className="section-title" style={{ textAlign: "center" }}>
                {countdown.title}
              </div>
            )}
            {dateIso && <CountdownTimer targetDate={dateIso} />}
          </div>
        </section>
      )}

      {/* ===== RACE CATEGORIES ===== */}
      {runnersInfo && runnersInfo.length > 0 && (
        <section
          className="section bg-white overflow-hidden"
          id="categories"
          style={{ paddingTop: "60px", paddingBottom: "60px" }}
        >
          <div className="container">
            <div className="section-header mb-12">
              <h2 className="section-title">
                {categoriesHeader?.title || "Race"}{" "}
                <span className="outline-text">
                  {categoriesHeader?.title_accent || "Categories"}
                </span>
              </h2>
            </div>

            <CategorySection items={runnersInfo} />
          </div>
        </section>
      )}

      {/* ===== AMBASSADOR SECTION ===== */}
      {hasValue(ambassador) && (
        <section className="ambassador-section" id="ambassador">
          <div className="ambassador-grid">
            <div className="ambassador-title-block">
              <div className="ambassador-header-group">
                {ambassador.title_line1 && (
                  <span className="ambassador-title">
                    {ambassador.title_line1}
                  </span>
                )}
                {ambassador.title_line2 && (
                  <span className="ambassador-title-italic">
                    {ambassador.title_line2}
                  </span>
                )}
              </div>
            </div>
            {ambassador.image && (
              <div className="ambassador-image-wrap">
                <Image
                  src={ambassador.image}
                  alt={ambassador.image_alt || ""}
                  width={500}
                  height={600}
                  style={{ width: "100%", height: "auto" }}
                />
              </div>
            )}
            <div>
              {ambassador.name && (
                <div className="ambassador-name">{ambassador.name}</div>
              )}
              {ambassador.bio_paragraph1 && (
                <p className="ambassador-text">{ambassador.bio_paragraph1}</p>
              )}
              {ambassador.bio_paragraph2 && (
                <p className="ambassador-text">{ambassador.bio_paragraph2}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ===== INITIATIVES SECTION ===== */}
      {hasValue(initiatives) && (
        <section className="initiatives-section" id="initiatives">
          {initiatives.title && (
            <div className="initiatives-title">{initiatives.title}</div>
          )}
          {initiatives.subtitle && (
            <div
              className="px-5"
              style={{
                textAlign: "center",
                maxWidth: "600px",
                margin: "-32px auto 48px",
                color: "var(--text-secondary)",
                fontSize: "1.05rem",
                lineHeight: "1.7",
              }}
            >
              {initiatives.subtitle}
            </div>
          )}
          <div className="initiatives-grid">
            {(() => {
              const items =
                initiatives.item1_title || initiatives.item2_title
                  ? [
                      {
                        title: initiatives.item1_title,
                        image: initiatives.item1_image,
                        alt: initiatives.item1_title,
                      },
                      {
                        title: initiatives.item2_title,
                        image: initiatives.item2_image,
                        alt: initiatives.item2_title,
                      },
                    ].filter((i) => i.title)
                  : Array.isArray(initiatives.items)
                    ? initiatives.items
                    : [];

              return items.map((item, i) => {
                const imgSrc = resolveImage(item.image);
                return (
                  <div className="initiative-card" key={i}>
                    {imgSrc && (
                      <Image
                        src={imgSrc}
                        alt={item.alt || item.title || ""}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    )}
                    <div className="initiative-card-overlay">
                      <div className="initiative-card-label">
                        {item.title}
                        <span className="initiative-card-arrow">›</span>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </section>
      )}

      {/* ===== SPONSORS ===== */}
      {sponsors && sponsors.length > 0 && (
        <section className="sponsors-section" id="sponsors">
          <div className="container">
            <div className="sponsors-title" style={{ marginBottom: "48px" }}>
              {sponsorsHeader?.title || "Our"}{" "}
              <span className="outline-text">
                {sponsorsHeader?.title_outline || "Sponsors"}
              </span>
            </div>

            {/* Title Sponsors */}
            {sponsors.filter((s) => s.title?.toLowerCase() === "title sponsor")
              .length > 0 && (
              <div className="sponsors-tier">
                <div className="sponsors-tier-label">Title Sponsor</div>
                <div className="sponsors-logos">
                  {sponsors
                    .filter((s) => s.title?.toLowerCase() === "title sponsor")
                    .map((s) => (
                      <div
                        key={s.id}
                        className="sponsor-logo-box"
                        style={{
                          width: "180px",
                          height: "180px",
                          padding: "16px",
                          aspectRatio: "1 / 1",
                        }}
                      >
                        {s.image && (
                          <Image
                            src={
                              s.image.startsWith("/")
                                ? `${PUBLIC_API_URL}${s.image}`
                                : s.image
                            }
                            alt={s.name || ""}
                            width={160}
                            height={160}
                            style={{
                              objectFit: "contain",
                              width: "100%",
                              height: "100%",
                            }}
                          />
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {sponsors.filter((s) => s.title?.toLowerCase() === "title sponsor")
              .length > 0 &&
              sponsors.filter(
                (s) => s.title?.toLowerCase() === "associate sponsor",
              ).length > 0 && (
                <div
                  style={{
                    height: "1px",
                    backgroundColor: "rgba(0,0,0,0.1)",
                    margin: "48px 0",
                  }}
                ></div>
              )}

            {/* Associate Sponsors */}
            {sponsors.filter(
              (s) => s.title?.toLowerCase() === "associate sponsor",
            ).length > 0 && (
              <div className="sponsors-tier">
                <div className="sponsors-tier-label">Associate Sponsor</div>
                <div className="sponsors-logos">
                  {sponsors
                    .filter(
                      (s) => s.title?.toLowerCase() === "associate sponsor",
                    )
                    .map((s) => (
                      <div
                        key={s.id}
                        className="sponsor-logo-box"
                        style={{
                          width: "150px",
                          height: "150px",
                          padding: "14px",
                          aspectRatio: "1 / 1",
                        }}
                      >
                        {s.image && (
                          <Image
                            src={
                              s.image.startsWith("/")
                                ? `${PUBLIC_API_URL}${s.image}`
                                : s.image
                            }
                            alt={s.name || ""}
                            width={130}
                            height={130}
                            style={{
                              objectFit: "contain",
                              width: "100%",
                              height: "100%",
                            }}
                          />
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {sponsors.filter(
              (s) => s.title?.toLowerCase() === "associate sponsor",
            ).length > 0 &&
              sponsors.filter(
                (s) =>
                  !["title sponsor", "associate sponsor"].includes(
                    s.title?.toLowerCase(),
                  ),
              ).length > 0 && (
                <div
                  style={{
                    height: "1px",
                    backgroundColor: "rgba(0,0,0,0.1)",
                    margin: "48px 0",
                  }}
                ></div>
              )}

            {/* Partners */}
            {sponsors.filter(
              (s) =>
                !["title sponsor", "associate sponsor"].includes(
                  s.title?.toLowerCase(),
                ),
            ).length > 0 && (
              <div className="sponsors-tier">
                <div className="sponsors-tier-label">Partners</div>
                <SponsorSlider
                  sponsors={sponsors.filter(
                    (s) =>
                      !["title sponsor", "associate sponsor"].includes(
                        s.title?.toLowerCase(),
                      ),
                  )}
                  apiUrl={PUBLIC_API_URL}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== ABOUT RUNNERX ===== */}
      {hasValue(aboutFooter) && (
        <section className="about-footer-section" id="about-runnerx">
          {aboutFooter.bg_image && (
            <Image
              src={aboutFooter.bg_image}
              alt={aboutFooter.bg_alt || ""}
              fill
              className="about-footer-bg"
              style={{ objectFit: "cover" }}
            />
          )}
          <div className="about-footer-overlay"></div>
          <div className="about-footer-content">
            {aboutFooter.title_line1 && (
              <div className="about-footer-title">
                {aboutFooter.title_line1}
              </div>
            )}
            {aboutFooter.title_line2 && (
              <div className="about-footer-title-outline">
                {aboutFooter.title_line2}
              </div>
            )}
            {aboutFooter.text && (
              <p className="about-footer-text">{aboutFooter.text}</p>
            )}
            <Link href="/about" className="btn btn-primary btn-lg">
              Know More
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
