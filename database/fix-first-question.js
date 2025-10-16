/**
 * Fix First Question - Add Missing Answers
 *
 * The first question in US Starter Pack was created without answers.
 * This script deletes it and reimports it with all answers.
 */

import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import { usStarterPackHU } from "./translations/us-starter-pack-hu.js";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

async function fixFirstQuestion() {
  console.log("🔧 Fixing US Starter Pack First Question");
  console.log("=".repeat(60));

  try {
    // Get US Starter Pack ID
    const setResult = await sql`
      SELECT id FROM question_sets WHERE slug = 'us-starter-pack'
    `;

    if (setResult.length === 0) {
      console.log("❌ US Starter Pack not found!");
      return;
    }

    const setId = setResult[0].id;
    console.log(`✅ Found US Starter Pack (ID: ${setId})\n`);

    // Get first question (order_index = 1)
    const questionResult = await sql`
      SELECT id, question_en FROM questions
      WHERE set_id = ${setId} AND order_index = 1
    `;

    if (questionResult.length === 0) {
      console.log("❌ First question not found!");
      return;
    }

    const questionId = questionResult[0].id;
    const questionText = questionResult[0].question_en;
    console.log(`📝 Found first question (ID: ${questionId}):`);
    console.log(`   "${questionText.substring(0, 70)}..."\n`);

    // Check current answers
    const currentAnswers = await sql`
      SELECT COUNT(*) as count FROM answers WHERE question_id = ${questionId}
    `;
    console.log(`📊 Current answers: ${currentAnswers[0].count}`);

    if (currentAnswers[0].count > 0) {
      console.log("✅ Question already has answers! Nothing to fix.\n");
      return;
    }

    console.log("❌ No answers found! Deleting and reimporting...\n");

    // Delete the question (CASCADE will delete any orphaned answers)
    await sql`DELETE FROM questions WHERE id = ${questionId}`;
    console.log("🗑️  Deleted question without answers");

    // Get the first question data from source
    const firstQuestionData = usStarterPackHU.questions[0];

    console.log("\n➕ Reimporting question with answers...");

    // Insert question
    const newQuestionResult = await sql`
      INSERT INTO questions (
        set_id,
        question_en,
        question_hu,
        category,
        source_name,
        source_url,
        difficulty,
        order_index
      )
      VALUES (
        ${setId},
        ${firstQuestionData.question_en},
        ${firstQuestionData.question_hu},
        ${firstQuestionData.category},
        ${firstQuestionData.sourceName},
        ${firstQuestionData.sourceUrl},
        'medium'::difficulty_level,
        1
      )
      RETURNING id
    `;

    const newQuestionId = newQuestionResult[0].id;
    console.log(`✅ Created question (ID: ${newQuestionId})`);

    // Insert all answers
    console.log(`\n📝 Adding ${firstQuestionData.answers.length} answers:`);
    for (let i = 0; i < firstQuestionData.answers.length; i++) {
      const answer = firstQuestionData.answers[i];
      await sql`
        INSERT INTO answers (
          question_id,
          answer_en,
          answer_hu,
          order_index
        )
        VALUES (
          ${newQuestionId},
          ${answer.en},
          ${answer.hu},
          ${i + 1}
        )
      `;
      console.log(`   ${i + 1}. ${answer.en}`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ FIX COMPLETE!");
    console.log("=".repeat(60));
    console.log(`📊 Question ID: ${newQuestionId}`);
    console.log(`📊 Answers added: ${firstQuestionData.answers.length}`);
  } catch (error) {
    console.error("\n❌ Error during fix:", error);
    throw error;
  }
}

// Run the fix
fixFirstQuestion()
  .then(() => {
    console.log("\n✅ Fix completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Fix failed:", error);
    process.exit(1);
  });
