import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type Entry = {
  siteFor: string;
  page: string;
  section: string;
  key: string;
  value: string;
  type: string;
  sortOrder: number;
  isActive: boolean;
};

type DeleteKey = {
  siteFor: string;
  page: string;
  section: string;
  key: string;
};

const entries: Entry[] = [
  // ─── About page — Hero banner image ───
  { siteFor: "KTA", page: "about", section: "hero", key: "bg_image", value: "", type: "IMAGE", sortOrder: 1, isActive: true },

  // ─── About page — Vision: 3 boxes (heading + text) ───
  { siteFor: "KTA", page: "about", section: "vision", key: "box1_heading", value: "GREEN RUNNING", type: "TEXT", sortOrder: 10, isActive: true },
  { siteFor: "KTA", page: "about", section: "vision", key: "box1_text", value: "Eco-friendly event management with biodegradable cups, minimal plastic use, and post-event clean-up drives along the Chambal riverside.", type: "TEXT", sortOrder: 11, isActive: true },
  { siteFor: "KTA", page: "about", section: "vision", key: "box2_heading", value: "STUDENT POWER", type: "TEXT", sortOrder: 12, isActive: true },
  { siteFor: "KTA", page: "about", section: "vision", key: "box2_text", value: "Special engagement for Kota's massive student community — promoting fitness alongside academics. Discounted entries for students.", type: "TEXT", sortOrder: 13, isActive: true },
  { siteFor: "KTA", page: "about", section: "vision", key: "box3_heading", value: "RUN FOR A CAUSE", type: "TEXT", sortOrder: 14, isActive: true },
  { siteFor: "KTA", page: "about", section: "vision", key: "box3_text", value: "A portion of every registration goes to local NGOs supporting education, health, and environmental conservation in the Hadoti region.", type: "TEXT", sortOrder: 15, isActive: true },

  // ─── Contact page — Hero banner image ───
  { siteFor: "KTA", page: "contact", section: "hero", key: "bg_image", value: "", type: "IMAGE", sortOrder: 1, isActive: true },

  // ─── Home page — Initiatives: 2 items (title + image) ───
  { siteFor: "KTA", page: "home", section: "initiatives", key: "item1_title", value: "", type: "TEXT", sortOrder: 10, isActive: true },
  { siteFor: "KTA", page: "home", section: "initiatives", key: "item1_image", value: "", type: "IMAGE", sortOrder: 11, isActive: true },
  { siteFor: "KTA", page: "home", section: "initiatives", key: "item2_title", value: "", type: "TEXT", sortOrder: 12, isActive: true },
  { siteFor: "KTA", page: "home", section: "initiatives", key: "item2_image", value: "", type: "IMAGE", sortOrder: 13, isActive: true },

  // ─── Home page — Overview: card titles (frontend reads these but DB was missing) ───
  { siteFor: "KTA", page: "home", section: "overview", key: "card1_title", value: "", type: "TEXT", sortOrder: 20, isActive: true },
  { siteFor: "KTA", page: "home", section: "overview", key: "card2_title", value: "", type: "TEXT", sortOrder: 21, isActive: true },
];

