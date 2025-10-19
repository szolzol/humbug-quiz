/**
 * Admin Activity Log Migration
 * Creates the admin_activity_log table for audit trail
 */

import { createPool } from "@vercel/postgres";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const connectionString =
  process.env.POSTGRES_POSTGRES_URL || process.env.POSTGRES_DATABASE_URL;
const sql = createPool({ connectionString });

async function runMigration() {
  console.log("🚀 Running Activity Log Migration...\n");

  try {
    // Read migration file
    console.log("📄 Reading 003_admin_activity_log.sql...");
    const migrationPath = path.join(
      __dirname,
      "migrations",
      "003_admin_activity_log.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");
    console.log(`✅ Migration file loaded\n`);

    // Execute migration
    console.log("🔧 Creating admin_activity_log table...");
    await sql.query(migrationSQL);

    console.log("✅ Migration completed successfully!\n");

    // Verify table was created
    console.log("🔍 Verifying table structure...");
    const result = await sql.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'admin_activity_log'
      ORDER BY ordinal_position
    `);

    console.log("\n📊 Table structure:");
    console.table(result.rows);

    // Check indexes
    const indexes = await sql.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'admin_activity_log'
    `);

    console.log("\n🔑 Indexes created:");
    indexes.rows.forEach((idx) => {
      console.log(`  - ${idx.indexname}`);
    });

    console.log("\n✨ Admin activity log is ready to use!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

runMigration();
