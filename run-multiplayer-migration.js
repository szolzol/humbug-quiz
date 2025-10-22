/**
 * Multiplayer MVP Migration Runner
 * Executes the 007_multiplayer_mvp.sql migration on Neon PostgreSQL
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
  console.log("🚀 Starting multiplayer MVP migration...\n");

  // Check for database URL
  const databaseUrl =
    process.env.DATABASE_URL || process.env.POSTGRES_POSTGRES_URL;
  if (!databaseUrl) {
    console.error("❌ Error: DATABASE_URL not found in .env.local");
    process.exit(1);
  }

  console.log("📦 Connected to database");

  // Read migration file
  const migrationPath = join(
    __dirname,
    "migrations",
    "007_multiplayer_mvp.sql"
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
    console.log("⏳ Executing migration...\n");
    await pool.query(migrationSQL);
    console.log("✅ Migration completed successfully!");
    console.log("\nCreated tables:");
    console.log("  - game_rooms (with 6-char codes)");
    console.log("  - room_players (session-based)");
    console.log("  - game_sessions (active game state)");
    console.log("  - player_answers (answer tracking)");
    console.log("\nCreated indexes for:");
    console.log("  - Room code lookup");
    console.log("  - Expiration cleanup");
    console.log("  - Session tracking");
    console.log("\nCreated helper functions:");
    console.log("  - generate_room_code()");
    console.log("  - cleanup_expired_rooms()");
    console.log("  - Triggers for activity tracking");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
