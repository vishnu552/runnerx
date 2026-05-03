import "dotenv/config";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter });

  await prisma.pageContent.upsert({
    where: {
      siteFor_page_section_key: {
        siteFor: "KTA",
        page: "about",
        section: "hero",
        key: "bg_image"
      }
    },
    update: {},
    create: {
      siteFor: "KTA",
      page: "about",
      section: "hero",
      key: "bg_image",
      value: "",
      type: "IMAGE",
      sortOrder: 5,
      isActive: true
    }
  });
  console.log("Inserted about hero bg_image!");
  process.exit(0);
}
main().catch(console.error);
