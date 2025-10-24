require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

async function checkPacks() {
  const packs = await sql`
    SELECT 
      id,
      slug,
      name_en,
      access_level,
      is_active,
      is_published,
      question_count
    FROM question_sets
    ORDER BY id
  `;

  console.log("📦 All question sets in database:\n");
  packs.forEach((pack) => {
    console.log(`${pack.id}. ${pack.slug}`);
    console.log(`   Name: ${pack.name_en}`);
    console.log(
      `   Access: ${pack.access_level} | Active: ${pack.is_active} | Published: ${pack.is_published}`
    );
    console.log(`   Questions: ${pack.question_count}\n`);
  });

  console.log(`Total packs: ${packs.length}`);

  const visible = packs.filter((p) => p.is_active && p.is_published);
  console.log(`Visible (active + published): ${visible.length}`);

  const free = visible.filter((p) => p.access_level === "free");
  console.log(`Free packs: ${free.length}`);

  const premium = visible.filter((p) => p.access_level === "premium");
  console.log(`Premium packs: ${premium.length}`);
}

checkPacks();
