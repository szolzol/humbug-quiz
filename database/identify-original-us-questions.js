import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

async function identifyOriginalUSQuestions() {
  console.log("🔍 Identifying original US pack questions...\n");

  // Get all questions with their content
  const allQuestions = await sql`
    SELECT id, 
           question_en,
           question_hu,
           set_id,
           category
    FROM questions 
    ORDER BY id
  `;

  // Group by English question text to find duplicates
  const questionGroups = {};

  allQuestions.forEach((q) => {
    if (!questionGroups[q.question_en]) {
      questionGroups[q.question_en] = [];
    }
    questionGroups[q.question_en].push(q);
  });

  console.log("📊 Question groups (by English text):\n");

  const usSpecificKeywords = [
    "United States",
    "American",
    "USA",
    "US",
    "America",
    "Thanksgiving",
    "Super Bowl",
    "NFL",
    "NBA",
    "MLB",
    "Hollywood",
    "Emmy",
    "Oscar",
  ];

  const duplicateGroups = [];
  const uniqueQuestions = [];

  Object.entries(questionGroups).forEach(([text, questions]) => {
    if (questions.length > 1) {
      duplicateGroups.push(questions);
      console.log(`🔄 DUPLICATE (${questions.length} copies):`);
      console.log(`   Text: ${text.substring(0, 100)}...`);
      questions.forEach((q) => {
        console.log(`   - ID ${q.id} [set_id: ${q.set_id}] [${q.category}]`);
      });
      console.log("");
    } else {
      uniqueQuestions.push(questions[0]);
    }
  });

  // Identify US-specific questions
  console.log("\n🇺🇸 US-specific questions (should be in INT pack):\n");
  const usQuestions = uniqueQuestions.filter((q) => {
    return usSpecificKeywords.some(
      (keyword) =>
        q.question_en.includes(keyword) || q.question_hu.includes(keyword)
    );
  });

  usQuestions.forEach((q) => {
    console.log(
      `  ID ${q.id}: ${q.question_en.substring(0, 80)}... [${
        q.category
      }] [set_id: ${q.set_id}]`
    );
  });

  console.log(`\n📈 Summary:`);
  console.log(
    `  Total unique questions: ${Object.keys(questionGroups).length}`
  );
  console.log(`  Duplicate groups: ${duplicateGroups.length}`);
  console.log(`  US-specific questions: ${usQuestions.length}`);
  console.log(
    `  Expected INT pack size: ${usQuestions.length} (US-specific only)`
  );
  console.log(
    `\n💡 Suggestion: Keep the LOWEST IDs from duplicate groups + all US-specific questions`
  );
}

identifyOriginalUSQuestions()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
