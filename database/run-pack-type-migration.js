/**
 * Run migration: Add pack_type to question_sets
 *
 * This script adds the pack_type enum and column to the question_sets table
 * to support different types of content packs beyond just quiz.
 */

import { Pool } from "@neondatabase/serverless";
import dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_POSTGRES_URL,
  });

  try {
    console.log("🔄 Starting migration: Add pack_type to question_sets...\n");

    // Step 1: Create pack_type enum
    console.log("⚙️  Creating pack_type enum...");
    try {
      await pool.query(`
        CREATE TYPE pack_type AS ENUM (
          'quiz',
          'challenge',
          'learning',
          'party',
          'kids',
          'expert',
          'seasonal',
          'custom'
        )
      `);
      console.log("   ✅ pack_type enum created\n");
    } catch (error) {
      if (error.message.includes("already exists")) {
        console.log("   ⚠️  pack_type enum already exists, skipping\n");
      } else {
        throw error;
      }
    }

    // Step 2: Add pack_type column
    console.log("⚙️  Adding pack_type column to question_sets...");
    try {
      await pool.query(`
        ALTER TABLE question_sets 
        ADD COLUMN pack_type pack_type DEFAULT 'quiz' NOT NULL
      `);
      console.log("   ✅ pack_type column added\n");
    } catch (error) {
      if (error.message.includes("already exists")) {
        console.log("   ⚠️  pack_type column already exists, skipping\n");
      } else {
        throw error;
      }
    }

    // Step 3: Create index
    console.log("⚙️  Creating index on pack_type...");
    try {
      await pool.query(`
        CREATE INDEX idx_question_sets_pack_type ON question_sets(pack_type)
      `);
      console.log("   ✅ Index created\n");
    } catch (error) {
      if (error.message.includes("already exists")) {
        console.log("   ⚠️  Index already exists, skipping\n");
      } else {
        throw error;
      }
    }

    // Step 4: Update existing records (already default, but being explicit)
    console.log("⚙️  Updating existing records...");
    const updateResult = await pool.query(`
      UPDATE question_sets 
      SET pack_type = 'quiz' 
      WHERE pack_type IS NULL OR pack_type::text = ''
    `);
    console.log(`   ✅ Updated ${updateResult.rowCount} records\n`);

    // Verify the migration
    console.log("🔍 Verifying migration...\n");

    const columnsResult = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'question_sets' AND column_name = 'pack_type'
    `);

    if (columnsResult.rows.length > 0) {
      console.log("✅ pack_type column verified!");
      console.log("   Column details:", columnsResult.rows[0]);
    } else {
      throw new Error("pack_type column not found after migration");
    }

    // Show pack type distribution
    const packTypesResult = await pool.query(`
      SELECT 
        pack_type, 
        COUNT(*) as count,
        COUNT(*) FILTER (WHERE is_published = true) as published_count
      FROM question_sets
      GROUP BY pack_type
      ORDER BY pack_type
    `);

    console.log("\n📊 Pack type distribution:");
    packTypesResult.rows.forEach((pt) => {
      console.log(
        `   ${pt.pack_type}: ${pt.count} total, ${pt.published_count} published`
      );
    });

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
