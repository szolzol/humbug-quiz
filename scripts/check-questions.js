import { Pool } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.POSTGRES_POSTGRES_URL });

async function checkQuestions() {
  // Check table structure
  const cols = await pool.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name='questions' 
    ORDER BY ordinal_position
  `);
  console.log(
    "Questions table columns:",
    cols.rows.map((x) => x.column_name).join(", ")
  );

  // Check questions
  const questions = await pool.query(`
    SELECT id, question_en, question_hu, set_id 
    FROM questions 
    WHERE set_id = 1 
    ORDER BY id
  `);

  console.log("\nFree Pack questions:");
  questions.rows.forEach((q) => {
    console.log(`\n[${q.id}] ${q.question_en}`);
  });

  await pool.end();
}

checkQuestions();
