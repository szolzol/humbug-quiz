import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

async function checkFirstQuestion() {
  try {
    console.log("🔍 Checking first question in US Starter Pack...\n");

    // Get the US Starter Pack question set
    const questionSets = await sql`
      SELECT id, slug, name_en 
      FROM question_sets 
      WHERE slug = 'us-starter-pack'
    `;

    if (questionSets.length === 0) {
      console.log("❌ US Starter Pack not found!");
      return;
    }

    const questionSetId = questionSets[0].id;
    console.log("✅ Question Set:", questionSets[0].name_en);
    console.log("   ID:", questionSetId);
    console.log("   Slug:", questionSets[0].slug);
    console.log("");

    // Get first question with its order
    const questions = await sql`
      SELECT 
        id,
        question_en,
        question_hu,
        category,
        order_index
      FROM questions
      WHERE set_id = ${questionSetId}
      ORDER BY order_index
      LIMIT 1
    `;

    if (questions.length === 0) {
      console.log("❌ No questions found in US Starter Pack!");
      return;
    }

    const firstQuestion = questions[0];
    console.log("📝 First Question:");
    console.log("   ID:", firstQuestion.id);
    console.log("   Order:", firstQuestion.order_index);
    console.log("   Category:", firstQuestion.category);
    console.log("   EN:", firstQuestion.question_en);
    console.log("   HU:", firstQuestion.question_hu);
    console.log("");

    // Get answers for this question
    const answers = await sql`
      SELECT 
        id,
        answer_en,
        answer_hu
      FROM answers
      WHERE question_id = ${firstQuestion.id}
      ORDER BY id
    `;

    console.log(`🎯 Answers (${answers.length} total):`);
    if (answers.length === 0) {
      console.log("   ❌ NO ANSWERS FOUND!");
    } else {
      answers.forEach((answer, idx) => {
        console.log(`   ${idx + 1}. EN: ${answer.answer_en}`);
        console.log(`      HU: ${answer.answer_hu}`);
      });
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

checkFirstQuestion();
