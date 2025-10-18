import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

async function verifyChanges() {
  console.log("🔍 Verifying database changes...\n");

  // Check question_sets
  console.log("📊 Question Sets:");
  const sets = await sql`
    SELECT id, slug, name_en, name_hu, question_count
    FROM question_sets
    ORDER BY id
  `;

  sets.forEach((set) => {
    console.log(`  ${set.id}. ${set.slug}`);
    console.log(`     EN: ${set.name_en}`);
    console.log(`     HU: ${set.name_hu}`);
    console.log(`     Questions: ${set.question_count}`);
    console.log("");
  });

  // Check total questions
  const total = await sql`SELECT COUNT(*) as count FROM questions`;
  console.log(`✅ Total questions: ${total[0].count}`);

  // Verify no "starter" references
  const starterRefs = await sql`
    SELECT slug, name_en, name_hu
    FROM question_sets
    WHERE slug LIKE '%starter%' 
       OR name_en LIKE '%starter%' 
       OR name_hu LIKE '%kezdő%'
  `;

  if (starterRefs.length > 0) {
    console.log('\n⚠️  Found "starter" references:');
    starterRefs.forEach((ref) => {
      console.log(`  - ${ref.slug}: ${ref.name_en} / ${ref.name_hu}`);
    });
  } else {
    console.log('\n✅ No "starter" or "kezdő" references found in database!');
  }
}

verifyChanges()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
