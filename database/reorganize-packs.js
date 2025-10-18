/**
 * Reorganize Question Packs
 *
 * This script:
 * 1. Renames us-starter-pack to international
 * 2. Ensures free pack questions are exclusive (not in HUN or INT)
 * 3. Assigns Hungarian-specific questions to HUN pack (ID: 1,3,5,10,11,15)
 * 4. Assigns remaining questions to INT pack
 */

import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

async function reorganizePacks() {
  try {
    console.log("🚀 Starting pack reorganization...\n");

    // Step 1: Check current state
    console.log("📊 Current pack distribution:");
    const currentPacks = await sql`
      SELECT 
        qs.slug,
        qs.name_en,
        COUNT(q.id) as question_count
      FROM question_sets qs
      LEFT JOIN questions q ON q.set_id = qs.id
      GROUP BY qs.id, qs.slug, qs.name_en
      ORDER BY qs.slug
    `;
    console.table(currentPacks);

    // Step 2: Get pack IDs (check both old and new names for international)
    const packs = await sql`
      SELECT id, slug FROM question_sets 
      WHERE slug IN ('free', 'hun-quiz-pack', 'international')
    `;
    const packMap = {};
    packs.forEach((p) => (packMap[p.slug] = p.id));
    console.log("\n📦 Pack IDs:", packMap);

    // Store international ID (might already be renamed)
    const internationalId =
      packMap["international"] || packMap["us-starter-pack"];
    if (!internationalId) {
      throw new Error("Could not find international or us-starter-pack!");
    }

    // Step 3: Rename us-starter-pack to international (if not already renamed)
    if (packMap["us-starter-pack"]) {
      console.log("\n🔄 Renaming us-starter-pack to international...");
      await sql`
        UPDATE question_sets 
        SET 
          slug = 'international',
          name_en = 'International Pack',
          name_hu = 'Nemzetközi csomag',
          description_en = 'International questions including US and general knowledge',
          description_hu = 'Nemzetközi kérdések beleértve az USA és általános tudást'
        WHERE slug = 'us-starter-pack'
      `;
      console.log("✅ Pack renamed");
    } else {
      console.log("\n✅ Pack already named 'international'");
    }

    // Update pack map
    packMap["international"] = internationalId;
    if (packMap["us-starter-pack"]) {
      delete packMap["us-starter-pack"];
    }

    // Step 4: Get free pack question IDs
    console.log("\n🔍 Getting free pack questions...");
    const freeQuestions = await sql`
      SELECT id, question_en
      FROM questions
      WHERE set_id = ${packMap["free"]}
      ORDER BY order_index
    `;
    console.log(`Found ${freeQuestions.length} questions in free pack:`);
    console.table(
      freeQuestions.map((q) => ({
        id: q.id,
        question: q.question_en.substring(0, 60) + "...",
      }))
    );

    const freeQuestionIds = freeQuestions.map((q) => q.id);

    // Step 5: Hungarian-specific question IDs (updated to actual IDs)
    const hunQuestionIds = [67, 69, 71, 76, 77, 81]; // 6 Hungarian-specific questions
    console.log("\n🇭🇺 Hungarian-specific questions:", hunQuestionIds);

    // Step 6: Move Hungarian questions to HUN pack
    console.log("\n🇭🇺 Moving Hungarian questions to HUN pack...");
    const movedToHun = await sql`
      UPDATE questions 
      SET set_id = ${packMap["hun-quiz-pack"]}
      WHERE id = ANY(${hunQuestionIds})
      RETURNING id, question_en
    `;
    console.log(`✅ Moved ${movedToHun.length} questions to HUN pack`);

    // Step 7: All remaining questions go to INT pack (except free pack questions)
    console.log("\n🌍 Moving remaining questions to INT pack...");
    const allQuestionIds = [...hunQuestionIds, ...freeQuestionIds];

    // Get all questions that should go to INT pack
    const allQuestions = await sql`SELECT id FROM questions`;
    const intQuestions = allQuestions.filter(
      (q) => !allQuestionIds.includes(q.id)
    );

    let movedCount = 0;
    for (const q of intQuestions) {
      await sql`UPDATE questions SET set_id = ${packMap["international"]} WHERE id = ${q.id}`;
      movedCount++;
    }
    console.log(`✅ Moved ${movedCount} questions to INT pack`);

    // Step 8: Update question counts
    console.log("\n🔢 Updating question counts...");
    await sql`
      UPDATE question_sets 
      SET question_count = (
        SELECT COUNT(*) 
        FROM questions 
        WHERE set_id = question_sets.id
      )
    `;
    console.log("✅ Question counts updated");

    // Step 9: Verify final state
    console.log("\n📊 Final pack distribution:");
    const finalPacks = await sql`
      SELECT 
        qs.slug,
        qs.name_en,
        qs.name_hu,
        COUNT(q.id) as question_count
      FROM question_sets qs
      LEFT JOIN questions q ON q.set_id = qs.id
      GROUP BY qs.id, qs.slug, qs.name_en, qs.name_hu
      ORDER BY qs.slug
    `;
    console.table(finalPacks);

    // Step 10: Check for duplicates (shouldn't be any with this schema)
    console.log("\n🔍 Checking question distribution...");
    const questionDistribution = await sql`
      SELECT 
        q.id,
        q.question_en,
        qs.slug as pack
      FROM questions q
      JOIN question_sets qs ON q.set_id = qs.id
      ORDER BY q.id
    `;
    console.log(`✅ Total questions: ${questionDistribution.length}`);

    // Step 11: Show detailed question distribution
    console.log("\n📋 Detailed question distribution:");
    for (const packSlug of ["free", "hun-quiz-pack", "international"]) {
      const questions = await sql`
        SELECT q.id, q.question_en
        FROM questions q
        JOIN question_sets qs ON q.set_id = qs.id
        WHERE qs.slug = ${packSlug}
        ORDER BY q.order_index
      `;
      console.log(`\n${packSlug} (${questions.length} questions):`);
      questions.forEach((q) => {
        console.log(`  - ID ${q.id}: ${q.question_en.substring(0, 70)}...`);
      });
    }

    console.log("\n✅ Pack reorganization completed successfully!");
  } catch (error) {
    console.error("❌ Error during pack reorganization:", error);
    throw error;
  }
}

reorganizePacks();
