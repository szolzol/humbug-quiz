import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

async function showPackDescriptions() {
  console.log("📊 Current question pack descriptions:\n");

  const packs = await sql`
    SELECT id, slug, name_en, name_hu, description_en, description_hu, question_count
    FROM question_sets
    ORDER BY id
  `;

  packs.forEach((pack) => {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📦 ${pack.slug} (${pack.question_count} questions)`);
    console.log(`${"=".repeat(60)}`);
    console.log(`\n🇬🇧 English:`);
    console.log(`   Name: ${pack.name_en}`);
    console.log(`   Description: ${pack.description_en || "(empty)"}`);
    console.log(`\n🇭🇺 Hungarian:`);
    console.log(`   Name: ${pack.name_hu}`);
    console.log(`   Description: ${pack.description_hu || "(empty)"}`);
  });

  console.log(`\n${"=".repeat(60)}\n`);
}

showPackDescriptions()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
