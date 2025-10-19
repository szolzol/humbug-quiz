import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "@neondatabase/serverless";

/**
 * Test Database Endpoint
 * Simple test to verify database connectivity on Vercel
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log("🧪 Test DB endpoint called");

  if (!process.env.POSTGRES_POSTGRES_URL) {
    console.error("❌ Database URL not configured");
    return res.status(500).json({
      error: "Database not configured",
      hasEnvVar: false,
    });
  }

  console.log("✅ Database URL exists");

  try {
    const pool = new Pool({
      connectionString: process.env.POSTGRES_POSTGRES_URL,
    });

    console.log("🔗 Attempting database connection...");

    const result = await pool.query("SELECT COUNT(*) as count FROM users");
    const userCount = result.rows[0].count;

    await pool.end();

    console.log(`✅ Successfully connected! Found ${userCount} users`);

    return res.status(200).json({
      success: true,
      message: "Database connection successful",
      userCount: userCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Database error:", error);
    return res.status(500).json({
      error: "Database connection failed",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
