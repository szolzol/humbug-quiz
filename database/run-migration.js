#!/usr/bin/env node
/**
 * Database Migration Runner
 *
 * Usage: node run-migration.js <migration-file>
 * Example: node run-migration.js add-question-feedback.sql
 */

import { config } from "dotenv";
import { Pool } from "@neondatabase/serverless";
import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, "..", ".env.local") });

async function runMigration(migrationFile) {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_POSTGRES_URL,
  });

  try {
    console.log(`\n📦 Running migration: ${migrationFile}`);
    console.log("━".repeat(60));

    // Read the migration SQL file
    const sqlPath = join(__dirname, "migrations", migrationFile);
    const sql = await readFile(sqlPath, "utf-8");

    // Execute the migration
    await pool.query(sql);

    console.log("✅ Migration completed successfully!\n");
  } catch (error) {
    console.error("❌ Migration failed:");
    console.error(error.message);
    console.error("\nStack trace:");
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Get migration file from command line
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error("❌ Error: Please specify a migration file");
  console.error("Usage: node run-migration.js <migration-file>");
  console.error("Example: node run-migration.js add-question-feedback.sql");
  process.exit(1);
}

runMigration(migrationFile);
