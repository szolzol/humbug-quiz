/**
 * Check existing game_sessions table structure
 */

import { Pool } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function checkGameSessions() {
  const databaseUrl =
    process.env.DATABASE_URL || process.env.POSTGRES_POSTGRES_URL;
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    // Check columns
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'game_sessions'
      ORDER BY ordinal_position
    `);

    console.log("game_sessions table structure:");
    columns.rows.forEach((col) => {
      console.log(
        `  - ${col.column_name}: ${col.data_type} ${
          col.is_nullable === "NO" ? "NOT NULL" : ""
        }`
      );
    });

    // Check if there's any data
    const count = await pool.query(
      `SELECT COUNT(*) as count FROM game_sessions`
    );
    console.log(`\nRows in table: ${count.rows[0].count}`);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await pool.end();
  }
}

checkGameSessions();
