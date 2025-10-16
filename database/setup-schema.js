/**
 * Database Schema Setup Script
 * Executes the schema.sql file to create all tables
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

// Use the correct environment variable name
const connectionString =
  process.env.POSTGRES_POSTGRES_URL || process.env.POSTGRES_DATABASE_URL;
const sql = createPool({ connectionString });

async function setupSchema() {
  console.log("🚀 Starting Database Schema Setup...\n");

  try {
    // Read schema file
    console.log("📄 Reading schema.sql...");
    const schemaPath = path.join(__dirname, "schema.sql");
    const schemaSQL = fs.readFileSync(schemaPath, "utf-8");
    console.log(
      `✅ Schema file loaded (${Math.round(schemaSQL.length / 1024)}KB)\n`
    );

    // Split into individual statements (separated by semicolons outside of functions)
    console.log("🔧 Executing schema...");
    console.log("⏱️  This may take 10-15 seconds...\n");

    // Execute the entire schema at once
    await sql.query(schemaSQL);

    console.log("✅ Schema executed successfully!\n");

    // Verify tables were created
    console.log("🔍 Verifying tables...");
    const { rows: tables } = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log("\n📊 Tables created:");
    tables.forEach((table, i) => {
      console.log(`   ${i + 1}. ${table.table_name}`);
    });

    // Check schema version
    const { rows: version } = await sql`
      SELECT version, description, applied_at 
      FROM schema_version 
      ORDER BY applied_at DESC 
      LIMIT 1
    `;

    if (version.length > 0) {
      console.log("\n📌 Schema version:", version[0].version);
      console.log("   Description:", version[0].description);
      console.log("   Applied at:", version[0].applied_at);
    }

    console.log("\n🎉 Database schema setup complete!\n");
    console.log(
      "✅ Ready to run migration: node database/migrate-questions.js\n"
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Schema setup failed:", error);
    console.error("\nError details:", error.message);

    if (error.message.includes("already exists")) {
      console.log("\n💡 Tables may already exist. You can:");
      console.log("   1. Use the existing schema");
      console.log("   2. Drop tables in Neon Console and retry");
      console.log("   3. Proceed to migration step\n");
    }

    process.exit(1);
  }
}

setupSchema();
