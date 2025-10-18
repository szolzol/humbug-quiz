/**
 * Check all questions in each pack with EN and HU content
 * This will help us verify if the database has the correct content for each language
 */

import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

async function checkPackContent() {
  console.log("🔍 Checking all packs with EN and HU content...\n");

  try {
    // Get all question sets
    const sets = await sql`
      SELECT id, slug, name_en, name_hu, access_level
      FROM question_sets
      WHERE is_active = true
      ORDER BY slug
    `;

    for (const set of sets) {
      console.log(`\n${"=".repeat(80)}`);
      console.log(`📦 Pack: ${set.slug}`);
      console.log(`   EN Name: ${set.name_en}`);
      console.log(`   HU Name: ${set.name_hu}`);
      console.log(`   Access: ${set.access_level}`);
      console.log(`${"=".repeat(80)}\n`);

      // Get questions for this set
      const questions = await sql`
        SELECT 
          q.id,
          q.question_en,
          q.question_hu,
          q.category,
          q.order_index
        FROM questions q
        WHERE q.set_id = ${set.id} AND q.is_active = true
        ORDER BY q.order_index ASC
        LIMIT 5
      `;

      console.log(`Found ${questions.length} questions (showing first 5):\n`);

      for (const q of questions) {
        console.log(`  Question ID: ${q.id} (order: ${q.order_index})`);
        console.log(`  Category: ${q.category}`);
        console.log(
          `  EN: ${q.question_en.substring(0, 100)}${
            q.question_en.length > 100 ? "..." : ""
          }`
        );
        console.log(
          `  HU: ${q.question_hu.substring(0, 100)}${
            q.question_hu.length > 100 ? "..." : ""
          }`
        );

        // Check if EN and HU are different
        if (q.question_en === q.question_hu) {
          console.log(`  ⚠️  WARNING: EN and HU are identical!`);
        }

        // Get a few answers
        const answers = await sql`
          SELECT answer_en, answer_hu
          FROM answers
          WHERE question_id = ${q.id}
          ORDER BY order_index
          LIMIT 3
        `;

        console.log(`  Sample Answers (showing 3 of ${answers.length}):`);
        for (let i = 0; i < Math.min(3, answers.length); i++) {
          const a = answers[i];
          console.log(`    ${i + 1}. EN: ${a.answer_en}`);
          console.log(`       HU: ${a.answer_hu}`);
          if (a.answer_en === a.answer_hu) {
            console.log(`       ⚠️  WARNING: EN and HU are identical!`);
          }
        }
        console.log();
      }

      // Get total counts
      const counts = await sql`
        SELECT 
          COUNT(DISTINCT q.id) as question_count,
          COUNT(a.id) as answer_count
        FROM questions q
        LEFT JOIN answers a ON a.question_id = q.id
        WHERE q.set_id = ${set.id} AND q.is_active = true
      `;

      console.log(
        `📊 Total: ${counts[0].question_count} questions, ${counts[0].answer_count} answers\n`
      );
    }

    console.log("\n✅ Pack content check complete!");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

checkPackContent();
