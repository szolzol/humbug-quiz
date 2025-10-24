require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

async function verify() {
  const pack = await sql`
    SELECT 
      qs.id,
      qs.slug,
      qs.name_en,
      qs.name_hu,
      qs.access_level,
      qs.pack_type,
      qs.question_count,
      qs.is_active,
      qs.is_published
    FROM question_sets qs
    WHERE qs.id = 4
  `;

  console.log("🎃 Horror Tagen Special Set:");
  console.log(JSON.stringify(pack[0], null, 2));

  const questions = await sql`
    SELECT q.id, q.question_en, q.category, q.difficulty
    FROM questions q
    WHERE q.set_id = 4
  `;

  console.log("\n📝 Questions:");
  questions.forEach((q) => {
    console.log(`  ${q.id}. ${q.question_en} (${q.category}, ${q.difficulty})`);
  });

  const answers = await sql`
    SELECT a.id, a.answer_en, a.order_index
    FROM answers a
    INNER JOIN questions q ON a.question_id = q.id
    WHERE q.set_id = 4
    ORDER BY a.order_index
  `;

  console.log(`\n✅ Answers (${answers.length}):`);
  answers.forEach((a) => {
    console.log(`  ${a.order_index}. ${a.answer_en}`);
  });
}

verify();
