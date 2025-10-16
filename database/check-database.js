/**
 * Check Database Status
 * Verifies what tables and types exist in the database
 */

import { createPool } from "@vercel/postgres";
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

async function checkDatabase() {
  console.log("🔍 Checking Database Status...\n");

  try {
    // Check tables
    const { rows: tables } = await sql.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log("📊 Existing Tables:");
    if (tables.length === 0) {
      console.log("   (none)");
    } else {
      tables.forEach((table, i) => {
        console.log(`   ${i + 1}. ${table.table_name}`);
      });
    }

    // Check custom types (ENUMs)
    const { rows: types } = await sql.query(`
      SELECT typname as type_name
      FROM pg_type
      WHERE typtype = 'e'
      ORDER BY typname
    `);

    console.log("\n🏷️  Custom Types (ENUMs):");
    if (types.length === 0) {
      console.log("   (none)");
    } else {
      types.forEach((type, i) => {
        console.log(`   ${i + 1}. ${type.type_name}`);
      });
    }

    // Check functions
    const { rows: functions } = await sql.query(`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      ORDER BY routine_name
    `);

    console.log("\n⚙️  Functions:");
    if (functions.length === 0) {
      console.log("   (none)");
    } else {
      functions.forEach((func, i) => {
        console.log(`   ${i + 1}. ${func.routine_name}`);
      });
    }

    console.log("\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkDatabase();
