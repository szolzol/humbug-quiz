/**
 * Check questions in the original pack
 *
 * Usage: node database/check-original-questions.js
 */

import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

async function checkQuestions() {
  console.log("🔍 Checking questions in 'original' pack...\n");

  try {
    // Get the original pack ID
    const packResult = await sql`
      SELECT id, slug, name_en, name_hu, question_count
      FROM question_sets
      WHERE slug = 'original'
    `;

    if (packResult.length === 0) {
      console.log("❌ Original pack not found");
      return;
    }

    const pack = packResult[0];
    console.log(`Pack: ${pack.name_en} (${pack.name_hu})`);
    console.log(`Pack ID: ${pack.id}`);
    console.log(`Question count: ${pack.question_count}\n`);

    // Get all questions in this pack
    const questions = await sql`
      SELECT 
        id,
        question_en,
        question_hu,
        category,
        source_name
      FROM questions
      WHERE set_id = ${pack.id}
      ORDER BY id ASC
    `;

    console.log(`Found ${questions.length} questions:\n`);
    console.log(
      "┌──────┬──────────────────────────────────────────────────┬─────────────────┬──────────────────┐"
    );
    console.log(
      "│ ID   │ Question (EN)                                    │ Category        │ Source           │"
    );
    console.log(
      "├──────┼──────────────────────────────────────────────────┼─────────────────┼──────────────────┤"
    );

    questions.forEach((q) => {
      const questionPreview = q.question_en.substring(0, 48).padEnd(48);
      const category = (q.category || "").padEnd(15);
      const source = (q.source_name || "").padEnd(16);
      console.log(
        `│ ${String(q.id).padStart(
          4
        )} │ ${questionPreview} │ ${category} │ ${source} │`
      );
    });

    console.log(
      "└──────┴──────────────────────────────────────────────────┴─────────────────┴──────────────────┘"
    );

    // Check if IDs 6, 2, 7, 8 exist
    console.log("\n🎯 Checking for target questions (IDs: 6, 2, 7, 8):\n");
    const targetIds = [6, 2, 7, 8];

    for (const id of targetIds) {
      const q = questions.find((q) => q.id === id);
      if (q) {
        console.log(`✅ ID ${id}: ${q.question_en.substring(0, 60)}...`);
      } else {
        console.log(`❌ ID ${id}: NOT FOUND`);
      }
    }
  } catch (error) {
    console.error("\n❌ Error:", error);
    throw error;
  }
}

checkQuestions()
  .then(() => {
    console.log("\n✅ Check completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Check failed:", error);
    process.exit(1);
  });
