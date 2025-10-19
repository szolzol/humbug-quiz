import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../../_lib/auth";
import { Pool } from "@neondatabase/serverless";

/**
 * Admin Users Endpoint
 * GET /api/admin/users - List all users with pagination and filters
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify admin access
  const admin = await requireAdmin(req, res);
  if (!admin) return; // Response already sent by requireAdmin

  if (req.method === "GET") {
    return handleGetUsers(req, res, admin);
  }

  res.status(405).json({ error: "Method not allowed" });
}

async function handleGetUsers(
  req: VercelRequest,
  res: VercelResponse,
  admin: any
) {
  if (!process.env.POSTGRES_POSTGRES_URL) {
    return res.status(500).json({ error: "Database not configured" });
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_POSTGRES_URL,
  });

  try {
    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const role = req.query.role as string;
    const search = req.query.search as string;
    const isActive = req.query.is_active as string;

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
    res.status(500).json({ error: "Failed to fetch users" });
  } finally {
    await pool.end();
  }
}
