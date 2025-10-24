// Apply skin column migration to question_sets table
const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_DATABASE_URL || process.env.DATABASE_URL);

async function applyMigration() {
  try {
    console.log("Applying migration: 005_add_skin_column...");

    // Add skin column
    await sql`
      ALTER TABLE question_sets
      ADD COLUMN IF NOT EXISTS skin VARCHAR(20) DEFAULT 'standard' NOT NULL
    `;
    console.log("✓ Added skin column");

    // Update Horror pack
    await sql`
      UPDATE question_sets
      SET skin = 'premium'
      WHERE slug = 'horror-tagen-special'
    `;
    console.log("✓ Updated Horror pack to premium skin");

    // Verify migration
    const result = await sql`
      SELECT slug, name_en, skin
      FROM question_sets
      ORDER BY display_order ASC
    `;

    console.log("\n✓ Migration complete! Current packs:");
    console.table(result);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

applyMigration();
