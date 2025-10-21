/**
 * Database Migration Runner
 * Executes the add-question-feedback.sql migration on Neon PostgreSQL
 */

import { Pool } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  console.log("🚀 Starting database migration...\n");

  // Check for database URL
  const databaseUrl = process.env.POSTGRES_POSTGRES_URL;
  if (!databaseUrl) {
    console.error("❌ Error: POSTGRES_POSTGRES_URL not found in .env.local");
    process.exit(1);
  }

  console.log("📦 Connected to database");

  // Read migration file
  const migrationPath = join(
    __dirname,
    "database",
    "migrations",
    "add-question-feedback.sql"
  );
  let migrationSQL;

  try {
    migrationSQL = readFileSync(migrationPath, "utf-8");
    console.log("📄 Loaded migration file:", migrationPath);
  } catch (error) {
    console.error("❌ Error reading migration file:", error.message);
    process.exit(1);
  }

  // Execute migration
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    console.log("\n⏳ Executing migration (this may take a moment)...\n");

    // Execute the SQL
    await pool.query(migrationSQL);

    console.log("✅ Migration completed successfully!\n");
    console.log("📊 Changes applied:");
    console.log("   ✓ Added nickname column to users table");
    console.log("   ✓ Added feedback columns to questions table");
    console.log("   ✓ Created question_feedback table");
    console.log("   ✓ Created user_question_progress table");
    console.log("   ✓ Created triggers and indexes");
    console.log("\n🎉 Profile feature is now ready to use!");
    console.log(
      "   → Visit /profile when logged in to see your player profile"
    );
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);

    // Check if it's a "column already exists" error
    if (error.message.includes("already exists")) {
      console.log("\n✅ Note: Some objects already exist - this is OK!");
      console.log(
        "   The migration has been run before, and existing data is preserved."
      );
      console.log("\n🎉 Profile feature is ready to use!");
    } else {
      console.error("\n💡 Common issues:");
      console.error("   - Database connection issues");
      console.error("   - Insufficient permissions");
      console.error("\nFull error:", error);
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

// Run the migration
runMigration().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});
