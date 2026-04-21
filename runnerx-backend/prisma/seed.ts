import "dotenv/config";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from "bcrypt";

const ADMIN_EMAIL = "admin@runnerx.com";
const ADMIN_PASSWORD = "Test1234";
const ADMIN_NAME = "RunnerX Admin";

// Helper to create content entries
function c(
  siteFor: string,
  page: string,
  section: string,
  key: string,
  value: string,
  type: string = "TEXT",
  sortOrder: number = 0
) {
  return { siteFor, page, section, key, value, type, sortOrder, isActive: true };
}

// ─── All KTA (Kota) Page Content ──────────────────────────────────────────────
function getKtaContent() {
  const S = "KTA";
  return [
    // ═══════════════════════════════════════════════════════
    // GLOBAL — shared across all pages (eventInfo, social)
    // ═══════════════════════════════════════════════════════
    c(S, "global", "event_info", "name", "RunnerX Kota Marathon"),
    c(S, "global", "event_info", "tagline", "Run Through the Heart of Hadoti"),
    c(S, "global", "event_info", "date", "Sunday, 15th November 2026"),
    c(S, "global", "event_info", "date_iso", "2026-11-15T05:30:00+05:30"),
    c(S, "global", "event_info", "location", "Kota, Rajasthan, India"),
    c(S, "global", "event_info", "start_venue", "Chambal Garden & Kota Barrage"),
    c(S, "global", "event_info", "edition", "1st Edition"),
    c(S, "global", "event_info", "expected_participants", "5,000+"),
    c(S, "global", "event_info", "email", "info@runnerxkota.com"),
    c(S, "global", "event_info", "phone", "+91 98765 43210"),
    c(S, "global", "social", "instagram", "https://instagram.com/runnerxkota", "LINK"),
    c(S, "global", "social", "facebook", "https://facebook.com/runnerxkota", "LINK"),
    c(S, "global", "social", "twitter", "https://x.com/runnerxkota", "LINK"),

    // ═══════════════════════════════════════════════════════
    // HOME PAGE
    // ═══════════════════════════════════════════════════════

    // Hero
    c(S, "home", "hero", "banner_image", "/images/hero-banner.png", "IMAGE"),
    c(S, "home", "hero", "banner_alt", "Marathon runners at dawn on a bridge"),
    c(S, "home", "hero", "label", "Race Day"),
    c(S, "home", "hero", "date", "November 15, 2026"),
    c(S, "home", "hero", "cta_primary_text", "Explore Categories"),
    c(S, "home", "hero", "cta_primary_link", "/categories", "LINK"),
    c(S, "home", "hero", "cta_secondary_text", "Learn More"),
    c(S, "home", "hero", "cta_secondary_link", "/about", "LINK"),

    // Overview
    c(S, "home", "overview", "title_line1", "EVENT"),
    c(S, "home", "overview", "title_line2", "OVERVIEW"),
    c(S, "home", "overview", "text", "Welcome to the 1st Edition of RunnerX Kota Marathon — a celebration of endurance, community, and the vibrant spirit of Hadoti. Run through the scenic Chambal Riverfront, past historic landmarks, and experience the energy of Kota like never before. With four race categories from a family-friendly 3K Fun Run to the ultimate Half Marathon challenge, there's a race for every runner."),
    c(S, "home", "overview", "image", "/images/overview-runner.png", "IMAGE"),
    c(S, "home", "overview", "image_alt", "Aerial view of marathon runners"),
    c(S, "home", "overview", "card1_title", "4 Race Categories"),
    c(S, "home", "overview", "card1_desc", "3K Fun Run • 5K Sprint • 10K Challenge • Half Marathon"),
    c(S, "home", "overview", "card2_title", "5,000+ Runners"),
    c(S, "home", "overview", "card2_desc", "Join the biggest running event in Hadoti region"),

    // Ambassador
    c(S, "home", "ambassador", "title_line1", "LOCAL"),
    c(S, "home", "ambassador", "title_line2", "EVENT AMBASSADOR"),
    c(S, "home", "ambassador", "image", "/images/ambassador.png", "IMAGE"),
    c(S, "home", "ambassador", "image_alt", "Event Ambassador"),
    c(S, "home", "ambassador", "name", "Rajesh Sharma | 2026"),
    c(S, "home", "ambassador", "bio_paragraph1", "A celebrated marathon runner from Rajasthan, Rajesh Sharma has been inspiring thousands of young athletes across the state. With multiple podium finishes in national marathons and a passion for community fitness, he embodies the spirit of RunnerX."),
    c(S, "home", "ambassador", "bio_paragraph2", "His dedication to promoting running culture in Kota and beyond has made him a natural choice as the ambassador for the inaugural edition of RunnerX Kota Marathon. He believes every journey to the finish line starts with a single brave step."),

    // Initiatives
    c(S, "home", "initiatives", "title", "INITIATIVES"),
    c(S, "home", "initiatives", "subtitle", "Since its inception, RunnerX Kota Marathon has been committed to promoting health, sustainability, and the transformative power of running."),
    c(S, "home", "initiatives", "items", JSON.stringify([
      { title: "Green Run Initiative", image: "/images/initiative-green.png", alt: "Green Run Initiative" },
      { title: "Community Fitness Drive", image: "/images/initiative-community.png", alt: "Community Fitness Drive" }
    ]), "JSON"),

    // Countdown
    c(S, "home", "countdown", "title", "Event Starts"),
    c(S, "home", "countdown", "title_accent", "In"),
    c(S, "home", "countdown", "target_date", "2026-11-15T05:30:00+05:30"),

    // Categories header
    c(S, "home", "categories_header", "badge", "Choose Your Race"),
    c(S, "home", "categories_header", "title", "Race"),
    c(S, "home", "categories_header", "title_accent", "Categories"),
    c(S, "home", "categories_header", "subtitle", "From a family-friendly Fun Run to the ultimate Half Marathon challenge — there's a race for every runner."),

    // Sponsors header
    c(S, "home", "sponsors_header", "title", "SPONSORS"),
    c(S, "home", "sponsors_header", "title_outline", "& PARTNERS"),

    // About footer section
    c(S, "home", "about_footer", "bg_image", "/images/about-runnerx.png", "IMAGE"),
    c(S, "home", "about_footer", "bg_alt", "Marathon panoramic view"),
    c(S, "home", "about_footer", "title_line1", "ABOUT"),
    c(S, "home", "about_footer", "title_line2", "RUNNERX"),
    c(S, "home", "about_footer", "text", "RunnerX is dedicated to building a vibrant running community in Rajasthan. Our events bring together runners of all levels, promote healthy lifestyles, and celebrate the unique cultural heritage of each host city."),

    // ═══════════════════════════════════════════════════════
    // ABOUT PAGE
    // ═══════════════════════════════════════════════════════

    // Hero
    c(S, "about", "hero", "badge", "Our Story"),
    c(S, "about", "hero", "title", "About"),
    c(S, "about", "hero", "title_accent", "RunnerX Kota"),
    c(S, "about", "hero", "subtitle", "Bringing the spirit of world-class marathon events to the heart of Hadoti region."),

    // Mission
    c(S, "about", "mission", "title", "Our Mission"),
    c(S, "about", "mission", "paragraph1", "RunnerX Kota Marathon is born from a simple belief — every city deserves a world-class running event. Kota, known for its educational institutions and the scenic Chambal River, is the perfect canvas for a marathon that celebrates both fitness and community."),
    c(S, "about", "mission", "paragraph2", "Inspired by iconic events like the Tata Mumbai Marathon and the Vedanta Delhi Half Marathon, we aim to create an experience that puts Kota on the running map of India. From the beginner taking their first steps in the 3 KM Fun Run to the seasoned athlete conquering the Half Marathon — RunnerX Kota is for everyone."),
    c(S, "about", "mission", "paragraph3", "Our routes are designed to showcase the beauty of Kota — the serene Chambal Garden, the majestic Kota Barrage, the historic Kishore Sagar Lake, and the vibrant streets that make this city unique."),

    // Vision
    c(S, "about", "vision", "badge", "Our Vision"),
    c(S, "about", "vision", "title", "More Than"),
    c(S, "about", "vision", "title_accent", "a Marathon"),
    c(S, "about", "vision", "subtitle", "We're building a movement that goes beyond race day."),
    c(S, "about", "vision", "features", JSON.stringify([
      { icon: "🌿", title: "Green Running", desc: "Eco-friendly event management with biodegradable cups, minimal plastic use, and post-event clean-up drives along the Chambal riverside." },
      { icon: "🎓", title: "Student Power", desc: "Special engagement for Kota's massive student community — promoting fitness alongside academics. Discounted entries for students." },
      { icon: "❤️", title: "Run for a Cause", desc: "A portion of every registration goes to local NGOs supporting education, health, and environmental conservation in the Hadoti region." }
    ]), "JSON"),

    // Timeline
    c(S, "about", "timeline", "badge", "Race Day"),
    c(S, "about", "timeline", "title", "Event Day"),
    c(S, "about", "timeline", "title_accent", "Timeline"),
    c(S, "about", "timeline", "items", JSON.stringify([
      { time: "4:00 AM", title: "Gates Open", desc: "Venue gates open. Bib collection & bag drop for registered runners." },
      { time: "4:30 AM", title: "Half Marathon Reporting", desc: "Half Marathon runners assemble at Nayapura Circle start line." },
      { time: "5:30 AM", title: "Half Marathon Flag-Off", desc: "The flagship 21.1 KM race begins at dawn." },
      { time: "6:30 AM", title: "10 KM Challenge Flag-Off", desc: "10 KM runners start from Kota Barrage." },
      { time: "7:00 AM", title: "5 KM Sprint Flag-Off", desc: "Sprint category runners start from Chambal Garden." },
      { time: "7:30 AM", title: "3 KM Fun Run Flag-Off", desc: "Fun Run begins! Families, kids, and beginners start their journey." },
      { time: "9:00 AM", title: "Prize Ceremony & Breakfast", desc: "Awards, celebrations, and post-race breakfast for all finishers." }
    ]), "JSON"),

    // Team
    c(S, "about", "team", "title", "Meet"),
    c(S, "about", "team", "title_accent", "the Team"),
    c(S, "about", "team", "subtitle", "RunnerX Kota is organized by a passionate team of runners, event managers, and community leaders dedicated to making Kota a running city."),
    c(S, "about", "team", "cta_title", "Want to Volunteer?"),
    c(S, "about", "team", "cta_subtitle", "We need 500+ volunteers on race day. Be part of the team that makes it happen!"),
    c(S, "about", "team", "cta_button_text", "Get in Touch →"),
    c(S, "about", "team", "cta_button_link", "/contact", "LINK"),

    // ═══════════════════════════════════════════════════════
    // FAQ PAGE
    // ═══════════════════════════════════════════════════════
    c(S, "faq", "hero", "badge", "Help"),
    c(S, "faq", "hero", "title", "Frequently Asked"),
    c(S, "faq", "hero", "title_accent", "Questions"),
    c(S, "faq", "hero", "subtitle", "Got questions? We've got answers. Find everything you need to know about the event."),
    c(S, "faq", "footer", "text", "Still have questions? We're happy to help!"),
    c(S, "faq", "footer", "cta_text", "Contact Us →"),
    c(S, "faq", "footer", "cta_link", "/contact", "LINK"),

    // ═══════════════════════════════════════════════════════
    // CONTACT PAGE
    // ═══════════════════════════════════════════════════════
    c(S, "contact", "hero", "badge", "Reach Out"),
    c(S, "contact", "hero", "title", "Contact"),
    c(S, "contact", "hero", "title_accent", "Us"),
    c(S, "contact", "hero", "subtitle", "Have questions about the event? Want to partner or volunteer? We'd love to hear from you."),
    c(S, "contact", "form", "title", "Send us a Message"),
    c(S, "contact", "form", "disclaimer", "* This form is currently for display purposes. Please email us directly."),
    c(S, "contact", "info", "title", "Contact Information"),
    c(S, "contact", "info", "office_hours", "Monday – Saturday: 10:00 AM – 6:00 PM\nSunday: Closed"),
    c(S, "contact", "info", "map_label", "Map — Chambal Garden, Kota"),

    // ═══════════════════════════════════════════════════════
    // GALLERY PAGE
    // ═══════════════════════════════════════════════════════
    c(S, "gallery", "hero", "badge", "Moments"),
    c(S, "gallery", "hero", "title_accent", "Gallery"),
    c(S, "gallery", "hero", "subtitle", "Capturing the energy, emotion, and spirit of running in Kota."),
    c(S, "gallery", "content", "notice", "📸 Images from our upcoming event will be showcased here. Stay tuned!"),
    c(S, "gallery", "content", "items", JSON.stringify([
      { id: 1, title: "Runners at Dawn", desc: "Early morning start along Chambal River" },
      { id: 2, title: "Fun Run Families", desc: "3 KM Fun Run with families and kids" },
      { id: 3, title: "Sprint Finish", desc: "Exciting 5 KM sprint finish line moments" },
      { id: 4, title: "Challenge Route", desc: "10 KM runners passing Kota Barrage" },
      { id: 5, title: "Half Marathon Start", desc: "The flagship race flag-off at dawn" },
      { id: 6, title: "Medal Moment", desc: "Finishers celebrating with their medals" },
      { id: 7, title: "Kota Skyline", desc: "Beautiful view of Kota from the route" },
      { id: 8, title: "Community Spirit", desc: "Volunteers and supporters cheering runners" }
    ]), "JSON"),

    // ═══════════════════════════════════════════════════════
    // ROUTE PAGE
    // ═══════════════════════════════════════════════════════
    c(S, "route", "hero", "badge", "Course Map"),
    c(S, "route", "hero", "title", "Route &"),
    c(S, "route", "hero", "title_accent", "Venue"),
    c(S, "route", "hero", "subtitle", "Run through the most scenic parts of Kota along the Chambal River."),
    c(S, "route", "map", "placeholder_text", "Detailed course map coming soon"),
    c(S, "route", "map", "placeholder_desc", "Routes along Chambal Garden → Kota Barrage → Kishore Sagar Lake"),
    c(S, "route", "start_finish", "title", "Start &"),
    c(S, "route", "start_finish", "title_accent", "Finish Points"),
    c(S, "route", "start_finish", "subtitle", "Each category has a designated start point, with all races finishing at Chambal Garden."),
    c(S, "route", "aid_stations", "title", "On-Course"),
    c(S, "route", "aid_stations", "title_accent", "Support"),
    c(S, "route", "aid_stations", "subtitle", "Everything you need along the way to keep you going strong."),
    c(S, "route", "aid_stations", "items", JSON.stringify([
      { icon: "💧", title: "Hydration Stations", desc: "Water and electrolyte stations at every 2-2.5 km for all categories. Energy gels available for 10K and Half Marathon runners." },
      { icon: "🏥", title: "Medical Support", desc: "Trained medical teams stationed every 2-3 km. Ambulance support on standby. First aid at every hydration station." },
      { icon: "🚗", title: "Parking & Access", desc: "Free parking at Chambal Garden and nearby designated areas. Easy access via Kota Junction Railway Station (5 km)." }
    ]), "JSON"),
    c(S, "route", "venue_highlights", "title", "Venue"),
    c(S, "route", "venue_highlights", "title_accent", "Highlights"),
    c(S, "route", "venue_highlights", "subtitle", "Kota's most scenic landmarks along your route."),
    c(S, "route", "venue_highlights", "items", JSON.stringify([
      { icon: "🌿", value: "Chambal Garden", label: "Start & Finish Zone" },
      { icon: "🌊", value: "Kota Barrage", label: "Iconic Riverside Point" },
      { icon: "🏛️", value: "Kishore Sagar", label: "Historic Lake" },
      { icon: "🎡", value: "Seven Wonders", label: "Park & Viewpoint" }
    ]), "JSON"),

    // ═══════════════════════════════════════════════════════
    // PRIVACY POLICY PAGE
    // ═══════════════════════════════════════════════════════
    c(S, "privacy", "hero", "title", "Privacy Policy"),
    c(S, "privacy", "hero", "subtitle", "Your privacy matters to us. Here's how we handle your information."),
    c(S, "privacy", "content", "last_updated", "Last updated: March 26, 2026"),

    // ═══════════════════════════════════════════════════════
    // TERMS PAGE
    // ═══════════════════════════════════════════════════════
    c(S, "terms", "hero", "title", "Terms & Conditions"),
    c(S, "terms", "hero", "subtitle", "Please read these terms carefully before participating in the event."),
    c(S, "terms", "content", "last_updated", "Last updated: March 26, 2026"),
  ];
}

