const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log("Connected to DB. Starting cleanup...");

    const siteFor = 'KTA';
    
    // 1. Global
    const globalKeys = "('tagline', 'edition', 'start_venue', 'expected_participants', 'date')";
    await client.query(`DELETE FROM "PageContent" WHERE "siteFor" = '${siteFor}' AND "page" = 'global' AND "key" IN ${globalKeys}`);

    // 2. Home
    await client.query(`DELETE FROM "PageContent" WHERE "siteFor" = '${siteFor}' AND "page" = 'home' AND "section" = 'ambassadors' AND "key" = 'title_line1'`);
    await client.query(`DELETE FROM "PageContent" WHERE "siteFor" = '${siteFor}' AND "page" = 'home' AND "section" = 'categories' AND "key" IN ('badge', 'subtitle')`);
    await client.query(`DELETE FROM "PageContent" WHERE "siteFor" = '${siteFor}' AND "page" = 'home' AND "section" = 'overview' AND "key" IN ('card1_title', 'card2_title')`);
    await client.query(`DELETE FROM "PageContent" WHERE "siteFor" = '${siteFor}' AND "page" = 'home' AND "section" = 'countdown' AND "key" = 'title_accent'`);
    await client.query(`DELETE FROM "PageContent" WHERE "siteFor" = '${siteFor}' AND "page" = 'home' AND "section" = 'hero' AND "key" NOT IN ('banner_image', 'label')`);

    // 3. About
    await client.query(`DELETE FROM "PageContent" WHERE "siteFor" = '${siteFor}' AND "page" = 'about' AND "section" = 'hero' AND "key" IN ('subtitle', 'badge', 'title_accent')`);
    await client.query(`DELETE FROM "PageContent" WHERE "siteFor" = '${siteFor}' AND "page" = 'about' AND "section" = 'vision' AND "key" IN ('features', 'badge', 'subtitle')`);

    // 4. Gallery
    await client.query(`DELETE FROM "PageContent" WHERE "siteFor" = '${siteFor}' AND "page" = 'gallery' AND "section" = 'content'`);
    await client.query(`DELETE FROM "PageContent" WHERE "siteFor" = '${siteFor}' AND "page" = 'gallery' AND "section" = 'hero' AND "key" IN ('badge', 'subtitle')`);

    // 5. Privacy/Terms
    await client.query(`DELETE FROM "PageContent" WHERE "siteFor" = '${siteFor}' AND "page" IN ('privacy', 'terms') AND "section" = 'hero' AND "key" = 'subtitle'`);

    console.log("Database cleanup finished successfully.");
  } catch (err) {
    console.error("Error during cleanup:", err);
  } finally {
    await client.end();
  }
}

main();
