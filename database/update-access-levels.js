/**
 * Update Question Pack Access Levels
 *
 * This script updates the question packs to implement premium access:
 * 1. Rename "Eredeti HUMBUG!" to "Ingyenes kérdések" / "Free Questions"
 * 2. Set "original" pack as 'free' (for unauthenticated users)
 * 3. Set "us-starter-pack" and "hun-starter-pack" as 'premium' (authenticated only)
 *
 * Usage: node database/update-access-levels.js
 */

import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

async function updateAccessLevels() {
  console.log("🔐 Updating question pack access levels...\n");

  try {
    // 1. Update "original" pack - rename and ensure it's free
    console.log('1️⃣  Updating "original" pack (Free Questions)...');
    const originalUpdate = await sql`
      UPDATE question_sets 
      SET 
        name_en = 'Free Questions',
        name_hu = 'Ingyenes kérdések',
        description_en = 'Free question pack available to all users - perfect for trying out the game!',
        description_hu = 'Ingyenes kérdéscsomag minden felhasználó számára - ideális a játék kipróbálásához!',
        access_level = 'free',
        display_order = 1,
        updated_at = NOW()
      WHERE slug = 'original'
      RETURNING id, slug, name_en, name_hu, access_level
    `;

    if (originalUpdate.length > 0) {
      console.log(
        `   ✅ Updated: ${originalUpdate[0].name_en} (${originalUpdate[0].name_hu})`
      );
      console.log(`      Access: ${originalUpdate[0].access_level}`);
    } else {
      console.log('   ⚠️  Warning: "original" pack not found');
    }

    // 2. Update "us-starter-pack" - set as premium
    console.log('\n2️⃣  Updating "us-starter-pack" (Premium)...');
    const usUpdate = await sql`
      UPDATE question_sets 
      SET 
        access_level = 'premium',
        display_order = 2,
        updated_at = NOW()
      WHERE slug = 'us-starter-pack'
      RETURNING id, slug, name_en, name_hu, access_level
    `;

    if (usUpdate.length > 0) {
      console.log(
        `   ✅ Updated: ${usUpdate[0].name_en} (${usUpdate[0].name_hu})`
      );
      console.log(`      Access: ${usUpdate[0].access_level}`);
    } else {
      console.log('   ⚠️  Warning: "us-starter-pack" not found');
    }

    // 3. Update "hun-starter-pack" - set as premium
    console.log('\n3️⃣  Updating "hun-starter-pack" (Premium)...');
    const hunUpdate = await sql`
      UPDATE question_sets 
      SET 
        access_level = 'premium',
        display_order = 3,
        updated_at = NOW()
      WHERE slug = 'hun-starter-pack'
      RETURNING id, slug, name_en, name_hu, access_level
    `;

    if (hunUpdate.length > 0) {
      console.log(
        `   ✅ Updated: ${hunUpdate[0].name_en} (${hunUpdate[0].name_hu})`
      );
      console.log(`      Access: ${hunUpdate[0].access_level}`);
    } else {
      console.log('   ⚠️  Warning: "hun-starter-pack" not found');
    }

    // 4. Verify the changes
    console.log("\n📊 Verification - Current question sets:\n");
    const allSets = await sql`
      SELECT 
        slug,
        name_en,
        name_hu,
        access_level,
        is_published,
        display_order,
        question_count
      FROM question_sets
      ORDER BY display_order ASC
    `;

    console.log(
      "┌─────────────────────┬──────────────────────┬──────────────────────┬─────────┬──────────┬───────────┐"
    );
    console.log(
      "│ Slug                │ Name (EN)            │ Name (HU)            │ Access  │ Published│ Questions │"
    );
    console.log(
      "├─────────────────────┼──────────────────────┼──────────────────────┼─────────┼──────────┼───────────┤"
    );

    allSets.forEach((set) => {
      console.log(
        `│ ${set.slug.padEnd(19)} │ ${set.name_en.padEnd(
          20
        )} │ ${set.name_hu.padEnd(20)} │ ${set.access_level.padEnd(
          7
        )} │ ${(set.is_published ? "Yes" : "No").padEnd(8)} │ ${String(
          set.question_count || 0
        ).padStart(9)} │`
      );
    });

    console.log(
      "└─────────────────────┴──────────────────────┴──────────────────────┴─────────┴──────────┴───────────┘"
    );

    console.log("\n✅ Access level update completed successfully!\n");
    console.log("Summary:");
    console.log(
      '  • Free pack: "Ingyenes kérdések" (original) - available to all users'
    );
    console.log(
      '  • Premium pack: "US Starter Pack" - requires authentication'
    );
    console.log(
      '  • Premium pack: "HUN Starter Pack" - requires authentication'
    );
  } catch (error) {
    console.error("\n❌ Error updating access levels:", error);
    throw error;
  }
}

// Run the migration
updateAccessLevels()
  .then(() => {
    console.log("\n✨ Migration completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Migration failed:", error);
    process.exit(1);
  });
