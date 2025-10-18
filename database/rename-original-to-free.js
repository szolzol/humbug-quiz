/**
 * Rename pack slug from "original" to "free"
 * Better URL: /pack/free instead of /pack/original
 */

import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

async function renamePack() {
  console.log("🔄 Renaming pack slug from 'original' to 'free'...\n");

  try {
    // Check current state
    const before = await sql`
      SELECT slug, name_en, name_hu
      FROM question_sets
      WHERE slug = 'original'
    `;

    if (before.length === 0) {
      console.log("❌ Pack with slug 'original' not found!");
      return;
    }

    console.log("📦 Current pack:");
    console.log(`   Slug: ${before[0].slug}`);
    console.log(`   EN: ${before[0].name_en}`);
    console.log(`   HU: ${before[0].name_hu}`);
    console.log();

    // Update slug
    const result = await sql`
      UPDATE question_sets
      SET slug = 'free'
      WHERE slug = 'original'
      RETURNING slug, name_en, name_hu
    `;

    console.log("✅ Pack renamed successfully!");
    console.log(`   New slug: ${result[0].slug}`);
    console.log(`   EN: ${result[0].name_en}`);
    console.log(`   HU: ${result[0].name_hu}`);
    console.log();

    // Verify
    const after = await sql`
      SELECT slug, name_en, name_hu, access_level
      FROM question_sets
      WHERE slug = 'free'
    `;

    console.log("🔍 Verification:");
    console.log(`   Slug: ${after[0].slug}`);
    console.log(`   Access: ${after[0].access_level}`);
    console.log();

    console.log("✅ Migration complete! New URL will be: /pack/free");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

renamePack();
