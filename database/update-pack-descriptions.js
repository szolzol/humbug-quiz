import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

/**
 * Update question pack descriptions
 */

async function updatePackDescriptions() {
  console.log("🔄 Updating question pack descriptions...\n");

  try {
    // Update FREE pack
    console.log("📦 Updating FREE pack...");
    await sql`
      UPDATE question_sets
      SET description_en = 'Free question pack available to visitor users - perfect for trying out the game',
          description_hu = 'Ingyenes kérdéscsomag látogatók számára - ideális a játék kipróbálásához'
      WHERE slug = 'free'
    `;
    console.log("✅ FREE pack updated\n");

    // Update INTERNATIONAL pack
    console.log("📦 Updating INTERNATIONAL pack...");
    await sql`
      UPDATE question_sets
      SET description_en = 'Original "Humbug!" quiz questions including general knowledge and some US specific questions',
          description_hu = 'Eredeti "Humbug!" kérdések általános témakörökben, 1-2 USA specifikus kérdéssel'
      WHERE slug = 'international'
    `;
    console.log("✅ INTERNATIONAL pack updated\n");

    // Update HUN pack
    console.log("📦 Updating HUN pack...");
    await sql`
      UPDATE question_sets
      SET description_en = 'Hungary focused trivia covering the country with various topics',
          description_hu = 'Magyarország témájú kvíz kérdések változatos témákban'
      WHERE slug = 'hun-quiz-pack'
    `;
    console.log("✅ HUN pack updated\n");

    // Verify updates
    console.log("📊 Verifying updates...\n");
    const packs = await sql`
      SELECT id, slug, name_en, name_hu, description_en, description_hu, question_count
      FROM question_sets
      ORDER BY id
    `;

    packs.forEach((pack) => {
      console.log(`${"=".repeat(60)}`);
      console.log(`📦 ${pack.slug} (${pack.question_count} questions)`);
      console.log(`${"=".repeat(60)}`);
      console.log(`\n🇬🇧 English:`);
      console.log(`   Name: ${pack.name_en}`);
      console.log(`   Description: ${pack.description_en}`);
      console.log(`\n🇭🇺 Hungarian:`);
      console.log(`   Name: ${pack.name_hu}`);
      console.log(`   Description: ${pack.description_hu}\n`);
    });

    console.log("✅ All pack descriptions updated successfully!\n");
  } catch (error) {
    console.error("❌ Error updating descriptions:", error);
    throw error;
  }
}

updatePackDescriptions()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
