import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

async function showOriginalQuestions() {
  console.log("🔍 Original questions (ID 1-45):\n");

  const questions = await sql`
    SELECT id, 
           SUBSTRING(question_en, 1, 100) as question_preview,
           set_id,
           category
    FROM questions 
    WHERE id <= 45
    ORDER BY id
  `;

  // Categorize by what they contain
  const usSpecific = [];
  const hunSpecific = [];
  const general = [];

  questions.forEach((q) => {
    const text = q.question_preview.toLowerCase();

    if (
      text.includes("united states") ||
      text.includes("american") ||
      text.includes("usa") ||
      text.includes("thanksgiving") ||
      text.includes("emmy") ||
      text.includes("us ")
    ) {
      usSpecific.push(q);
    } else if (
      text.includes("hungary") ||
      text.includes("hungarian") ||
      text.includes("magyar")
    ) {
      hunSpecific.push(q);
    } else {
      general.push(q);
    }
  });

  console.log("🇺🇸 US-specific questions (should be in INT):");
  usSpecific.forEach((q) => {
    console.log(
      `  ID ${q.id} [set_id: ${q.set_id}]: ${q.question_preview}... [${q.category}]`
    );
  });

  console.log(`\n🇭🇺 Hungarian-specific questions (should be in HUN):`);
  hunSpecific.forEach((q) => {
    console.log(
      `  ID ${q.id} [set_id: ${q.set_id}]: ${q.question_preview}... [${q.category}]`
    );
  });

  console.log(`\n🌍 General/neutral questions:`);
  general.forEach((q) => {
    console.log(
      `  ID ${q.id} [set_id: ${q.set_id}]: ${q.question_preview}... [${q.category}]`
    );
  });

  console.log(`\n📈 Summary for IDs 1-45:`);
  console.log(`  US-specific: ${usSpecific.length} questions`);
  console.log(`  Hungarian-specific: ${hunSpecific.length} questions`);
  console.log(`  General/neutral: ${general.length} questions`);
  console.log(`  Total: ${questions.length} questions`);

  console.log(`\n💡 For 18 questions in INT pack:`);
  console.log(`  - ${usSpecific.length} US-specific`);
  console.log(`  - Plus ${18 - usSpecific.length} from general pool`);
  console.log(`  = 18 total INT questions`);
}

showOriginalQuestions()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
