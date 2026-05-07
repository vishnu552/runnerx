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

  { siteFor: "KTA", page: "event-rules", section: "hero", key: "heading", value: "", type: "TEXT", sortOrder: 1, isActive: true },
  { siteFor: "KTA", page: "event-rules", section: "hero", key: "bg_image", value: "", type: "IMAGE", sortOrder: 2, isActive: true },
  { siteFor: "KTA", page: "philanthropy", section: "hero", key: "heading", value: "", type: "TEXT", sortOrder: 1, isActive: true },
  { siteFor: "KTA", page: "philanthropy", section: "hero", key: "bg_image", value: "", type: "IMAGE", sortOrder: 2, isActive: true },
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
  
  // ─── Global page — Header highlight text ───
  { siteFor: "KTA", page: "global", section: "header", key: "header_highlight", value: "", type: "TEXT", sortOrder: 1, isActive: true },

  // ─── Legal Pages — Hero banner images & titles ───
  { siteFor: "KTA", page: "privacy", section: "hero", key: "title", value: "Privacy Policy", type: "TEXT", sortOrder: 1, isActive: true },
  { siteFor: "KTA", page: "privacy", section: "hero", key: "bg_image", value: "", type: "IMAGE", sortOrder: 2, isActive: true },
  
  { siteFor: "KTA", page: "terms", section: "hero", key: "title", value: "Terms & Conditions", type: "TEXT", sortOrder: 1, isActive: true },
  { siteFor: "KTA", page: "terms", section: "hero", key: "bg_image", value: "", type: "IMAGE", sortOrder: 2, isActive: true },
  
  { siteFor: "KTA", page: "refund", section: "hero", key: "title", value: "Refund Policy", type: "TEXT", sortOrder: 1, isActive: true },
  { siteFor: "KTA", page: "refund", section: "hero", key: "bg_image", value: "", type: "IMAGE", sortOrder: 2, isActive: true },
  
  { siteFor: "KTA", page: "waiver", section: "hero", key: "title", value: "Waiver", type: "TEXT", sortOrder: 1, isActive: true },
  { siteFor: "KTA", page: "waiver", section: "hero", key: "bg_image", value: "", type: "IMAGE", sortOrder: 2, isActive: true },
];

type InfoSectionEntry = {
  siteFor: string;
  pageType: string;
  heading: string;
  content: string;
  sortOrder: number;
  isActive: boolean;
};

const infoSections: InfoSectionEntry[] = [
  // ─── Refund Policy ───
  {
    siteFor: "GLOBAL",
    pageType: "REFUND",
    heading: "No Refunds",
    content: "Registration fees are strictly non-refundable under any circumstances, including event cancellation due to force majeure.",
    sortOrder: 1,
    isActive: true
  },
  {
    siteFor: "GLOBAL",
    pageType: "REFUND",
    heading: "Event Rescheduling",
    content: "If the event is postponed or rescheduled, your registration will be automatically valid for the new date.",
    sortOrder: 2,
    isActive: true
  },
  // ─── Waiver ───
  {
    siteFor: "GLOBAL",
    pageType: "WAIVER",
    heading: "Medical Declaration",
    content: "I confirm that I am physically fit and have no medical condition that would prevent my participation in this event.",
    sortOrder: 1,
    isActive: true
  },
  {
    siteFor: "GLOBAL",
    pageType: "WAIVER",
    heading: "Release of Liability",
    content: "I hereby release the organizers and sponsors from all liability for any injury, loss, or damage arising from my participation.",
    sortOrder: 2,
    isActive: true
  },
];

// Keys present in DB but never read by the frontend — safe to remove.
// (event-rules / philanthropy keys are intentionally NOT listed; frontend uses them.)
const deletes: DeleteKey[] = [];

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

    // 2. Create missing InfoSections
    console.log("\n— Seeding InfoSections (Legal/FAQ) —");
    for (const section of infoSections) {
      const existing = await prisma.infoSection.findFirst({
        where: {
          siteFor: section.siteFor,
          pageType: section.pageType,
          heading: section.heading,
        },
      });
      if (existing) {
        console.log(`⏭  Skipped (exists): ${section.pageType} - ${section.heading}`);
      } else {
        await prisma.infoSection.create({ data: section });
        console.log(`✅ Created: ${section.pageType} - ${section.heading}`);
      }
    }

    // 3. Delete unused entries
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
