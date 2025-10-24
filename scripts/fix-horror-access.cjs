require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

async function fixAccessLevel() {
  await sql`
    UPDATE question_sets
    SET access_level = 'premium'
    WHERE slug = 'horror-tagen-special'
  `;

  const result = await sql`
    SELECT id, slug, name_en, access_level
    FROM question_sets
    WHERE slug = 'horror-tagen-special'
  `;

  console.log("✅ Fixed access level:");
  console.log(result[0]);
}

fixAccessLevel();
