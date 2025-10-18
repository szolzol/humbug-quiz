import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
const sql = neon(process.env.POSTGRES_POSTGRES_URL);

const hunIds = [1, 3, 5, 10, 11, 15];
const questions =
  await sql`SELECT id, question_en, question_hu, set_id FROM questions WHERE id = ANY(${hunIds}) ORDER BY id`;

console.log("\n🇭🇺 Hungarian question IDs check:");
console.table(
  questions.map((q) => ({
    id: q.id,
    en: q.question_en.substring(0, 50) + "...",
    hu: q.question_hu.substring(0, 50) + "...",
    set_id: q.set_id,
  }))
);

if (questions.length === 0) {
  console.log("\n❌ None of the specified IDs exist!");
  console.log("Let's find Hungarian-specific questions...\n");

  const allQuestions =
    await sql`SELECT id, question_en, question_hu FROM questions ORDER BY id LIMIT 30`;
  console.table(
    allQuestions.map((q) => ({
      id: q.id,
      en: q.question_en.substring(0, 40),
      hu: q.question_hu.substring(0, 40),
    }))
  );
}
