import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";

dotenv.config({ path: ".env.local" });

const connectionString =
  process.env.POSTGRES_POSTGRES_URL || process.env.POSTGRES_DATABASE_URL;
const sql = neon(connectionString);

async function cleanup() {
  console.log("🧹 Starting cleanup of duplicate questions...\n");

  try {
    // First, let's see what we have
    const questions = await sql`
      SELECT id, question_en
      FROM questions
      ORDER BY id
    `;

    console.log(`Found ${questions.length} total questions\n`);

    // Find duplicates - keep the first occurrence (lower ID), delete the rest
    console.log("🔍 Identifying duplicates to remove...\n");

    const duplicatesToDelete = await sql`
      WITH duplicates AS (
        SELECT id, question_en,
               ROW_NUMBER() OVER (PARTITION BY question_en ORDER BY id) as rn
        FROM questions
      )
      SELECT id, question_en
      FROM duplicates
      WHERE rn > 1
      ORDER BY id
    `;

    console.log(
      `Found ${duplicatesToDelete.length} duplicate questions to delete:\n`
    );
    duplicatesToDelete.forEach((q) => {
      console.log(`   - ID ${q.id}: ${q.question_en.substring(0, 60)}...`);
    });

    if (duplicatesToDelete.length === 0) {
      console.log("\n✅ No duplicates found! Database is clean.");
      return;
    }

    console.log("\n⚠️  This will delete these questions and their answers.");
    console.log("Proceeding with cleanup in 2 seconds...\n");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Delete duplicates (CASCADE will handle answers automatically)
    const idsToDelete = duplicatesToDelete.map((q) => q.id);

    console.log("🗑️  Deleting duplicate questions...\n");

    const deleteResult = await sql`
      DELETE FROM questions
      WHERE id = ANY(${idsToDelete})
    `;

    console.log(
      `✅ Deleted ${duplicatesToDelete.length} duplicate questions\n`
    );

    // Verify cleanup
    const remainingQuestions = await sql`
      SELECT COUNT(*) as count FROM questions
    `;

    const remainingAnswers = await sql`
      SELECT COUNT(*) as count FROM answers
    `;

    console.log("📊 Final counts:");
    console.log(`   Questions: ${remainingQuestions[0].count}`);
    console.log(`   Answers: ${remainingAnswers[0].count}`);

    // Check for any remaining duplicates
    const stillDuplicated = await sql`
      SELECT question_en, COUNT(*) as count
      FROM questions
      GROUP BY question_en
      HAVING COUNT(*) > 1
    `;

    if (stillDuplicated.length > 0) {
      console.log(
        `\n⚠️  Warning: Still found ${stillDuplicated.length} duplicates!`
      );
    } else {
      console.log("\n✅ All duplicates removed successfully!");
    }
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    throw error;
  }
}

cleanup();
