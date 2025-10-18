/**
 * Check current pack slugs
 */

import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

async function checkSlugs() {
  const packs = await sql`
    SELECT slug, name_en, name_hu, access_level
    FROM question_sets
    WHERE is_active = true
    ORDER BY slug
  `;

  console.log("📦 Current pack slugs:\n");
  packs.forEach((p) => {
    console.log(`   ${p.slug}`);
    console.log(`      EN: ${p.name_en}`);
    console.log(`      HU: ${p.name_hu}`);
    console.log(`      Access: ${p.access_level}\n`);
  });
}

checkSlugs();
