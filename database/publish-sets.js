/**
 * Publish Question Sets Script
 *
 * Marks question sets as published so they appear in the API
 */

import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

async function publishQuestionSets() {
  console.log("📝 Publishing question sets...\n");

  try {
    // Update all question sets to be published
    const result = await sql`
      UPDATE question_sets 
      SET 
        is_published = true,
        published_at = NOW()
      WHERE is_published = false
      RETURNING slug, name_en
    `;

    console.log(`✅ Published ${result.length} question set(s):`);
    result.forEach((set) => {
      console.log(`   • ${set.name_en} (${set.slug})`);
    });

    // Show all active published sets
    console.log("\n📋 All active & published question sets:");
    const allSets = await sql`
      SELECT slug, name_en, is_published, is_active
      FROM question_sets
      ORDER BY created_at ASC
    `;

    allSets.forEach((set) => {
      const status = set.is_published && set.is_active ? "✅" : "❌";
      console.log(`   ${status} ${set.name_en} (${set.slug})`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

publishQuestionSets()
  .then(() => {
    console.log("\n✅ Done!");
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
