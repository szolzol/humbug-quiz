import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

const rooms = await sql`
  SELECT code, created_at, expires_at, NOW() as current_time
  FROM game_rooms 
  ORDER BY created_at DESC 
  LIMIT 3
`;

console.log("Recent rooms:");
rooms.forEach((room) => {
  const expiresAt = new Date(room.expires_at);
  const now = new Date(room.current_time);
  const diff = (expiresAt - now) / 1000 / 60; // minutes

  console.log(`\nRoom: ${room.code}`);
  console.log(`  Created:  ${room.created_at}`);
  console.log(`  Expires:  ${room.expires_at}`);
  console.log(`  Now (DB): ${room.current_time}`);
  console.log(`  Time left: ${diff.toFixed(1)} minutes`);
  console.log(`  Expired: ${expiresAt < now ? "YES ❌" : "NO ✅"}`);
});
