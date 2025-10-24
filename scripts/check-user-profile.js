import { Pool } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.POSTGRES_POSTGRES_URL });

async function checkUserProfile() {
  // Check users table
  const userCols = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name='users' 
    ORDER BY ordinal_position
  `);

  console.log("Users table columns:");
  userCols.rows.forEach((c) =>
    console.log(`  ${c.column_name} (${c.data_type})`)
  );

  // Check if there are any users
  const users = await pool.query(`
    SELECT id, email, name, nickname, 
           preferences->>'subscription_tier' as subscription_tier 
    FROM users LIMIT 3
  `);
  console.log("\nSample users:");
  users.rows.forEach((u) =>
    console.log(
      `  ${u.id}: ${u.nickname || u.name || u.email} - ${
        u.subscription_tier || "free"
      }`
    )
  );

  await pool.end();
}

checkUserProfile();
