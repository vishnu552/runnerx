const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const content = await prisma.pageContent.findMany({
    where: { siteFor: 'KTA', page: 'global' }
  });
  console.log("Keys found for KTA/global:", content.map(c => c.key));
  
  const keysToRemove = ["tagline", "edition", "start_venue", "expected_participants", "date"];
  
  const result = await prisma.pageContent.deleteMany({
    where: {
      siteFor: 'KTA',
      page: 'global',
      key: { in: keysToRemove }
    }
  });
  
  console.log(`Deleted ${result.count} records.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
