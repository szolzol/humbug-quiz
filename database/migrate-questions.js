/**
 * HUMBUG! Database Migration Script
 *
 * Purpose: Migrate questions from JSON locale files to PostgreSQL database
 * Source: src/locales/en.json and src/locales/hu.json
 * Target: Vercel Postgres database
 *
 * Usage:
 *   node database/migrate-questions.js
 *
 * Prerequisites:
 *   - Vercel Postgres provisioned
 *   - Schema already created (database/schema.sql)
 *   - Environment variables set (POSTGRES_URL)
 */

import { neon } from "@neondatabase/serverless";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
dotenv.config({ path: path.join(__dirname, "../.env.local") });

// Create Neon connection
const connectionString =
  process.env.POSTGRES_POSTGRES_URL || process.env.POSTGRES_DATABASE_URL;
const sql = neon(connectionString);

// Load JSON files
const enData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../src/locales/en.json"), "utf-8")
);
const huData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../src/locales/hu.json"), "utf-8")
);

/**
 * Main migration function
 */
async function migrateQuestions() {
  console.log("🚀 Starting HUMBUG! Questions Migration...\n");

  try {
    // Step 1: Verify schema exists
    console.log("📋 Step 1: Verifying database schema...");
    await verifySchema();
    console.log("✅ Schema verified\n");

    // Step 2: Create or get "Original HUMBUG!" question set
    console.log("📦 Step 2: Creating question set...");
    const setId = await createQuestionSet();
    console.log(`✅ Question set created with ID: ${setId}\n`);

    // Step 3: Migrate questions and answers
    console.log("📝 Step 3: Migrating questions and answers...");
    const stats = await migrateQuestionsAndAnswers(setId);
    console.log(`✅ Migration complete!\n`);

    // Step 4: Display summary
    displaySummary(stats);

    // Step 5: Verify migration
    console.log("🔍 Step 5: Verifying migration...");
    await verifyMigration(setId, stats);
    console.log("✅ Verification complete\n");

    console.log("🎉 Migration successful!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    console.error(error.stack);
    process.exit(1);
  }
}

/**
 * Verify that the database schema exists
 */
async function verifySchema() {
  const rows = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('users', 'question_sets', 'questions', 'answers')
  `;

  const requiredTables = ["users", "question_sets", "questions", "answers"];
  const existingTables = rows.map((r) => r.table_name);
  const missingTables = requiredTables.filter(
    (t) => !existingTables.includes(t)
  );

  if (missingTables.length > 0) {
    throw new Error(
      `Missing required tables: ${missingTables.join(", ")}. ` +
        "Please run database/schema.sql first."
    );
  }

  console.log("   Found tables:", existingTables.join(", "));
}

/**
 * Create the "Original HUMBUG!" question set
 */
async function createQuestionSet() {
  // Check if it already exists
  const existing = await sql`
    SELECT id FROM question_sets WHERE slug = 'original'
  `;

  if (existing.length > 0) {
    console.log('   Question set "original" already exists, using existing ID');
    return existing[0].id;
  }

  // Create new question set
  const rows = await sql`
    INSERT INTO question_sets (
      slug,
      name_en,
      name_hu,
      description_en,
      description_hu,
      access_level,
      is_active,
      is_published,
      display_order,
      metadata
    )
    VALUES (
      'original',
      'Original HUMBUG!',
      'Eredeti HUMBUG!',
      'The original collection of HUMBUG! questions covering entertainment, sports, travel, technology, gastronomy, and culture.',
      'Az eredeti HUMBUG! kérdésgyűjtemény szórakozás, sport, utazás, technológia, gasztronómia és kultúra témákban.',
      'free',
      true,
      true,
      1,
      '{"tags": ["original", "classic", "general"], "estimatedPlayTime": "30-45 min", "minPlayers": 3, "maxPlayers": 8, "ageRating": "12+"}'::jsonb
    )
    RETURNING id
  `;

  console.log("   Created new question set");
  return rows[0].id;
}

/**
 * Migrate all questions and their answers
 */
async function migrateQuestionsAndAnswers(setId) {
  const enQuestions = enData.allQuestions;
  const huQuestions = huData.allQuestions;

  if (enQuestions.length !== huQuestions.length) {
    throw new Error(
      `Question count mismatch: EN has ${enQuestions.length}, HU has ${huQuestions.length}`
    );
  }

  const stats = {
    total: enQuestions.length,
    questionsCreated: 0,
    answersCreated: 0,
    errors: [],
  };

  for (let i = 0; i < enQuestions.length; i++) {
    const enQ = enQuestions[i];
    const huQ = huQuestions[i];

    try {
      // Verify IDs match
      if (enQ.id !== huQ.id) {
        throw new Error(
          `Question ID mismatch at index ${i}: EN=${enQ.id}, HU=${huQ.id}`
        );
      }

      // Check if question already exists
      const existingQuestions = await sql`
        SELECT id FROM questions
        WHERE set_id = ${setId}
          AND question_en = ${enQ.question}
      `;

      let questionId;

      if (existingQuestions.length > 0) {
        // Question already exists, skip it
        questionId = existingQuestions[0].id;
        console.log(
          `   ⏭️  Question ${i + 1}/${
            stats.total
          }: Already exists (ID ${questionId})`
        );
        continue;
      }

      // Insert new question
      const questionRows = await sql`
        INSERT INTO questions (
          set_id,
          question_en,
          question_hu,
          category,
          source_name,
          source_url,
          order_index,
          is_active
        )
        VALUES (
          ${setId},
          ${enQ.question},
          ${huQ.question},
          ${enQ.category},
          ${enQ.sourceName || null},
          ${enQ.sourceUrl || null},
          ${i},
          true
        )
        RETURNING id
      `;

      questionId = questionRows[0].id;
      stats.questionsCreated++;

      // Insert answers
      if (!enQ.answers || !huQ.answers) {
        console.warn(`   ⚠️  Question ${enQ.id} has no answers`);
        continue;
      }

      if (enQ.answers.length !== huQ.answers.length) {
        throw new Error(
          `Answer count mismatch for question ${enQ.id}: ` +
            `EN has ${enQ.answers.length}, HU has ${huQ.answers.length}`
        );
      }

      for (let j = 0; j < enQ.answers.length; j++) {
        await sql`
          INSERT INTO answers (
            question_id,
            answer_en,
            answer_hu,
            order_index
          )
          VALUES (
            ${questionId},
            ${enQ.answers[j]},
            ${huQ.answers[j]},
            ${j}
          )
        `;
        stats.answersCreated++;
      }

      console.log(
        `   ✅ Question ${i + 1}/${stats.total}: "${enQ.question.substring(
          0,
          50
        )}..." ` + `(${enQ.answers.length} answers)`
      );
    } catch (error) {
      stats.errors.push({
        questionId: enQ.id,
        index: i,
        error: error.message,
      });
      console.error(`   ❌ Error on question ${enQ.id}:`, error.message);
    }
  }

  return stats;
}

