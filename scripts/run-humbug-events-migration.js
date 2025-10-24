import { Pool } from "@neondatabase/serverless";
import { config } from "dotenv";
import { readFileSync } from "fs";

config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.POSTGRES_POSTGRES_URL });

async function runMigration() {
  try {
    const sql = readFileSync("migrations/009_humbug_events.sql", "utf-8");
    await pool.query(sql);
    console.log("✅ HUMBUG events migration complete!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration();
