import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
const sql = neon(process.env.POSTGRES_POSTGRES_URL);

console.log("🔍 Finding Hungarian-specific questions...\n");

const hunQuestions = await sql`
  SELECT id, question_en, question_hu 
  FROM questions 
  WHERE question_en LIKE '%Hungary%' 
     OR question_en LIKE '%Hungarian%'
     OR question_hu LIKE '%Magyar%'
     OR question_hu LIKE '%magyarországi%'
  ORDER BY id
`;

console.log(`Found ${hunQuestions.length} Hungarian-specific questions:\n`);
console.table(
  hunQuestions.map((q) => ({
    id: q.id,
    en: q.question_en.substring(0, 70) + "...",
    hu: q.question_hu.substring(0, 70) + "...",
  }))
);

console.log(
  "\n✅ These IDs should go to HUN pack:",
  hunQuestions.map((q) => q.id)
);