// ─── Category tab definitions for seed ────────────────────────────────────────
interface CategorySeed {
  siteFor: string;
  slug: string;
  name: string;
  distanceLabel: string;
  icon: string;
  price: number;
  discountPrice?: number | null;
  tagline: string;
  order: number;
  tabs: { title: string; body: string; icon: string; sortOrder: number }[];
}

function getKotaCategories(): CategorySeed[] {
  return [
    {
      siteFor: "KTA",
      slug: "3km",
      name: "3K Fun Run",
      distanceLabel: "3K",
      icon: "🎉",
      price: 299,
      tagline: "Run for Joy, Run for Fun!",
      order: 1,
      tabs: [
        {
          title: "About This Race",
          icon: "📋",
          sortOrder: 1,
          body: "<p>The 3 KM Fun Run is designed for everyone — families, kids, and first-time runners. Walk, jog, or run through the scenic streets of Kota and enjoy the festive marathon atmosphere without the pressure of competitive timing.</p>",
        },
        {
          title: "Route Details",
          icon: "🗺️",
          sortOrder: 2,
          body: `<div class="detail-grid">
<div class="detail-item"><strong>Start Point:</strong> Chambal Garden Main Gate</div>
<div class="detail-item"><strong>Finish Point:</strong> Chambal Garden Main Gate</div>
<div class="detail-item"><strong>Terrain:</strong> Flat city roads</div>
<div class="detail-item"><strong>Route Highlights:</strong> Chambal Garden, Kishore Sagar Lake view</div>
</div>`,
        },
        {
          title: "Race Day Timing",
          icon: "⏰",
          sortOrder: 3,
          body: `<div class="detail-grid">
<div class="detail-item"><strong>Reporting Time:</strong> 6:00 AM</div>
<div class="detail-item"><strong>Flag-Off Time:</strong> 7:30 AM</div>
<div class="detail-item"><strong>Cut-Off Time:</strong> 1 hour</div>
<div class="detail-item"><strong>Age Eligibility:</strong> 6 years and above</div>
</div>`,
        },
        {
          title: "Highlights",
          icon: "✨",
          sortOrder: 4,
          body: `<ul>
<li>Family-friendly atmosphere</li>
<li>No competitive timing</li>
<li>Scenic city route past Chambal Garden</li>
<li>Participation medal & certificate for all finishers</li>
<li>Refreshments at finish line</li>
</ul>`,
        },
        {
          title: "Who Should Run",
          icon: "👟",
          sortOrder: 5,
          body: `<ul>
<li>Families with kids (ages 6+)</li>
<li>First-time runners</li>
<li>Senior citizens looking for light exercise</li>
<li>Anyone who wants to soak in the marathon vibe</li>
</ul>`,
        },
        {
          title: "What's Included",
          icon: "🎁",
          sortOrder: 6,
          body: `<ul>
<li>Official event bib</li>
<li>Finisher medal</li>
<li>Participation certificate (digital)</li>
<li>Refreshments at finish line</li>
<li>Event t-shirt</li>
</ul>`,
        },
      ],
    },
    {
      siteFor: "KTA",
      slug: "5km",
      name: "5K Sprint",
      distanceLabel: "5K",
      icon: "⚡",
      price: 499,
      tagline: "Push Your Pace, Find Your Rhythm!",
      order: 2,
      tabs: [
        {
          title: "About This Race",
          icon: "📋",
          sortOrder: 1,
          body: "<p>The 5 KM Sprint is perfect for casual runners and fitness enthusiasts looking to challenge themselves. Run through Kota's vibrant streets, past historic landmarks, and experience the energy of a competitive yet fun event.</p>",
        },
        {
          title: "Route Details",
          icon: "🗺️",
          sortOrder: 2,
          body: `<div class="detail-grid">
<div class="detail-item"><strong>Start Point:</strong> Chambal Garden Main Gate</div>
<div class="detail-item"><strong>Finish Point:</strong> Chambal Garden Main Gate</div>
<div class="detail-item"><strong>Terrain:</strong> Flat city roads with one gentle incline</div>
<div class="detail-item"><strong>Route Highlights:</strong> Chambal Garden, Kota Barrage, Seven Wonders Park view</div>
</div>`,
        },
        {
          title: "Race Day Timing",
          icon: "⏰",
          sortOrder: 3,
          body: `<div class="detail-grid">
<div class="detail-item"><strong>Reporting Time:</strong> 5:30 AM</div>
<div class="detail-item"><strong>Flag-Off Time:</strong> 7:00 AM</div>
<div class="detail-item"><strong>Cut-Off Time:</strong> 1 hour 15 minutes</div>
<div class="detail-item"><strong>Age Eligibility:</strong> 12 years and above</div>
</div>`,
        },
        {
          title: "Highlights",
          icon: "✨",
          sortOrder: 4,
          body: `<ul>
<li>Chip-timed for accurate results</li>
<li>Route passes Kota Barrage & Chambal riverfront</li>
<li>Hydration stations every 2 km</li>
<li>Age-group prizes</li>
<li>Professional photography on course</li>
</ul>`,
        },
        {
          title: "Who Should Run",
          icon: "👟",
          sortOrder: 5,
          body: `<ul>
<li>Regular joggers and gym-goers</li>
<li>Fitness enthusiasts seeking a race experience</li>
<li>College students and corporate teams</li>
<li>Runners preparing for longer distances</li>
</ul>`,
        },
        {
          title: "What's Included",
          icon: "🎁",
          sortOrder: 6,
          body: `<ul>
<li>Official event bib with timing chip</li>
<li>Finisher medal</li>
<li>Participation certificate (digital)</li>
<li>Hydration on course</li>
<li>Post-race refreshments</li>
<li>Event t-shirt</li>
</ul>`,
        },
      ],
    },
    {
      siteFor: "KTA",
      slug: "10km",
      name: "10K Challenge",
      distanceLabel: "10K",
      icon: "🔥",
      price: 799,
      tagline: "Test Your Limits, Conquer the Distance!",
      order: 3,
      tabs: [
        {
          title: "About This Race",
          icon: "📋",
          sortOrder: 1,
          body: "<p>The 10 KM Challenge is for intermediate runners who want a real test of endurance. The course takes you through some of Kota's most iconic landmarks along the Chambal river, offering both a challenging and rewarding running experience.</p>",
        },
        {
          title: "Route Details",
          icon: "🗺️",
          sortOrder: 2,
          body: `<div class="detail-grid">
<div class="detail-item"><strong>Start Point:</strong> Kota Barrage (North End)</div>
<div class="detail-item"><strong>Finish Point:</strong> Chambal Garden Main Gate</div>
<div class="detail-item"><strong>Terrain:</strong> Mixed — flat stretches with two moderate inclines</div>
<div class="detail-item"><strong>Route Highlights:</strong> Kota Barrage, Chambal Riverfront, Kishore Sagar, City Palace view, Chambal Garden</div>
</div>`,
        },
        {
          title: "Race Day Timing",
          icon: "⏰",
          sortOrder: 3,
          body: `<div class="detail-grid">
<div class="detail-item"><strong>Reporting Time:</strong> 5:00 AM</div>
<div class="detail-item"><strong>Flag-Off Time:</strong> 6:30 AM</div>
<div class="detail-item"><strong>Cut-Off Time:</strong> 1 hour 45 minutes</div>
<div class="detail-item"><strong>Age Eligibility:</strong> 16 years and above</div>
</div>`,
        },
        {
          title: "Highlights",
          icon: "✨",
          sortOrder: 4,
          body: `<ul>
<li>Chip-timed with live tracking</li>
<li>Medical support at every 2 km</li>
<li>Hydration + energy stations every 2.5 km</li>
<li>Prize money for top 3 in each age group</li>
<li>Pace setters on course</li>
</ul>`,
        },
        {
          title: "Who Should Run",
          icon: "👟",
          sortOrder: 5,
          body: `<ul>
<li>Intermediate runners with 5K race experience</li>
<li>Runners targeting a personal best</li>
<li>Athletes preparing for half marathon</li>
<li>Competitive club runners</li>
</ul>`,
        },
        {
          title: "What's Included",
          icon: "🎁",
          sortOrder: 6,
          body: `<ul>
<li>Official event bib with timing chip</li>
<li>Finisher medal (premium design)</li>
<li>Participation certificate (digital)</li>
<li>Hydration & energy drinks on course</li>
<li>Post-race breakfast</li>
<li>Event t-shirt (dry-fit)</li>
<li>Finisher t-shirt</li>
</ul>`,
        },
      ],
    },
    {
      siteFor: "KTA",
      slug: "half-marathon",
      name: "Half Marathon",
      distanceLabel: "21K",
      icon: "🏆",
      price: 1499,
      tagline: "The Ultimate Test of Heart and Grit!",
      order: 4,
      tabs: [
        {
          title: "About This Race",
          icon: "📋",
          sortOrder: 1,
          body: "<p>The Half Marathon is the flagship event of RunnerX Kota — a true test of endurance, strategy, and willpower. Run 21.1 km through the historic city of Kota along the majestic Chambal river, experiencing the beauty and grit that defines distance running.</p>",
        },
        {
          title: "Route Details",
          icon: "🗺️",
          sortOrder: 2,
          body: `<div class="detail-grid">
<div class="detail-item"><strong>Start Point:</strong> Nayapura Circle</div>
<div class="detail-item"><strong>Finish Point:</strong> Chambal Garden Main Gate</div>
<div class="detail-item"><strong>Terrain:</strong> Mixed terrain — flat, inclines, and riverside stretches</div>
<div class="detail-item"><strong>Route Highlights:</strong> Nayapura, Industrial Area, Kota Barrage, Chambal Riverfront, Kishore Sagar Lake, City Palace, Seven Wonders Park, Chambal Garden</div>
</div>`,
        },
        {
          title: "Race Day Timing",
          icon: "⏰",
          sortOrder: 3,
          body: `<div class="detail-grid">
<div class="detail-item"><strong>Reporting Time:</strong> 4:30 AM</div>
<div class="detail-item"><strong>Flag-Off Time:</strong> 5:30 AM</div>
<div class="detail-item"><strong>Cut-Off Time:</strong> 3 hours 30 minutes</div>
<div class="detail-item"><strong>Age Eligibility:</strong> 18 years and above</div>
</div>`,
        },
        {
          title: "Highlights",
          icon: "✨",
          sortOrder: 4,
          body: `<ul>
<li>AIMS-standard certified course</li>
<li>Chip-timed with live GPS tracking</li>
<li>Medical support with ambulance at every 3 km</li>
<li>Hydration, energy gels & sponge stations</li>
<li>Prize money: ₹50,000 for overall winners</li>
<li>Pace setters for 2:00, 2:15, 2:30 targets</li>
</ul>`,
        },
        {
          title: "Who Should Run",
          icon: "👟",
          sortOrder: 5,
          body: `<ul>
<li>Experienced distance runners</li>
<li>Athletes training for full marathons</li>
<li>Competitive runners seeking prize money</li>
<li>Running club members looking for a certified course</li>
</ul>`,
        },
        {
          title: "What's Included",
          icon: "🎁",
          sortOrder: 6,
          body: `<ul>
<li>Official event bib with timing chip</li>
<li>Premium finisher medal</li>
<li>Participation certificate (digital & printed)</li>
<li>Hydration, energy gels & electrolytes on course</li>
<li>Post-race breakfast buffet</li>
<li>Event t-shirt (premium dry-fit)</li>
<li>Finisher t-shirt</li>
<li>Race-day bag with goodies</li>
</ul>`,
        },
      ],
    },
    {
      siteFor: "KTA",
      slug: "virtual-marathon",
      name: "Virtual Marathon",
      distanceLabel: "Virtual",
      icon: "🌐",
      price: 299,
      tagline: "Run Anywhere, Be Part of the Movement!",
      order: 5,
      tabs: [
        {
          title: "About This Race",
          icon: "📋",
          sortOrder: 1,
          body: "<p>Can't make it to Kota? No problem! The Virtual Marathon lets you participate from anywhere in the world. Complete your chosen distance anytime between November 1–30, 2026, and be part of the RunnerX Kota Marathon community.</p>",
        },
        {
          title: "How It Works",
          icon: "🗺️",
          sortOrder: 2,
          body: `<div class="detail-grid">
<div class="detail-item"><strong>Location:</strong> Your preferred location</div>
<div class="detail-item"><strong>Terrain:</strong> Any terrain of your choice</div>
<div class="detail-item"><strong>Window:</strong> Anytime during Nov 1–30, 2026</div>
<div class="detail-item"><strong>Pace:</strong> Virtual — complete at your own pace</div>
</div>`,
        },
        {
          title: "Highlights",
          icon: "✨",
          sortOrder: 3,
          body: `<ul>
<li>Run anywhere in the world</li>
<li>Complete between Nov 1–30, 2026</li>
<li>Upload your result certificate</li>
<li>Receive a digital finisher kit</li>
<li>Exclusive Virtual Marathon medal</li>
<li>Join the leaderboard globally</li>
</ul>`,
        },
        {
          title: "Who Should Run",
          icon: "👟",
          sortOrder: 4,
          body: `<ul>
<li>Runners outside Kota/Rajasthan</li>
<li>Those with scheduling conflicts</li>
<li>NRI runners wanting to participate</li>
<li>Flexible runners who prefer solo races</li>
</ul>`,
        },
        {
          title: "What's Included",
          icon: "🎁",
          sortOrder: 5,
          body: `<ul>
<li>Digital event bib</li>
<li>Virtual Marathon finisher medal (shipped to your address)</li>
<li>Digital participation certificate</li>
<li>Access to RunnerX virtual community</li>
<li>Leaderboard ranking</li>
</ul>`,
        },
      ],
    },
  ];
}

