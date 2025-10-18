import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

/**
 * Rename "starter pack" / "kezdőcsomag" -> "quiz pack" everywhere
 * - hun-starter-pack -> hun-quiz-pack
 * - "Starter Pack" -> "Quiz Pack" in names
 * - "Kezdőcsomag" -> "Quiz Pack" in Hungarian names
 * - Update all slugs to use "quiz-pack" naming
 */

async function renameToQuiz() {
  console.log('🔄 Renaming "starter pack" to "quiz" everywhere...\n');

  try {
    // Show current state
    console.log("📊 Current question_sets:");
    const currentSets = await sql`
      SELECT id, slug, name_en, name_hu, question_count
      FROM question_sets
      ORDER BY id
    `;
    currentSets.forEach((set) => {
      console.log(
        `  ${set.slug}: ${set.name_en} / ${set.name_hu} (${set.question_count} questions)`
      );
    });

    // Rename hun-starter-pack -> hun-quiz-pack
    console.log("\n🔄 Renaming hun-starter-pack -> hun-quiz-pack...");
    await sql`
      UPDATE question_sets
      SET slug = 'hun-quiz-pack',
          name_en = 'Hungarian Quiz Pack',
          name_hu = 'Magyar Quiz Pack'
      WHERE slug = 'hun-starter-pack'
    `;
    console.log("✅ Renamed hun-starter-pack to hun-quiz-pack");

    // Update International pack name
    console.log("\n🔄 Updating international pack name...");
    await sql`
      UPDATE question_sets
      SET name_en = 'International Quiz Pack',
          name_hu = 'Nemzetközi Quiz Pack'
      WHERE slug = 'international'
    `;
    console.log("✅ Updated international pack name");

    // Update Free pack name
    console.log("\n🔄 Updating free pack name...");
    await sql`
      UPDATE question_sets
      SET name_en = 'Free Quiz Pack',
          name_hu = 'Ingyenes Quiz Pack'
      WHERE slug = 'free'
    `;
    console.log("✅ Updated free pack name");

    // Show final state
    console.log("\n📊 Final question_sets:");
    const finalSets = await sql`
      SELECT id, slug, name_en, name_hu, question_count
      FROM question_sets
      ORDER BY id
    `;
    finalSets.forEach((set) => {
      console.log(
        `  ${set.slug}: ${set.name_en} / ${set.name_hu} (${set.question_count} questions)`
      );
    });

    console.log("\n✅ Database renaming complete!");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

renameToQuiz()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
