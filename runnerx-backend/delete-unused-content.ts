import "dotenv/config";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter });

  const result = await prisma.pageContent.deleteMany({
    where: {
      page: "about",
      section: {
        in: ["timeline", "team"]
      }
    }
  });
  console.log(`Deleted ${result.count} unused content fields from database.`);
  process.exit(0);
}
main().catch(console.error);
