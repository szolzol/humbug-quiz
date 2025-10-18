import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

/**
 * This script will:
 * 1. Identify and keep ONLY unique questions (delete duplicates)
 * 2. Show which 18 questions should be in INT pack
 */

async function analyzeDuplicates() {
  console.log("🧹 Analyzing duplicate questions...\n");

  // Get all questions
  const allQuestions = await sql`
    SELECT id, question_en, set_id, category
    FROM questions 
    ORDER BY id
  `;

  console.log(`Total questions in database: ${allQuestions.length}\n`);

  // Group by question text to find duplicates
  const questionMap = new Map();

  allQuestions.forEach((q) => {
    if (!questionMap.has(q.question_en)) {
      questionMap.set(q.question_en, []);
    }
    questionMap.get(q.question_en).push(q);
  });

  // Identify duplicates - keep the FIRST occurrence (lowest ID)
  const toDelete = [];
  const toKeep = [];

  questionMap.forEach((questions, text) => {
    if (questions.length > 1) {
      // Sort by ID
      questions.sort((a, b) => a.id - b.id);

      // Keep first, delete rest
      toKeep.push(questions[0]);
      for (let i = 1; i < questions.length; i++) {
        toDelete.push(questions[i]);
      }

      console.log(
        `🔄 DUPLICATE (keeping ID ${questions[0].id}, deleting ${questions
          .slice(1)
          .map((q) => q.id)
          .join(", ")}):`
      );
      console.log(`   ${text.substring(0, 100)}...\n`);
    } else {
      toKeep.push(questions[0]);
    }
  });

  console.log(`\n📊 Cleanup Summary:`);
  console.log(`  Unique questions: ${toKeep.length}`);
  console.log(`  Duplicate questions to delete: ${toDelete.length}`);

  // Now identify which questions should go where
  const freeQuestionIds = [2, 6, 7, 8];
  const hunQuestionIds = [67, 69, 71, 76, 77, 81];

  // Calculate INT pack questions: all questions that are kept, minus FREE and HUN
  const keptIds = toKeep.map((q) => q.id);
  const intQuestionIds = keptIds.filter(
    (id) => !freeQuestionIds.includes(id) && !hunQuestionIds.includes(id)
  );

  console.log(`\n📈 Distribution after cleanup:`);
  console.log(
    `  FREE pack: ${
      freeQuestionIds.filter((id) => keptIds.includes(id)).length
    } questions`
  );
  console.log(
    `  HUN pack: ${
      hunQuestionIds.filter((id) => keptIds.includes(id)).length
    } questions`
  );
  console.log(`  INT pack: ${intQuestionIds.length} questions`);

  // Show INT pack questions
  console.log(`\n📋 INT pack questions (after removing duplicates):`);
  const intQuestions = toKeep.filter((q) => intQuestionIds.includes(q.id));
  intQuestions.forEach((q, index) => {
    console.log(
      `  ${index + 1}. ID ${q.id}: ${q.question_en.substring(0, 80)}... [${
        q.category
      }]`
    );
  });

  console.log(
    `\n💡 This gives us ${intQuestions.length} questions in INT pack.`
  );
  console.log(`   Target is 18 questions.`);

  if (intQuestions.length !== 18) {
    console.log(`\n⚠️  Mismatch! We have ${intQuestions.length} but need 18.`);
    console.log(
      `   ${
        intQuestions.length > 18 ? "Need to remove" : "Need to add"
      } ${Math.abs(intQuestions.length - 18)} questions.`
    );
  }
}

analyzeDuplicates()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
