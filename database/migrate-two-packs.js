/**
 * Two Question Packs Migration Script
 *
 * This script creates both question packs with proper translations:
 * 1. US Starter Pack - 22 EN questions with HU translations
 * 2. HUN Starter Pack - 22 HU questions with EN translations
 *
 * Usage: node database/migrate-two-packs.js
 */

import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import { usStarterPackHU } from "./translations/us-starter-pack-hu.js";
import { hunStarterPackEN } from "./translations/hun-starter-pack-en.js";

// Load environment variables
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

// Helper: Check if question set exists
async function questionSetExists(slug) {
  const result = await sql`
    SELECT id FROM question_sets WHERE slug = ${slug}
  `;
  return result.length > 0 ? result[0].id : null;
}

// Helper: Check if question exists
async function questionExists(setId, questionTextEn) {
  const result = await sql`
    SELECT id FROM questions 
    WHERE set_id = ${setId} 
    AND question_en = ${questionTextEn}
  `;
  return result.length > 0;
}

// Helper: Get question ID
async function getQuestionId(setId, questionTextEn) {
  const result = await sql`
    SELECT id FROM questions 
    WHERE set_id = ${setId} 
    AND question_en = ${questionTextEn}
  `;
  return result.length > 0 ? result[0].id : null;
}

// Helper: Create or update question set
async function upsertQuestionSet(packData) {
  console.log(`\n📦 Processing question set: ${packData.setInfo.name_en}`);

  const existingSetId = await questionSetExists(packData.setInfo.slug);

  if (existingSetId) {
    console.log(
      `  ℹ️  Question set already exists (ID: ${existingSetId}), updating...`
    );
    await sql`
      UPDATE question_sets 
      SET 
        name_en = ${packData.setInfo.name_en},
        name_hu = ${packData.setInfo.name_hu},
        description_en = ${packData.setInfo.description_en},
        description_hu = ${packData.setInfo.description_hu},
        updated_at = NOW()
      WHERE slug = ${packData.setInfo.slug}
    `;
    return existingSetId;
  } else {
    console.log(`  ✅ Creating new question set...`);
    const result = await sql`
      INSERT INTO question_sets (slug, name_en, name_hu, description_en, description_hu)
      VALUES (
        ${packData.setInfo.slug},
        ${packData.setInfo.name_en},
        ${packData.setInfo.name_hu},
        ${packData.setInfo.description_en},
        ${packData.setInfo.description_hu}
      )
      RETURNING id
    `;
    return result[0].id;
  }
}

// Helper: Migrate questions and answers for a pack
async function migrateQuestionsAndAnswers(packData, setId) {
  console.log(`\n📝 Migrating questions for: ${packData.setInfo.name_en}`);

  let newQuestions = 0;
  let newAnswers = 0;
  let skippedQuestions = 0;

  for (let i = 0; i < packData.questions.length; i++) {
    const q = packData.questions[i];
    const questionNum = i + 1;

    // Check if question already exists
    if (await questionExists(setId, q.question_en)) {
      console.log(
        `  ⏭️  Question ${questionNum}/${
          packData.questions.length
        }: "${q.question_en.substring(0, 50)}..." (already exists, skipping)`
      );
      skippedQuestions++;
      continue;
    }

    console.log(
      `  ➕ Question ${questionNum}/${
        packData.questions.length
      }: "${q.question_en.substring(0, 50)}..."`
    );

    // Insert question
    const questionResult = await sql`
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
        ${q.question_en},
        ${q.question_hu},
        ${q.category},
        ${q.sourceName},
        ${q.sourceUrl},
        'medium'::difficulty_level,
        ${questionNum}
      )
      RETURNING id
    `;

    const questionId = questionResult[0].id;
    newQuestions++;

    // Insert answers
    for (let j = 0; j < q.answers.length; j++) {
      const answer = q.answers[j];
      await sql`
        INSERT INTO answers (
          question_id,
          answer_en,
          answer_hu,
          order_index
        )
        VALUES (
          ${questionId},
          ${answer.en},
          ${answer.hu},
          ${j + 1}
        )
      `;
      newAnswers++;
    }

    console.log(`     ✓ Added ${q.answers.length} answers`);
  }

  return { newQuestions, newAnswers, skippedQuestions };
}

