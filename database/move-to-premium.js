/**
 * Move questions from Free pack to Premium pack
 *
 * Keeps only questions 2, 6, 7, 8 in the 'original' (free) pack.
 * Moves all other questions to 'us-starter-pack' (premium).
 *
 * Usage: node database/move-to-premium.js
 */

import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

const FREE_QUESTION_IDS = [2, 6, 7, 8]; // Questions to keep in free pack

async function moveQuestions() {
  console.log("🔄 Moving questions from free to premium pack...\n");

  try {
    // Get pack IDs
    const packs = await sql`
      SELECT id, slug, name_en, question_count
      FROM question_sets
      WHERE slug IN ('original', 'us-starter-pack')
      ORDER BY slug
    `;

    const originalPack = packs.find((p) => p.slug === "original");
    const usPack = packs.find((p) => p.slug === "us-starter-pack");

    if (!originalPack || !usPack) {
      throw new Error("Required packs not found");
    }

    console.log(
      `📦 Source (Free): ${originalPack.name_en} (ID: ${originalPack.id})`
    );
    console.log(`📦 Target (Premium): ${usPack.name_en} (ID: ${usPack.id})\n`);

    // Get all questions in original pack
    const allQuestions = await sql`
      SELECT id, question_en, category
      FROM questions
      WHERE set_id = ${originalPack.id}
      ORDER BY id
    `;

    console.log(`Found ${allQuestions.length} questions in free pack\n`);

    // Identify questions to move
    const questionsToMove = allQuestions.filter(
      (q) => !FREE_QUESTION_IDS.includes(q.id)
    );
    const questionsToKeep = allQuestions.filter((q) =>
      FREE_QUESTION_IDS.includes(q.id)
    );

    console.log(
      `✅ Keeping ${
        questionsToKeep.length
      } questions in free pack (IDs: ${FREE_QUESTION_IDS.join(", ")})`
    );
    console.log(
      `🚚 Moving ${questionsToMove.length} questions to premium pack\n`
    );

    if (questionsToMove.length === 0) {
      console.log("✅ No questions to move. Already configured correctly.");
      return;
    }

    // Show questions being kept
    console.log("📌 Questions staying in FREE pack:\n");
    questionsToKeep.forEach((q) => {
      console.log(`   ${q.id}. ${q.question_en.substring(0, 70)}...`);
    });

    // Move questions
    console.log(`\n🔄 Moving ${questionsToMove.length} questions...\n`);

    const movedIds = questionsToMove.map((q) => q.id);

    const result = await sql`
      UPDATE questions
      SET set_id = ${usPack.id},
          updated_at = NOW()
      WHERE id = ANY(${movedIds})
      RETURNING id
    `;

    console.log(`✅ Successfully moved ${result.length} questions\n`);

    // Get answer counts for the moved questions
    const answerCounts = await sql`
      SELECT question_id, COUNT(*) as answer_count
      FROM answers
      WHERE question_id = ANY(${movedIds})
      GROUP BY question_id
    `;

    const totalAnswers = answerCounts.reduce(
      (sum, row) => sum + parseInt(row.answer_count),
      0
    );
    console.log(`📝 Moved ${totalAnswers} answers along with the questions\n`);

    // Update question counts manually (triggers may not exist)
    await sql`
      UPDATE question_sets
      SET question_count = (
        SELECT COUNT(*) FROM questions WHERE set_id = question_sets.id
      ),
      updated_at = NOW()
      WHERE id IN (${originalPack.id}, ${usPack.id})
    `;

    // Verify final state
    console.log("📊 Final verification:\n");

    const finalPacks = await sql`
      SELECT 
        id, 
        slug, 
        name_en, 
        name_hu,
        access_level,
        (SELECT COUNT(*) FROM questions WHERE set_id = question_sets.id) as actual_count
      FROM question_sets
      WHERE slug IN ('original', 'us-starter-pack', 'hun-starter-pack')
      ORDER BY display_order
    `;

    console.log(
      "┌─────────────────────┬──────────────────────┬──────────────────────┬─────────┬───────────┐"
    );
    console.log(
      "│ Slug                │ Name (EN)            │ Name (HU)            │ Access  │ Questions │"
    );
    console.log(
      "├─────────────────────┼──────────────────────┼──────────────────────┼─────────┼───────────┤"
    );

    finalPacks.forEach((pack) => {
      console.log(
        `│ ${pack.slug.padEnd(19)} │ ${pack.name_en.padEnd(
          20
        )} │ ${pack.name_hu.padEnd(20)} │ ${pack.access_level.padEnd(
          7
        )} │ ${String(pack.actual_count).padStart(9)} │`
      );
    });

    console.log(
      "└─────────────────────┴──────────────────────┴──────────────────────┴─────────┴───────────┘"
    );

    // Show free pack questions
    const freeQuestions = await sql`
      SELECT id, question_en
      FROM questions
      WHERE set_id = ${originalPack.id}
      ORDER BY id
    `;

    console.log(
      `\n✅ Free pack now contains ${freeQuestions.length} questions:\n`
    );
    freeQuestions.forEach((q) => {
      console.log(`   ${q.id}. ${q.question_en.substring(0, 70)}...`);
    });

    console.log("\n✅ Migration completed successfully!\n");
    console.log("Summary:");
    console.log(
      `  • Free pack: ${freeQuestions.length} questions (IDs: ${freeQuestions
        .map((q) => q.id)
        .join(", ")})`
    );
    console.log(
      `  • Premium packs: Remaining questions moved to US Starter Pack`
    );
    console.log(
      "  • Unauthenticated users will see only 4 free questions + signin CTA"
    );
  } catch (error) {
    console.error("\n❌ Error:", error);
    throw error;
  }
}

moveQuestions()
  .then(() => {
    console.log("\n✨ Migration completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Migration failed:", error);
    process.exit(1);
  });
