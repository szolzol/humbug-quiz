import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

async function checkOriginalUSPack() {
  console.log("🔍 Checking what questions should be in INT pack...\n");

  // Get all questions currently in INT pack
  const intQuestions = await sql`
    SELECT id, 
           SUBSTRING(question_en, 1, 80) as question_preview,
           category
    FROM questions 
    WHERE set_id = 2
    ORDER BY id
  `;

  console.log(`📊 INT pack currently has ${intQuestions.length} questions:\n`);
  intQuestions.forEach((q) => {
    console.log(`  ID ${q.id}: ${q.question_preview}... [${q.category}]`);
  });

  // Get free pack questions
  const freeQuestions = await sql`
    SELECT id, SUBSTRING(question_en, 1, 80) as question_preview
    FROM questions 
    WHERE set_id = 1
    ORDER BY id
  `;

  console.log(
    `\n📊 FREE pack has ${freeQuestions.length} questions (these should NOT be in INT):\n`
  );
  freeQuestions.forEach((q) => {
    console.log(`  ID ${q.id}: ${q.question_preview}...`);
  });

  // Get HUN pack questions
  const hunQuestions = await sql`
    SELECT id, SUBSTRING(question_en, 1, 80) as question_preview
    FROM questions 
    WHERE set_id = 3
    ORDER BY id
  `;

  console.log(`\n📊 HUN pack has ${hunQuestions.length} questions:\n`);
  hunQuestions.forEach((q) => {
    console.log(`  ID ${q.id}: ${q.question_preview}...`);
  });

  // Calculate what INT should have
  const totalQuestions = await sql`SELECT COUNT(*) as count FROM questions`;
  const total = totalQuestions[0].count;

  console.log(`\n📈 Summary:`);
  console.log(`  Total questions: ${total}`);
  console.log(`  FREE: ${freeQuestions.length} questions`);
  console.log(`  HUN: ${hunQuestions.length} questions`);
  console.log(`  INT: ${intQuestions.length} questions`);
  console.log(`  Expected INT (if 18 target): 18 questions`);
  console.log(
    `  Current calculation: ${total} - ${freeQuestions.length} - ${
      hunQuestions.length
    } = ${total - freeQuestions.length - hunQuestions.length}`
  );
}

checkOriginalUSPack()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