function getKtaFaqs() {
  return [
    {
      question: "How do I register for the marathon?",
      answer: "Registration will open soon on our website. You will be able to register online by selecting your preferred category, filling in your details, and making the payment. Follow our social media for registration announcements.",
    },
    {
      question: "What are the age requirements for each category?",
      answer: "3 KM Fun Run: 6 years and above. 5 KM Sprint: 12 years and above. 10 KM Challenge: 16 years and above. Half Marathon: 18 years and above. Participants under 18 must have a parent/guardian's consent.",
    },
    {
      question: "Is there a refund policy?",
      answer: "Registrations are non-refundable. However, you may transfer your registration to another person up to 7 days before the event by contacting our support team. Deferrals to the next edition may be considered on a case-by-case basis.",
    },
    {
      question: "What should I bring on race day?",
      answer: "Carry your event bib (collected at the Expo), a valid photo ID, and comfortable running gear. We recommend arriving at least 1 hour before your flag-off time. Bag drop facilities will be available near the start line.",
    },
    {
      question: "Will there be timing chips?",
      answer: "Yes! The 5 KM, 10 KM, and Half Marathon categories will have chip timing for accurate results. The 3 KM Fun Run is a non-timed, participation-only event.",
    },
    {
      question: "What medical support will be available?",
      answer: "We will have trained medical teams stationed every 2-3 km along all routes. Ambulance support will be on standby throughout the event. Each hydration station will also have a basic first-aid kit.",
    },
    {
      question: "Can I participate if I haven't run a marathon before?",
      answer: "Absolutely! The 3 KM Fun Run and 5 KM Sprint are perfect for beginners. We encourage first-time runners to start training at least 4-6 weeks before the event. A training guide will be shared with all registered participants.",
    },
    {
      question: "Where is the start/finish line?",
      answer: "The primary venue is Chambal Garden, Kota. The Half Marathon starts from Nayapura Circle, the 10 KM from Kota Barrage, and the 5 KM and 3 KM from Chambal Garden. All races finish at Chambal Garden Main Gate.",
    },
    {
      question: "Will there be parking available?",
      answer: "Yes, free parking will be available at Chambal Garden and nearby designated areas. We recommend carpooling or using public transport due to road closures during the event.",
    },
    {
      question: "What happens if it rains on race day?",
      answer: "The event will take place rain or shine. In case of extreme weather conditions that pose a safety risk, the organizing committee reserves the right to modify routes, timings, or cancel the event. Registered participants will be notified promptly.",
    },
    {
      question: "Are there prize money and awards?",
      answer: "Yes! Prize money is available for the top finishers in the 10 KM and Half Marathon categories. Age-group awards will also be given. All finishers in every category receive a medal and certificate.",
    },
    {
      question: "Can I walk during the Fun Run?",
      answer: "Yes! The 3 KM Fun Run is designed for everyone — you can walk, jog, or run at your own pace. There is no competitive timing for this category.",
    },
  ];
}

