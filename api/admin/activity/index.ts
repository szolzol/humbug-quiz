import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../../../lib/admin-auth";
import { Pool } from "@neondatabase/serverless";

/**
 * Admin Activity Log Endpoint
 * GET /api/admin/activity - List activity log with pagination and filters
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify admin access
  const admin = await requireAdmin(req, res);
  if (!admin) return; // Response already sent by requireAdmin

  if (req.method === "GET") {
    return handleGetActivity(req, res, admin);
  }

  res.status(405).json({ error: "Method not allowed" });
}

async function handleGetActivity(
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
    const action = req.query.action as string;
    const entityType = req.query.entity_type as string;
    const userId = req.query.user_id as string;

    const offset = (page - 1) * limit;

    // Build where clauses
    const whereClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (action && action !== "all") {
      whereClauses.push(`action = $${paramIndex}`);
      params.push(action);
      paramIndex++;
    }

    if (entityType && entityType !== "all") {
      whereClauses.push(`entity_type = $${paramIndex}`);
      params.push(entityType);
      paramIndex++;
    }

    if (userId) {
      whereClauses.push(`user_id = $${paramIndex}`);
      params.push(userId);
      paramIndex++;
    }

    const whereClause =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as count
      FROM admin_activity_log
      ${whereClause}
    `;

    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Get activity logs
    const logsQuery = `
      SELECT 
        aal.id,
        aal.user_id,
        u.email AS user_email,
        u.name AS user_name,
        aal.action,
        aal.entity_type,
        aal.entity_id,
        aal.details,
        aal.ip_address,
        aal.created_at
      FROM admin_activity_log aal
      LEFT JOIN users u ON aal.user_id = u.id
      ${whereClause}
      ORDER BY aal.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const logsResult = await pool.query(logsQuery, [...params, limit, offset]);
    const logs = logsResult.rows;

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    res.status(200).json({
      logs,
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
    console.error("❌ Error fetching activity log:", error);
    res.status(500).json({ error: "Failed to fetch activity log" });
  } finally {
    await pool.end();
  }
}
