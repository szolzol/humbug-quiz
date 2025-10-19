import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../../../lib/admin-auth";
import { Pool } from "@neondatabase/serverless";

/**
 * Admin Questions Endpoint
 * GET /api/admin/questions - List all questions with pagination and filters
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify admin access
  const admin = await requireAdmin(req, res);
  if (!admin) return; // Response already sent by requireAdmin

  if (req.method === "GET") {
    return handleGetQuestions(req, res, admin);
  }

  res.status(405).json({ error: "Method not allowed" });
}

async function handleGetQuestions(
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
    const category = req.query.category as string;
    const setId = req.query.set_id as string;
    const isActive = req.query.is_active as string;
    const search = req.query.search as string;
    const sort = (req.query.sort as string) || "updated_desc";

    const offset = (page - 1) * limit;

    // Build where clauses
    const whereClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (category && category !== "all") {
      whereClauses.push(`q.category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (setId && setId !== "all") {
      whereClauses.push(`q.set_id = $${paramIndex}`);
      params.push(parseInt(setId));
      paramIndex++;
    }

    if (isActive === "active") {
      whereClauses.push(`q.is_active = true`);
    } else if (isActive === "inactive") {
      whereClauses.push(`q.is_active = false`);
    }

    if (search) {
      whereClauses.push(
        `(q.question_en ILIKE $${paramIndex} OR q.question_hu ILIKE $${paramIndex})`
      );
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // Determine sort order
    let orderBy = "q.updated_at DESC";
    switch (sort) {
      case "created_desc":
        orderBy = "q.created_at DESC";
        break;
      case "created_asc":
        orderBy = "q.created_at ASC";
        break;
      case "updated_asc":
        orderBy = "q.updated_at ASC";
        break;
      case "played_desc":
        orderBy = "q.times_played DESC";
        break;
      case "played_asc":
        orderBy = "q.times_played ASC";
        break;
      case "completed_desc":
        orderBy = "q.times_completed DESC";
        break;
      case "completed_asc":
        orderBy = "q.times_completed ASC";
        break;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as count
      FROM questions q
      ${whereClause}
    `;

    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Get questions
    const questionsQuery = `
      SELECT 
        q.id,
        q.set_id AS "setId",
        qs.name_en AS "setName",
        q.question_en AS "questionEn",
        q.question_hu AS "questionHu",
        q.category,
        q.difficulty,
        q.source_name AS "sourceName",
        q.source_url AS "sourceUrl",
        q.order_index AS "orderIndex",
        q.is_active AS "isActive",
        q.created_at AS "createdAt",
        q.updated_at AS "updatedAt",
        q.times_played AS "timesPlayed",
        q.times_completed AS "timesCompleted",
        (SELECT COUNT(*) FROM answers WHERE question_id = q.id) AS "answerCount"
      FROM questions q
      LEFT JOIN question_sets qs ON q.set_id = qs.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const questionsResult = await pool.query(questionsQuery, [
      ...params,
      limit,
      offset,
    ]);
    const questions = questionsResult.rows;

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    res.status(200).json({
      questions,
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
    console.error("❌ Error fetching questions:", error);
    res.status(500).json({ error: "Failed to fetch questions" });
  } finally {
    await pool.end();
  }
}
