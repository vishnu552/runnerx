const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const siteFor = 'KTA';
  const keys = {
    global: ["tagline", "edition", "start_venue", "expected_participants", "date"],
    home: {
        ambassadors: ["title_line1"],
        categories: ["badge", "subtitle"],
        overview: ["card1_title", "card2_title"],
        countdown: ["title_accent"]
    },
    about: {
        hero: ["subtitle", "badge", "title_accent"],
        vision: ["features", "badge", "subtitle"]
    },
    gallery: {
        content: null, // entire section
        hero: ["badge", "subtitle"]
    },
    privacy: { hero: ["subtitle"] },
    terms: { hero: ["subtitle"] }
  };

  console.log("Cleaning DB...");

  // Delete Global
  await prisma.pageContent.deleteMany({ where: { siteFor, page: 'global', key: { in: keys.global } } });

  // Delete Home
  for (const [section, k] of Object.entries(keys.home)) {
    await prisma.pageContent.deleteMany({ where: { siteFor, page: 'home', section, key: { in: k } } });
  }

  // Delete About
  for (const [section, k] of Object.entries(keys.about)) {
    await prisma.pageContent.deleteMany({ where: { siteFor, page: 'about', section, key: { in: k } } });
  }

  // Delete Gallery
  await prisma.pageContent.deleteMany({ where: { siteFor, page: 'gallery', section: 'content' } });
  await prisma.pageContent.deleteMany({ where: { siteFor, page: 'gallery', section: 'hero', key: { in: keys.gallery.hero } } });

  // Delete Privacy/Terms
  await prisma.pageContent.deleteMany({ where: { siteFor, page: 'privacy', key: 'subtitle' } });
  await prisma.pageContent.deleteMany({ where: { siteFor, page: 'terms', key: 'subtitle' } });

  console.log("DB Cleaned successfully.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
