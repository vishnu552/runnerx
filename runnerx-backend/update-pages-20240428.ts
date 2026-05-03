import "dotenv/config";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter });

  console.log("🚀 Starting database update...");

  // 1. Remove FAQ data
  const deletedContent = await prisma.pageContent.deleteMany({
    where: { page: "faq" }
  });
  console.log(`✅ Deleted ${deletedContent.count} PageContent records for FAQ`);

  const deletedInfo = await prisma.infoSection.deleteMany({
    where: { pageType: "FAQ" }
  });
  console.log(`✅ Deleted ${deletedInfo.count} InfoSection records for FAQ`);

  // 2. Add Event Rules and Philanthropy skeletons for all sites
  const sites = await prisma.site.findMany();
  
  for (const site of sites) {
    const pages = ["event-rules", "philanthropy"];
    for (const page of pages) {
      // Heading
      await prisma.pageContent.upsert({
        where: {
          siteFor_page_section_key: {
            siteFor: site.code,
            page: page,
            section: "hero",
            key: "heading"
          }
        },
        update: {},
        create: {
          siteFor: site.code,
          page: page,
          section: "hero",
          key: "heading",
          value: page === "event-rules" ? "Event Rules & Guidelines" : "Philanthropy & Impact",
          type: "TEXT"
        }
      });

      // Background Image
      await prisma.pageContent.upsert({
        where: {
          siteFor_page_section_key: {
            siteFor: site.code,
            page: page,
            section: "hero",
            key: "bg_image"
          }
        },
        update: {},
        create: {
          siteFor: site.code,
          page: page,
          section: "hero",
          key: "bg_image",
          value: "",
          type: "IMAGE"
        }
      });
    }
  }
  
  console.log(`✅ Seeded skeleton content for Event Rules and Philanthropy across ${sites.length} sites`);
  console.log("✨ Database update complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error during update:", err);
  process.exit(1);
});