// Keys present in DB but never read by the frontend — safe to remove.
// (event-rules / philanthropy keys are intentionally NOT listed; frontend uses them.)
const deletes: DeleteKey[] = [
  // home — unused
  { siteFor: "KTA", page: "home", section: "hero", key: "label" },
  { siteFor: "KTA", page: "home", section: "categories_header", key: "badge" },
  { siteFor: "KTA", page: "home", section: "categories_header", key: "subtitle" },

  // about — PageHero doesn't render badge/subtitle; vision uses box*_heading/text not features; timeline & team sections don't exist in code
  { siteFor: "KTA", page: "about", section: "hero", key: "badge" },
  { siteFor: "KTA", page: "about", section: "hero", key: "subtitle" },
  { siteFor: "KTA", page: "about", section: "vision", key: "badge" },
  { siteFor: "KTA", page: "about", section: "vision", key: "subtitle" },
  { siteFor: "KTA", page: "about", section: "vision", key: "features" },
  { siteFor: "KTA", page: "about", section: "timeline", key: "badge" },
  { siteFor: "KTA", page: "about", section: "timeline", key: "title" },
  { siteFor: "KTA", page: "about", section: "timeline", key: "title_accent" },
  { siteFor: "KTA", page: "about", section: "timeline", key: "items" },
  { siteFor: "KTA", page: "about", section: "team", key: "title" },
  { siteFor: "KTA", page: "about", section: "team", key: "title_accent" },
  { siteFor: "KTA", page: "about", section: "team", key: "subtitle" },
  { siteFor: "KTA", page: "about", section: "team", key: "cta_title" },
  { siteFor: "KTA", page: "about", section: "team", key: "cta_subtitle" },
  { siteFor: "KTA", page: "about", section: "team", key: "cta_button_text" },
  { siteFor: "KTA", page: "about", section: "team", key: "cta_button_link" },

  // faq — no /faq page exists in frontend
  { siteFor: "KTA", page: "faq", section: "hero", key: "badge" },
  { siteFor: "KTA", page: "faq", section: "hero", key: "title" },
  { siteFor: "KTA", page: "faq", section: "hero", key: "title_accent" },
  { siteFor: "KTA", page: "faq", section: "hero", key: "subtitle" },
  { siteFor: "KTA", page: "faq", section: "footer", key: "text" },
  { siteFor: "KTA", page: "faq", section: "footer", key: "cta_text" },
  { siteFor: "KTA", page: "faq", section: "footer", key: "cta_link" },

  // contact — unused (PageHero doesn't render badge/subtitle, info is hard-coded, disclaimer commented out)
  { siteFor: "KTA", page: "contact", section: "hero", key: "badge" },
  { siteFor: "KTA", page: "contact", section: "hero", key: "subtitle" },
  { siteFor: "KTA", page: "contact", section: "form", key: "disclaimer" },
  { siteFor: "KTA", page: "contact", section: "info", key: "office_hours" },
  { siteFor: "KTA", page: "contact", section: "info", key: "map_label" },

  // gallery — only hero.title_accent and hero.bg_image are used; GalleryClient pulls images via getGalleryImages()
  { siteFor: "KTA", page: "gallery", section: "hero", key: "badge" },
  { siteFor: "KTA", page: "gallery", section: "hero", key: "subtitle" },
  { siteFor: "KTA", page: "gallery", section: "content", key: "notice" },
  { siteFor: "KTA", page: "gallery", section: "content", key: "items" },

  // route — PageHero doesn't render badge/subtitle
  { siteFor: "KTA", page: "route", section: "hero", key: "badge" },
  { siteFor: "KTA", page: "route", section: "hero", key: "subtitle" },

  // privacy / terms — PageHero doesn't render subtitle; body comes from getInfoSections(); last_updated read from `legal` section not `content`
  { siteFor: "KTA", page: "privacy", section: "hero", key: "subtitle" },
  { siteFor: "KTA", page: "privacy", section: "content", key: "last_updated" },
  { siteFor: "KTA", page: "privacy", section: "content", key: "body" },
  { siteFor: "KTA", page: "terms", section: "hero", key: "subtitle" },
  { siteFor: "KTA", page: "terms", section: "content", key: "last_updated" },
  { siteFor: "KTA", page: "terms", section: "content", key: "body" },

  // JDH / UDR — this build is KTA-only; remove non-KTA copies (KTA versions already exist)
  { siteFor: "JDH", page: "event-rules", section: "hero", key: "heading" },
  { siteFor: "JDH", page: "event-rules", section: "hero", key: "bg_image" },
  { siteFor: "JDH", page: "philanthropy", section: "hero", key: "heading" },
  { siteFor: "JDH", page: "philanthropy", section: "hero", key: "bg_image" },
  { siteFor: "UDR", page: "event-rules", section: "hero", key: "heading" },
  { siteFor: "UDR", page: "event-rules", section: "hero", key: "bg_image" },
  { siteFor: "UDR", page: "philanthropy", section: "hero", key: "heading" },
  { siteFor: "UDR", page: "philanthropy", section: "hero", key: "bg_image" },
];

async function main() {
  try {
    // 1. Create missing entries
    for (const entry of entries) {
      const existing = await prisma.pageContent.findUnique({
        where: {
          siteFor_page_section_key: {
            siteFor: entry.siteFor,
            page: entry.page,
            section: entry.section,
            key: entry.key,
          },
        },
      });
      if (existing) {
        console.log(`⏭  Skipped (exists): ${entry.siteFor}/${entry.page}.${entry.section}.${entry.key}`);
      } else {
        await prisma.pageContent.create({ data: entry });
        console.log(`✅ Created: ${entry.siteFor}/${entry.page}.${entry.section}.${entry.key}`);
      }
    }

    // 2. Delete unused entries
    console.log("\n— Removing unused keys —");
    for (const d of deletes) {
      const result = await prisma.pageContent.deleteMany({
        where: {
          siteFor: d.siteFor,
          page: d.page,
          section: d.section,
          key: d.key,
        },
      });
      if (result.count > 0) {
        console.log(`🗑  Deleted: ${d.siteFor}/${d.page}.${d.section}.${d.key}`);
      } else {
        console.log(`⏭  Not found: ${d.siteFor}/${d.page}.${d.section}.${d.key}`);
      }
    }

    console.log("\nSeed complete.");
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
