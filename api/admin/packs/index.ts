import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../../lib/auth";
import { Pool } from "@neondatabase/serverless";

/**
 * Admin Packs Endpoint
 * GET /api/admin/packs - List all packs with filters
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify admin access
  const admin = await requireAdmin(req, res);
  if (!admin) return; // Response already sent by requireAdmin

  if (req.method === "GET") {
    return handleGetPacks(req, res, admin);
  }

  res.status(405).json({ error: "Method not allowed" });
}

async function handleGetPacks(
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
    const packType = req.query.pack_type as string;
    const accessLevel = req.query.access_level as string;
    const isActive = req.query.is_active as string;
    const isPublished = req.query.is_published as string;

    // Build where clauses
    const whereClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (packType) {
      whereClauses.push(`qs.pack_type = $${paramIndex}`);
      params.push(packType);
      paramIndex++;
    }

    if (accessLevel) {
      whereClauses.push(`qs.access_level = $${paramIndex}`);
      params.push(accessLevel);
      paramIndex++;
    }

    if (isActive === "true") {
      whereClauses.push(`qs.is_active = true`);
    } else if (isActive === "false") {
      whereClauses.push(`qs.is_active = false`);
    }

    if (isPublished === "true") {
      whereClauses.push(`qs.is_published = true`);
    } else if (isPublished === "false") {
      whereClauses.push(`qs.is_published = false`);
    }

    const whereClause =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // Get packs with statistics
    const packsQuery = `
      SELECT 
        qs.id,
        qs.slug,
        qs.name_en,
        qs.name_hu,
        qs.description_en,
        qs.description_hu,
        qs.access_level,
        qs.pack_type,
        qs.is_active,
        qs.is_published,
        qs.display_order,
        qs.creator_id,
        u.email AS creator_email,
        qs.created_at,
        qs.updated_at,
        (SELECT COUNT(*) FROM questions WHERE set_id = qs.id) AS question_count,
        COALESCE(
          (SELECT SUM(times_played) FROM questions WHERE set_id = qs.id),
          0
        ) AS total_plays
      FROM question_sets qs
      LEFT JOIN users u ON qs.creator_id = u.id
      ${whereClause}
      ORDER BY qs.display_order ASC, qs.created_at DESC
    `;

    const packsResult = await pool.query(packsQuery, params);
    const packs = packsResult.rows;

    res.status(200).json({
      packs,
      total: packs.length,
    });
  } catch (error) {
    console.error("❌ Error fetching packs:", error);
    res.status(500).json({ error: "Failed to fetch packs" });
  } finally {
    await pool.end();
  }
}