function getKtaPrivacySections() {
  return [
    {
      heading: "1. Information We Collect",
      content: "When you register for the RunnerX Kota Marathon, we may collect the following personal information:\n\n• Full name, date of birth, and gender\n• Email address and phone number\n• Emergency contact details\n• T-shirt size and blood group (for medical emergencies)\n• Running history and previous race times (optional)\n• Payment information (processed securely through third-party payment gateways)",
    },
    {
      heading: "2. How We Use Your Information",
      content: "Your information is used for the following purposes:\n\n• Processing and managing your event registration\n• Sending event-related communications (bib collection, route updates, etc.)\n• Providing on-course medical support when needed\n• Publishing race results and timing data\n• Improving our events and services\n• Sending marketing communications about future events (with your consent)",
    },
    {
      heading: "3. Cookie Policy",
      content: "Our website uses cookies to enhance your browsing experience. Cookies are small text files stored on your device that help us understand how you use our website. We use:\n\n• Essential cookies: Required for the website to function properly\n• Analytics cookies: Help us understand website traffic and usage patterns\n• Marketing cookies: Used to deliver relevant advertisements (only with consent)",
    },
    {
      heading: "4. Third-Party Services",
      content: "We may share your data with trusted third-party service providers who assist in organizing the event, including:\n\n• Timing and race result management partners\n• Payment processing services\n• Email and communication platforms\n• Event photography partners (race photos may be published online)\n\nWe do not sell your personal information to any third party for commercial purposes.",
    },
    {
      heading: "5. Data Security",
      content: "We implement industry-standard security measures to protect your personal information, including SSL encryption, secure servers, and access controls. However, no method of electronic transmission is 100% secure.",
    },
    {
      heading: "6. Your Rights",
      content: "You have the right to:\n\n• Access the personal data we hold about you\n• Request correction of inaccurate data\n• Request deletion of your data (subject to legal requirements)\n• Opt out of marketing communications at any time\n• Withdraw consent for data processing",
    },
  ];
}