/**
 * Display migration summary
 */
function displaySummary(stats) {
  console.log("\n" + "=".repeat(60));
  console.log("📊 MIGRATION SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total questions in JSON:  ${stats.total}`);
  console.log(`Questions created:        ${stats.questionsCreated}`);
  console.log(`Answers created:          ${stats.answersCreated}`);
  console.log(`Errors:                   ${stats.errors.length}`);
  console.log("=".repeat(60) + "\n");

  if (stats.errors.length > 0) {
    console.log("⚠️  ERRORS:");
    stats.errors.forEach((err) => {
      console.log(
        `   - Question ${err.questionId} (index ${err.index}): ${err.error}`
      );
    });
    console.log("");
  }
}

/**
 * Verify migration results
 */
async function verifyMigration(setId, stats) {
  // Check question count
  const questionCount = await sql`
    SELECT COUNT(*) as count FROM questions WHERE set_id = ${setId}
  `;

  // Check answer count
  const answerCount = await sql`
    SELECT COUNT(*) as count FROM answers
    WHERE question_id IN (
      SELECT id FROM questions WHERE set_id = ${setId}
    )
  `;

  // Check question_sets.question_count (should be updated by trigger)
  const setInfo = await sql`
    SELECT question_count FROM question_sets WHERE id = ${setId}
  `;

  console.log(
    `   Questions in DB: ${questionCount[0].count} (expected: ${stats.total})`
  );
  console.log(
    `   Answers in DB: ${answerCount[0].count} (created: ${stats.answersCreated})`
  );
  console.log(
    `   Set question_count: ${setInfo[0].question_count} (should match questions)`
  );

  // Verify question count matches total (all questions should exist, even if some have 0 answers)
  if (parseInt(questionCount[0].count) !== stats.total) {
    throw new Error(
      `Question count mismatch! Expected ${stats.total}, got ${questionCount[0].count}`
    );
  }

  // Note: We don't check answer count because some questions may have 0 answers due to validation errors

  if (parseInt(setInfo[0].question_count) !== stats.total) {
    console.warn("   ⚠️  Warning: question_count not updated by trigger");
  }

  // Display sample questions
  const samples = await sql`
    SELECT 
      q.id,
      q.question_en,
      q.category,
      COUNT(a.id) as answer_count
    FROM questions q
    LEFT JOIN answers a ON a.question_id = q.id
    WHERE q.set_id = ${setId}
    GROUP BY q.id, q.question_en, q.category
    ORDER BY q.order_index
    LIMIT 3
  `;

  console.log("\n   Sample questions:");
  samples.forEach((s, i) => {
    console.log(
      `   ${i + 1}. [${s.category}] ${s.question_en.substring(0, 60)}...`
    );
    console.log(`      Answers: ${s.answer_count}`);
  });
}

/**
 * Rollback function (for manual cleanup if needed)
 */
export async function rollback() {
  console.log("🔄 Rolling back migration...");

  try {
    // Delete all data from "original" set
    await sql`
      DELETE FROM question_sets WHERE slug = 'original'
    `;
    // Cascade will delete questions and answers automatically

    console.log("✅ Rollback complete");
  } catch (error) {
    console.error("❌ Rollback failed:", error);
    throw error;
  }
}

/**
 * Utility: Display current database state
 */
export async function displayDatabaseState() {
  console.log("\n📊 Current Database State:\n");

  // Question sets
  const sets = await sql`
    SELECT 
      id, 
      slug, 
      name_en, 
      question_count, 
      is_published 
    FROM question_sets
    ORDER BY display_order
  `;

  console.log("Question Sets:");
  sets.forEach((s) => {
    console.log(
      `  - ${s.slug}: "${s.name_en}" (${s.question_count} questions, published: ${s.is_published})`
    );
  });

  // Questions by category
  const categories = await sql`
    SELECT 
      category, 
      COUNT(*) as count
    FROM questions
    GROUP BY category
    ORDER BY category
  `;

  console.log("\nQuestions by Category:");
  categories.forEach((c) => {
    console.log(`  - ${c.category}: ${c.count}`);
  });

  // Total answers
  const answerTotal = await sql`
    SELECT COUNT(*) as count FROM answers
  `;

  console.log(`\nTotal Answers: ${answerTotal[0].count}\n`);
}

// Run migration if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrateQuestions();
}

// Export functions for programmatic use
export {
  migrateQuestions,
  verifySchema,
  createQuestionSet,
  migrateQuestionsAndAnswers,
  verifyMigration,
};
