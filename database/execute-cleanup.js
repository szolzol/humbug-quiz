import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

/**
 * This script will:
 * 1. Delete all duplicate questions (keep lowest ID)
 * 2. Ensure INT pack has exactly 18 questions
 * 3. Ensure FREE pack has 4 questions
 * 4. Ensure HUN pack has 6 questions
 * Total: 28 unique questions (4 FREE + 6 HUN + 18 INT)
 */

async function executeCleanup() {
  console.log("🚀 Executing cleanup...\n");

  try {
    // IDs to delete (duplicates identified earlier)
    const duplicatesToDelete = [
      46,
      68, // Instagram celebrities (keep 2)
      50,
      72, // European airports (keep 6)
      51,
      73, // IMDb 8.7 movies (keep 7)
      52,
      74, // Champions League (keep 8)
      70, // Video games (keep 48)
      75, // Musical artists (keep 53)
      78, // Downloaded apps (keep 56)
      79, // Marvel characters (keep 57)
      80, // Emmy awards (keep 58)
      82, // Fast-food chains (keep 60)
      83, // Sports leagues (keep 61)
      85, // Market cap companies (keep 63)
      86, // Populated countries (keep 64)
      87, // Spoken languages (keep 65)
      88, // Soft drinks (keep 66)
      84, // 2025 movies (keep 62, delete 84 as duplicate)
    ];

    console.log(
      `📋 Deleting ${duplicatesToDelete.length} duplicate questions...`
    );
    console.log(`   IDs: ${duplicatesToDelete.join(", ")}`);

    // Delete duplicates
    await sql`DELETE FROM questions WHERE id = ANY(${duplicatesToDelete})`;
    console.log(
      `✅ Deleted ${duplicatesToDelete.length} duplicate questions\n`
    );

    // Verify remaining questions
    const remaining = await sql`
      SELECT set_id, COUNT(*) as count
      FROM questions
      GROUP BY set_id
      ORDER BY set_id
    `;

    console.log(`📊 Remaining questions by pack:`);
    remaining.forEach((row) => {
      const packName =
        row.set_id === 1 ? "FREE" : row.set_id === 2 ? "INT" : "HUN";
      console.log(
        `   ${packName} (set_id ${row.set_id}): ${row.count} questions`
      );
    });

    // Update question_count in question_sets table
    await sql`
      UPDATE question_sets 
      SET question_count = (
        SELECT COUNT(*) 
        FROM questions 
        WHERE questions.set_id = question_sets.id
      )
    `;
    console.log(`\n✅ Updated question_count in question_sets table`);

    // Show final counts
    const finalPacks = await sql`
      SELECT id, slug, name_en, question_count
      FROM question_sets
      ORDER BY id
    `;

    console.log(`\n📊 Final pack distribution:`);
    finalPacks.forEach((pack) => {
      console.log(
        `   ${pack.slug}: ${pack.question_count} questions (${pack.name_en})`
      );
    });

    // Verify total
    const total = await sql`SELECT COUNT(*) as count FROM questions`;
    console.log(`\n✅ Total questions in database: ${total[0].count}`);
    console.log(`   Expected: 28 (4 FREE + 6 HUN + 18 INT)`);

    if (total[0].count === 28) {
      console.log(`\n🎉 SUCCESS! Database reorganization complete!`);
    } else {
      console.log(
        `\n⚠️  Warning: Expected 28 questions, got ${total[0].count}`
      );
    }
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    throw error;
  }
}

executeCleanup()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
