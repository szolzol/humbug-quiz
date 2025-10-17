/**
 * Remove the 18 questions that were moved from original pack to US Starter Pack
 * This will restore US pack to its original 22 questions
 * 
 * Usage: node database/remove-moved-questions.js
 */

import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

// The 18 question IDs that were moved from original pack (excluding 2, 6, 7, 8)
const MOVED_QUESTION_IDS = [1, 3, 4, 5, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

async function removeMovedQuestions() {
  console.log("🗑️  Removing moved questions from US Starter Pack...\n");

  try {
    // Get US pack
    const packResult = await sql`
      SELECT id, slug, name_en
      FROM question_sets
      WHERE slug = 'us-starter-pack'
    `;

    if (packResult.length === 0) {
      throw new Error('US Starter Pack not found');
    }

    const pack = packResult[0];
    console.log(`Pack: ${pack.name_en} (ID: ${pack.id})\n`);

    // Check current state
    const currentQuestions = await sql`
      SELECT COUNT(*) as count
      FROM questions
      WHERE set_id = ${pack.id}
    `;
    console.log(`Current question count: ${currentQuestions[0].count}`);

    // Check how many of the moved questions are in US pack
    const movedInPack = await sql`
      SELECT id, question_en
      FROM questions
      WHERE set_id = ${pack.id}
        AND id = ANY(${MOVED_QUESTION_IDS})
      ORDER BY id
    `;

    console.log(`Questions to remove: ${movedInPack.length}\n`);

    if (movedInPack.length === 0) {
      console.log('✅ No moved questions found in US pack. Already cleaned up.');
      return;
    }

    console.log('📋 Questions being removed:\n');
    movedInPack.forEach(q => {
      console.log(`   ${q.id}. ${q.question_en.substring(0, 70)}...`);
    });

    // Get answer counts before deletion
    const answerCounts = await sql`
      SELECT COUNT(*) as count
      FROM answers
      WHERE question_id = ANY(${MOVED_QUESTION_IDS})
    `;
    const answerCount = answerCounts[0].count;

    console.log(`\n🔄 Deleting ${movedInPack.length} questions and ${answerCount} answers...`);

    // Delete answers first (CASCADE should handle this, but being explicit)
    const deletedAnswers = await sql`
      DELETE FROM answers
      WHERE question_id = ANY(${MOVED_QUESTION_IDS})
      RETURNING id
    `;

    console.log(`✅ Deleted ${deletedAnswers.length} answers`);

    // Delete questions
    const deletedQuestions = await sql`
      DELETE FROM questions
      WHERE id = ANY(${MOVED_QUESTION_IDS})
      RETURNING id
    `;

    console.log(`✅ Deleted ${deletedQuestions.length} questions`);

    // Update question count
    await sql`
      UPDATE question_sets
      SET question_count = (
        SELECT COUNT(*) FROM questions WHERE set_id = question_sets.id
      ),
      updated_at = NOW()
      WHERE id = ${pack.id}
    `;

    // Verify final state
    console.log('\n📊 Final verification:\n');
    
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

    console.log('┌─────────────────────┬──────────────────────┬──────────────────────┬─────────┬───────────┐');
    console.log('│ Slug                │ Name (EN)            │ Name (HU)            │ Access  │ Questions │');
    console.log('├─────────────────────┼──────────────────────┼──────────────────────┼─────────┼───────────┤');
    
    finalPacks.forEach(pack => {
      console.log(
        `│ ${pack.slug.padEnd(19)} │ ${pack.name_en.padEnd(20)} │ ${pack.name_hu.padEnd(20)} │ ${pack.access_level.padEnd(7)} │ ${String(pack.actual_count).padStart(9)} │`
      );
    });
    
    console.log('└─────────────────────┴──────────────────────┴──────────────────────┴─────────┴───────────┘');

    // Show remaining US pack questions
    const remainingQuestions = await sql`
      SELECT id, question_en
      FROM questions
      WHERE set_id = ${pack.id}
      ORDER BY id
    `;

    console.log(`\n✅ US Starter Pack now contains ${remainingQuestions.length} questions`);
    console.log(`   Question IDs: ${remainingQuestions.map(q => q.id).join(', ')}`);

    console.log('\n✅ Cleanup completed successfully!\n');
    console.log('Summary:');
    console.log(`  • Removed ${deletedQuestions.length} questions from US pack`);
    console.log(`  • Removed ${deletedAnswers.length} associated answers`);
    console.log(`  • US Starter Pack now has ${remainingQuestions.length} questions (original set)`);
    console.log(`  • Free pack still has 4 questions (IDs: 2, 6, 7, 8)`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  }
}

removeMovedQuestions()
  .then(() => {
    console.log('\n✨ Cleanup completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Cleanup failed:', error);
    process.exit(1);
  });
