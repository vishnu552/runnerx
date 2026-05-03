const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const siteFor = 'KTA';
  
  console.log(`Starting cleanup for site: ${siteFor}`);

  // 1. Global Page
  const globalKeys = ["tagline", "edition", "start_venue", "expected_participants", "date"];
  const res1 = await prisma.pageContent.deleteMany({
    where: { siteFor, page: 'global', key: { in: globalKeys } }
  });
  console.log(`Global: Deleted ${res1.count} records.`);

  // 2. Home Page
  const homeRemovals = [
    { section: 'ambassadors', keys: ['title_line1'] },
    { section: 'categories', keys: ['badge', 'subtitle'] },
    { section: 'overview', keys: ['card1_title', 'card2_title'] },
    { section: 'countdown', keys: ['title_accent'] }
  ];
  
  for (const rem of homeRemovals) {
    const res = await prisma.pageContent.deleteMany({
      where: { siteFor, page: 'home', section: rem.section, key: { in: rem.keys } }
    });
    console.log(`Home (${rem.section}): Deleted ${res.count} records.`);
  }

  // Home Hero special logic (remove keys that aren't banner_image or label)
  const homeHeroItems = await prisma.pageContent.findMany({
    where: { siteFor, page: 'home', section: 'hero' }
  });
  const homeHeroToDel = homeHeroItems.filter(item => !['banner_image', 'label'].includes(item.key));
  if (homeHeroToDel.length > 0) {
    const res = await prisma.pageContent.deleteMany({
      where: { id: { in: homeHeroToDel.map(i => i.id) } }
    });
    console.log(`Home (hero): Deleted ${res.count} extra records.`);
  }

  // 3. About Page
  const aboutRemovals = [
    { section: 'hero', keys: ['subtitle', 'badge', 'title_accent'] },
    { section: 'vision', keys: ['features', 'badge', 'subtitle'] }
  ];
  for (const rem of aboutRemovals) {
    const res = await prisma.pageContent.deleteMany({
      where: { siteFor, page: 'about', section: rem.section, key: { in: rem.keys } }
    });
    console.log(`About (${rem.section}): Deleted ${res.count} records.`);
  }

  // 4. Gallery Page
  const resGalleryContent = await prisma.pageContent.deleteMany({
    where: { siteFor, page: 'gallery', section: 'content' }
  });
  console.log(`Gallery (content): Deleted ${resGalleryContent.count} records.`);

  const resGalleryHero = await prisma.pageContent.deleteMany({
    where: { siteFor, page: 'gallery', section: 'hero', key: { in: ['badge', 'subtitle'] } }
  });
  console.log(`Gallery (hero): Deleted ${resGalleryHero.count} records.`);

  // 5. Privacy & Terms
  const resPrivacy = await prisma.pageContent.deleteMany({
    where: { siteFor, page: 'privacy', section: 'hero', key: 'subtitle' }
  });
  console.log(`Privacy: Deleted ${resPrivacy.count} records.`);

  const resTerms = await prisma.pageContent.deleteMany({
    where: { siteFor, page: 'terms', section: 'hero', key: 'subtitle' }
  });
  console.log(`Terms: Deleted ${resTerms.count} records.`);

  console.log('Cleanup complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
