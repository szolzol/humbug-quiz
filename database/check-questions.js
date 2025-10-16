import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";

dotenv.config({ path: ".env.local" });

const connectionString =
  process.env.POSTGRES_POSTGRES_URL || process.env.POSTGRES_DATABASE_URL;
const sql = neon(connectionString);

async function checkQuestions() {
  console.log("📊 Checking questions in database...\n");

  // Get all questions
  const questions = await sql`
    SELECT id, question_en, 
           (SELECT COUNT(*) FROM answers WHERE question_id = questions.id) as answer_count
    FROM questions 
    ORDER BY id
  `;

  console.log(`Total questions: ${questions.length}\n`);

  questions.forEach((q, index) => {
    console.log(
      `${index + 1}. ID ${q.id}: ${q.question_en.substring(0, 60)}... (${
        q.answer_count
      } answers)`
    );
  });

  // Check for duplicates by text
  console.log("\n🔍 Checking for duplicate questions...\n");
  const duplicates = await sql`
    SELECT question_en, COUNT(*) as count
    FROM questions
    GROUP BY question_en
    HAVING COUNT(*) > 1
  `;

  if (duplicates.length > 0) {
    console.log(`⚠️  Found ${duplicates.length} duplicate questions:`);
    duplicates.forEach((d) => {
      console.log(
        `   - "${d.question_en.substring(0, 50)}..." (${d.count} times)`
      );
    });
  } else {
    console.log("✅ No duplicate questions found");
  }
}

checkQuestions().catch(console.error);
