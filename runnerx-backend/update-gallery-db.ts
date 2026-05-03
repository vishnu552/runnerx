import "dotenv/config";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter });

  // Add bg_image for gallery hero
  await prisma.pageContent.upsert({
    where: {
      siteFor_page_section_key: {
        siteFor: "KTA",
        page: "gallery",
        section: "hero",
        key: "bg_image"
      }
    },
    update: {},
    create: {
      siteFor: "KTA",
      page: "gallery",
      section: "hero",
      key: "bg_image",
      value: "",
      type: "IMAGE",
      sortOrder: 5,
      isActive: true
    }
  });

  // Delete old JSON items for gallery
  await prisma.pageContent.deleteMany({
    where: {
      siteFor: "KTA",
      page: "gallery",
      section: "content",
      key: "items"
    }
  });

  console.log("Updated gallery DB fields!");
  process.exit(0);
}
main().catch(console.error);