function getKtaTermsSections() {
  return [
    {
      heading: "1. Event Participation",
      content: "By registering for the RunnerX Kota Marathon, you agree to the following terms and conditions. Participation in the event is subject to compliance with all rules and regulations set by the organizing committee.\n\n• Participants must meet the minimum age requirement for their selected category\n• A valid government-issued photo ID must be presented during bib collection\n• Transferring your bib to another runner on race day is strictly prohibited\n• Participants must follow the designated course route at all times",
    },
    {
      heading: "2. Registration & Fees",
      content: "• Registration fees are non-refundable once payment is confirmed\n• Category changes may be permitted up to 14 days before the event, subject to availability and applicable fee differences\n• Registration transfers to another participant are allowed up to 7 days before the event with prior approval\n• The organizing committee reserves the right to cap registrations for any category",
    },
    {
      heading: "3. Health & Medical Waiver",
      content: "By participating, you declare that you are physically fit to participate in the chosen race category. You acknowledge the inherent risks of participating in a running event and assume full responsibility for your health and safety.\n\n• Participants are strongly advised to consult a physician before the event\n• The event medical team reserves the right to withdraw any participant who appears unfit to continue\n• The organizing committee and sponsors shall not be liable for any injury, illness, or death during or arising from the event",
    },
    {
      heading: "4. Code of Conduct",
      content: "All participants must adhere to the following code of conduct:\n\n• Show respect to fellow runners, volunteers, spectators, and event officials\n• No use of abusive, offensive, or discriminatory language or behavior\n• No littering on the course — use designated disposal points\n• Follow all traffic and safety instructions from marshals and officials\n• No use of performance-enhancing substances; doping tests may be conducted for prize-eligible categories\n• Using any form of transport (bicycles, vehicles, etc.) during the race will result in immediate disqualification",
    },
    {
      heading: "5. Intellectual Property",
      content: "By participating, you grant the RunnerX Kota Marathon organizing committee the right to use your name, likeness, photographs, and video recordings taken during the event for promotional, editorial, and commercial purposes without additional compensation.\n\n• Official event photographs may be published on our website and social media\n• The RunnerX Kota Marathon name, logo, and branding are protected intellectual property\n• Unauthorized use of event branding is prohibited",
    },
    {
      heading: "6. Force Majeure & Event Cancellation",
      content: "The organizing committee reserves the right to modify, postpone, or cancel the event due to circumstances beyond reasonable control, including but not limited to:\n\n• Severe weather conditions (extreme heat, storms, flooding)\n• Government orders or security concerns\n• Natural disasters or public health emergencies\n• Insufficient registrations to ensure a quality event experience\n\nIn case of cancellation, participants may receive a partial refund or deferred entry to the next edition, at the discretion of the organizing committee.",
    },
    {
      heading: "7. Dispute Resolution",
      content: "Any disputes arising from or in connection with this event shall be subject to the exclusive jurisdiction of the courts in Kota, Rajasthan, India.",
    },
  ];
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter });

  try {
    // ─── Seed Admin User ───
    const existing = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (existing) {
      console.log("✅ Admin user already exists:");
      console.log(`   Email: ${existing.email}`);
    } else {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
      const admin = await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          name: ADMIN_NAME,
          password: hashedPassword,
          role: "ADMIN",
        },
      });
      console.log("✅ Admin user created successfully!");
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
    }

    // ─── Seed Sites ───
    const sites = [
      { name: "Jodhpur", code: "JDH" },
      { name: "Kota", code: "KTA" },
      { name: "Udaipur", code: "UDR" },
    ];

    for (const site of sites) {
      await prisma.site.upsert({
        where: { code: site.code },
        update: { name: site.name },
        create: { name: site.name, code: site.code },
      });
    }
    console.log("✅ Sites seeded: JDH, KTA, UDR");

    // ─── Seed Page Content for KTA ───
    const ktaContent = getKtaContent();
    let upsertCount = 0;

    for (const item of ktaContent) {
      await prisma.pageContent.upsert({
        where: {
          siteFor_page_section_key: {
            siteFor: item.siteFor,
            page: item.page,
            section: item.section,
            key: item.key,
          },
        },
        update: {
          value: item.value,
          type: item.type,
          sortOrder: item.sortOrder,
          isActive: item.isActive,
        },
        create: item,
      });
      upsertCount++;
    }
    console.log(`✅ Page content seeded: ${upsertCount} blocks for KTA`);

    // ─── Seed Categories + Tabs for KTA ───
    const kotaCategories = getKotaCategories();

    for (const cat of kotaCategories) {
      const existingCat = await prisma.category.findUnique({
        where: { siteFor_slug: { siteFor: cat.siteFor, slug: cat.slug } },
      });

      const category = existingCat
        ? await prisma.category.update({
            where: { siteFor_slug: { siteFor: cat.siteFor, slug: cat.slug } },
            data: {
              name: cat.name,
              distanceLabel: cat.distanceLabel,
              icon: cat.icon,
              price: cat.price,
              discountPrice: cat.discountPrice ?? null,
              tagline: cat.tagline,
              order: cat.order,
            },
          })
        : await prisma.category.create({
            data: {
              siteFor: cat.siteFor,
              slug: cat.slug,
              name: cat.name,
              distanceLabel: cat.distanceLabel,
              icon: cat.icon,
              price: cat.price,
              discountPrice: cat.discountPrice ?? null,
              tagline: cat.tagline,
              order: cat.order,
              isActive: true,
            },
          });

      // Delete existing tabs and re-create
      await prisma.categoryTab.deleteMany({
        where: { categoryId: category.id },
      });

      for (const tab of cat.tabs) {
        await prisma.categoryTab.create({
          data: {
            categoryId: category.id,
            title: tab.title,
            body: tab.body,
            icon: tab.icon,
            sortOrder: tab.sortOrder,
            isActive: true,
          },
        });
      }

      console.log(`  ✅ Category seeded: ${cat.slug} (${cat.name}) — ${cat.tabs.length} tabs`);
    }
    console.log("✅ All 5 Kota categories seeded successfully");

    // ─── Seed Info Sections (FAQ) for KTA ───
    const ktaFaqs = getKtaFaqs();
    await prisma.infoSection.deleteMany({
      where: { siteFor: "KTA", pageType: "FAQ" },
    });

    for (let i = 0; i < ktaFaqs.length; i++) {
      await prisma.infoSection.create({
        data: {
          siteFor: "KTA",
          pageType: "FAQ",
          heading: ktaFaqs[i].question,
          content: ktaFaqs[i].answer,
          sortOrder: i + 1,
          isActive: true,
        },
      });
    }
    console.log(`✅ ${ktaFaqs.length} FAQs seeded for KTA`);

    // ─── Seed Info Sections (PRIVACY) for KTA ───
    const ktaPrivacy = getKtaPrivacySections();
    await prisma.infoSection.deleteMany({
      where: { siteFor: "KTA", pageType: "PRIVACY" },
    });

    for (let i = 0; i < ktaPrivacy.length; i++) {
      await prisma.infoSection.create({
        data: {
          siteFor: "KTA",
          pageType: "PRIVACY",
          heading: ktaPrivacy[i].heading,
          content: ktaPrivacy[i].content,
          sortOrder: i + 1,
          isActive: true,
        },
      });
    }
    console.log(`✅ ${ktaPrivacy.length} Privacy sections seeded for KTA`);

    // ─── Seed Info Sections (TERMS) for KTA ───
    const ktaTerms = getKtaTermsSections();
    await prisma.infoSection.deleteMany({
      where: { siteFor: "KTA", pageType: "TERMS" },
    });

    for (let i = 0; i < ktaTerms.length; i++) {
      await prisma.infoSection.create({
        data: {
          siteFor: "KTA",
          pageType: "TERMS",
          heading: ktaTerms[i].heading,
          content: ktaTerms[i].content,
          sortOrder: i + 1,
          isActive: true,
        },
      });
    }
    console.log(`✅ ${ktaTerms.length} Terms sections seeded for KTA`);

  } catch (error) {
    console.error("❌ Failed to seed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
