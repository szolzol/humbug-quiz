/**
 * Check existing database schema
 */

import { Pool } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function checkSchema() {
  const databaseUrl =
    process.env.DATABASE_URL || process.env.POSTGRES_POSTGRES_URL;
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    // Check if tables already exist
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('game_rooms', 'room_players', 'game_sessions', 'player_answers')
      ORDER BY table_name
    `);

    console.log("Existing multiplayer tables:");
    if (result.rows.length === 0) {
      console.log("  None found - safe to run migration");
    } else {
      console.log(result.rows.map((r) => `  - ${r.table_name}`).join("\n"));

      // Check for triggers
      const triggers = await pool.query(`
        SELECT trigger_name, event_object_table 
        FROM information_schema.triggers 
        WHERE trigger_name IN ('trigger_player_activity', 'trigger_session_activity')
      `);

      if (triggers.rows.length > 0) {
        console.log("\nExisting triggers:");
        console.log(
          triggers.rows
            .map((r) => `  - ${r.trigger_name} on ${r.event_object_table}`)
            .join("\n")
        );
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
