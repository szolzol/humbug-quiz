require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

async function checkTranslations() {
  const questions = await sql`
    SELECT id, question_en, question_hu
    FROM questions
    WHERE set_id = 4
    ORDER BY order_index
    LIMIT 3
  `;

  console.log("🔍 Checking first 3 questions:\n");

  questions.forEach((q, i) => {
    console.log(`Question ${i + 1}:`);
    console.log(`  EN: ${q.question_en}`);
    console.log(`  HU: ${q.question_hu}`);
    console.log();
  });
}

checkTranslations();
