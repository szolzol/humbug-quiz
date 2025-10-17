/**
 * Check all question packs and their question counts
 * 
 * Usage: node database/check-all-packs.js
 */

import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

async function checkAllPacks() {
  console.log("🔍 Checking all question packs...\n");

  try {
    // Get all packs
    const packs = await sql`
      SELECT 
        id, 
        slug, 
        name_en, 
        name_hu,
        access_level,
        is_published,
        question_count
      FROM question_sets
      ORDER BY display_order, id
    `;

    console.log('┌─────────────────────┬──────────────────────┬──────────────────────┬─────────┬──────────┬───────────┐');
    console.log('│ Slug                │ Name (EN)            │ Name (HU)            │ Access  │ Published│ Questions │');
    console.log('├─────────────────────┼──────────────────────┼──────────────────────┼─────────┼──────────┼───────────┤');
    
    for (const pack of packs) {
      // Get actual count from database
      const countResult = await sql`
        SELECT COUNT(*) as actual_count
        FROM questions
        WHERE set_id = ${pack.id}
      `;
      const actualCount = parseInt(countResult[0].actual_count);
      
      console.log(
        `│ ${pack.slug.padEnd(19)} │ ${pack.name_en.padEnd(20)} │ ${pack.name_hu.padEnd(20)} │ ${pack.access_level.padEnd(7)} │ ${(pack.is_published ? 'Yes' : 'No').padEnd(8)} │ ${String(actualCount).padStart(9)} │`
      );
    }
    
    console.log('└─────────────────────┴──────────────────────┴──────────────────────┴─────────┴──────────┴───────────┘');

    // Show detailed breakdown for each pack
    console.log('\n📊 Detailed Breakdown:\n');

    for (const pack of packs) {
      const questions = await sql`
        SELECT 
          id,
          question_en,
          category,
          (SELECT COUNT(*) FROM answers WHERE question_id = questions.id) as answer_count
        FROM questions
        WHERE set_id = ${pack.id}
        ORDER BY id
      `;

      const totalAnswers = questions.reduce((sum, q) => sum + parseInt(q.answer_count), 0);

      console.log(`\n${pack.name_en} (${pack.slug}):`);
      console.log(`  Access: ${pack.access_level}`);
      console.log(`  Questions: ${questions.length}`);
      console.log(`  Total Answers: ${totalAnswers}`);
      console.log(`  Question IDs: ${questions.map(q => q.id).join(', ')}`);
      
      if (questions.length > 0 && questions.length <= 10) {
        console.log('  Questions:');
        questions.forEach(q => {
          console.log(`    ${q.id}. ${q.question_en.substring(0, 70)}... (${q.answer_count} answers)`);
        });
      }
    }

    // Summary
    const totalQuestions = await sql`SELECT COUNT(*) as total FROM questions`;
    const totalAnswers = await sql`SELECT COUNT(*) as total FROM answers`;
    
    console.log('\n📈 Overall Summary:');
    console.log(`  Total question packs: ${packs.length}`);
    console.log(`  Total questions: ${totalQuestions[0].total}`);
    console.log(`  Total answers: ${totalAnswers[0].total}`);
    console.log(`  Free questions: ${packs.find(p => p.access_level === 'free')?.question_count || 0}`);
    
    const premiumPacks = packs.filter(p => p.access_level === 'premium');
    const premiumQuestionCount = premiumPacks.reduce((sum, p) => sum + parseInt(p.question_count || 0), 0);
    console.log(`  Premium questions: ${premiumQuestionCount} (across ${premiumPacks.length} packs)`);

  } catch (error) {
    console.error("\n❌ Error:", error);
    throw error;
  }
}

checkAllPacks()
  .then(() => {
    console.log('\n✅ Check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Check failed:', error);
    process.exit(1);
  });
