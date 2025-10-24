import { Pool } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { config } from "dotenv";

config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.POSTGRES_POSTGRES_URL });

const query = readFileSync("migrations/008_humbug_mechanic.sql", "utf8");

pool
  .query(query)
  .then(() => {
    console.log("✅ HUMBUG migration complete!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  });