// Main migration function
async function migrate() {
  console.log("🚀 Starting Two Question Packs Migration");
  console.log("=".repeat(60));

  try {
    // Test database connection
    console.log("\n🔌 Testing database connection...");
    const testResult = await sql`SELECT NOW() as current_time`;
    console.log(`✅ Connected to database at: ${testResult[0].current_time}`);

    // Migrate US Starter Pack
    console.log("\n" + "=".repeat(60));
    console.log("📦 PACK 1: US STARTER PACK");
    console.log("=".repeat(60));
    const usSetId = await upsertQuestionSet(usStarterPackHU);
    const usStats = await migrateQuestionsAndAnswers(usStarterPackHU, usSetId);

    // Migrate HUN Starter Pack
    console.log("\n" + "=".repeat(60));
    console.log("📦 PACK 2: HUN STARTER PACK");
    console.log("=".repeat(60));
    const hunSetId = await upsertQuestionSet(hunStarterPackEN);
    const hunStats = await migrateQuestionsAndAnswers(
      hunStarterPackEN,
      hunSetId
    );

    // Final statistics
    console.log("\n" + "=".repeat(60));
    console.log("📊 MIGRATION COMPLETE - FINAL STATISTICS");
    console.log("=".repeat(60));

    console.log("\n🇺🇸 US Starter Pack:");
    console.log(`  • New questions: ${usStats.newQuestions}`);
    console.log(`  • New answers: ${usStats.newAnswers}`);
    console.log(`  • Skipped questions: ${usStats.skippedQuestions}`);

    console.log("\n🇭🇺 HUN Starter Pack:");
    console.log(`  • New questions: ${hunStats.newQuestions}`);
    console.log(`  • New answers: ${hunStats.newAnswers}`);
    console.log(`  • Skipped questions: ${hunStats.skippedQuestions}`);

    console.log("\n📈 TOTALS:");
    console.log(
      `  • Total new questions: ${usStats.newQuestions + hunStats.newQuestions}`
    );
    console.log(
      `  • Total new answers: ${usStats.newAnswers + hunStats.newAnswers}`
    );
    console.log(
      `  • Total skipped: ${
        usStats.skippedQuestions + hunStats.skippedQuestions
      }`
    );

    // Verification
    console.log("\n🔍 Verifying database state...");

    const questionSets = await sql`
      SELECT 
        id,
        slug,
        name_en,
        name_hu,
        (SELECT COUNT(*) FROM questions WHERE set_id = question_sets.id) as question_count
      FROM question_sets
      ORDER BY created_at DESC
    `;

    console.log("\n📋 Question Sets in Database:");
    questionSets.forEach((set) => {
      console.log(
        `  • ${set.name_en} (${set.slug}): ${set.question_count} questions`
      );
    });

    const totalQuestions = await sql`SELECT COUNT(*) as count FROM questions`;
    const totalAnswers = await sql`SELECT COUNT(*) as count FROM answers`;

    console.log("\n📊 Database Totals:");
    console.log(`  • Total questions: ${totalQuestions[0].count}`);
    console.log(`  • Total answers: ${totalAnswers[0].count}`);

    // Check for questions with 0 answers
    const questionsWithZeroAnswers = await sql`
      SELECT 
        q.id,
        q.question_en,
        qs.name_en as set_name,
        (SELECT COUNT(*) FROM answers WHERE question_id = q.id) as answer_count
      FROM questions q
      JOIN question_sets qs ON q.set_id = qs.id
      WHERE (SELECT COUNT(*) FROM answers WHERE question_id = q.id) = 0
      ORDER BY q.id
    `;

    if (questionsWithZeroAnswers.length > 0) {
      console.log("\n⚠️  WARNING: Questions with 0 answers:");
      questionsWithZeroAnswers.forEach((q) => {
        console.log(
          `  • ID ${q.id} (${q.set_name}): "${q.question_en.substring(
            0,
            60
          )}..."`
        );
      });
    } else {
      console.log("\n✅ All questions have answers!");
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ Migration completed successfully!");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    console.error("Error details:", error.message);
    throw error;
  }
}

// Run migration
migrate()
  .then(() => {
    console.log("\n👋 Exiting...");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
  });
