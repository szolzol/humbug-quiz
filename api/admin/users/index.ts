import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../_auth";
import { Pool } from "@neondatabase/serverless";

/**
 * Admin Users Endpoint
 * GET /api/admin/users - List all users with pagination and filters
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log("🔍 Admin users endpoint called");

    // Verify admin access
    const admin = await requireAdmin(req, res);
    if (!admin) {
      console.log("❌ Admin access denied");
      return; // Response already sent by requireAdmin
    }

    console.log("✅ Admin access granted:", admin.email);

    if (req.method === "GET") {
      return handleGetUsers(req, res, admin);
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("❌ Fatal error in admin users handler:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}

async function handleGetUsers(
  req: VercelRequest,
  res: VercelResponse,
  admin: any
) {
  console.log("📊 Fetching users...");

  if (!process.env.POSTGRES_POSTGRES_URL) {
    console.error("❌ Database not configured");
    return res.status(500).json({ error: "Database not configured" });
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_POSTGRES_URL,
  });

  try {
    console.log("✅ Database connection established");

    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const role = req.query.role as string;
    const search = req.query.search as string;
    const isActive = req.query.is_active as string;

    console.log("📋 Query params:", { page, limit, role, search, isActive });

    const offset = (page - 1) * limit;

    // Build where clauses
    const whereClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (role && role !== "all") {
      whereClauses.push(`role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    if (search) {
      whereClauses.push(
        `(email ILIKE $${paramIndex} OR name ILIKE $${paramIndex})`
      );
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (isActive === "active") {
      whereClauses.push(`is_active = true`);
    } else if (isActive === "inactive") {
      whereClauses.push(`is_active = false`);
    }

    const whereClause =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as count
      FROM users
      ${whereClause}
    `;

    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Get users
    const usersQuery = `
      SELECT 
        id,
        email,
        name,
        picture,
        role,
        is_active,
        last_login,
        created_at,
        updated_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const usersResult = await pool.query(usersQuery, [
      ...params,
      limit,
      offset,
    ]);
    const users = usersResult.rows;

    console.log(`✅ Fetched ${users.length} users`);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    res.status(200).json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    console.error("Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    res.status(500).json({
      error: "Failed to fetch users",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    await pool.end();
  }
}
