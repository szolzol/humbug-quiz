/**
 * Check for duplicate questions in US Starter Pack
 *
 * Usage: node database/check-us-pack-duplicates.js
 */

import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

async function checkDuplicates() {
  console.log("🔍 Checking US Starter Pack for duplicates...\n");

  try {
    // Get US pack
    const packResult = await sql`
      SELECT id, slug, name_en
      FROM question_sets
      WHERE slug = 'us-starter-pack'
    `;

    if (packResult.length === 0) {
      console.log("❌ US Starter Pack not found");
      return;
    }

    const pack = packResult[0];
    console.log(`Pack: ${pack.name_en} (ID: ${pack.id})\n`);

    // Get all questions
    const questions = await sql`
      SELECT 
        id,
        question_en,
        question_hu,
        category
      FROM questions
      WHERE set_id = ${pack.id}
      ORDER BY id
    `;

    console.log(`Total questions in US pack: ${questions.length}\n`);

    // Check for duplicate question text
    const questionTexts = new Map();
    const duplicates = [];

    questions.forEach((q) => {
      const key = q.question_en.toLowerCase().trim();
      if (questionTexts.has(key)) {
        duplicates.push({
          id1: questionTexts.get(key),
          id2: q.id,
          text: q.question_en,
        });
      } else {
        questionTexts.set(key, q.id);
      }
    });

    if (duplicates.length > 0) {
      console.log(`⚠️  Found ${duplicates.length} duplicate questions:\n`);
      duplicates.forEach((dup) => {
        console.log(
          `  IDs ${dup.id1} and ${dup.id2}: ${dup.text.substring(0, 70)}...`
        );
      });
    } else {
      console.log("✅ No duplicate question texts found");
    }

    // Check which questions came from the original pack (IDs 1-22 range)
    const originalRangeQuestions = questions.filter(
      (q) => q.id >= 1 && q.id <= 22
    );
    const movedQuestions = questions.filter(
      (q) =>
        q.id >= 1 &&
        q.id <= 22 &&
        q.id !== 2 &&
        q.id !== 6 &&
        q.id !== 7 &&
        q.id !== 8
    );
    const usOriginalQuestions = questions.filter((q) => q.id >= 46);

    console.log(`\n📊 Question breakdown:`);
    console.log(
      `  Questions from original pack (moved): ${movedQuestions.length}`
    );
    console.log(
      `    IDs: ${movedQuestions
        .map((q) => q.id)
        .sort((a, b) => a - b)
        .join(", ")}`
    );
    console.log(
      `  US Starter Pack original questions: ${usOriginalQuestions.length}`
    );
    console.log(
      `    IDs: ${usOriginalQuestions
        .map((q) => q.id)
        .sort((a, b) => a - b)
        .join(", ")}`
    );

    // Show all question IDs
    console.log(`\n📝 All question IDs in US pack:`);
    console.log(`  ${questions.map((q) => q.id).join(", ")}`);
  } catch (error) {
    console.error("\n❌ Error:", error);
    throw error;
  }
}

checkDuplicates()
  .then(() => {
    console.log("\n✅ Check completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Check failed:", error);
    process.exit(1);
  });
