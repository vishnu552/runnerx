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
];

async function main() {
  try {
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
        console.log(`⏭  Skipped (exists): ${entry.page}.${entry.section}.${entry.key}`);
      } else {
        await prisma.pageContent.create({ data: entry });
        console.log(`✅ Created: ${entry.page}.${entry.section}.${entry.key}`);
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
