import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool, neon } from "@neondatabase/serverless";
import jwt from "jsonwebtoken";

// Inlined auth helpers
interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  role: "free" | "premium" | "admin" | "creator";
  isActive: boolean;
}

interface AdminUser extends AuthUser {
  role: "admin" | "creator";
}

function parseSessionCookie(cookieHeader: string | undefined): AuthUser | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  const token = cookies.auth_token;
  if (!token) return null;

  try {
    if (process.env.JWT_SECRET) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
          userId: string;
          email: string;
          name: string;
          picture: string;
          role?: string;
        };

        return {
          id: decoded.userId,
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
          role: (decoded.role as AuthUser["role"]) || "free",
          isActive: true,
        };
      } catch (jwtError) {
        // Fallback
      }
    }

    const sessionData = JSON.parse(
      Buffer.from(token, "base64").toString("utf-8")
    );

    if (sessionData.exp && Date.now() > sessionData.exp) {
      return null;
    }

    return {
      id: sessionData.id,
      email: sessionData.email,
      name: sessionData.name,
      picture: sessionData.picture,
      role: sessionData.role || "free",
      isActive: sessionData.isActive !== false,
    };
  } catch (error) {
    return null;
  }
}

async function getAuthUser(req: VercelRequest): Promise<AuthUser | null> {
  const cookieHeader = req.headers.cookie;
  const sessionUser = parseSessionCookie(cookieHeader);

  if (!sessionUser) return null;

  if (!process.env.POSTGRES_POSTGRES_URL) {
    return sessionUser;
  }

  const sql = neon(process.env.POSTGRES_POSTGRES_URL);

  try {
    const [dbUser] = await sql`
      SELECT id, email, name, picture, role, is_active
      FROM users
      WHERE id = ${sessionUser.id}
      LIMIT 1
    `;

    if (!dbUser || !dbUser.is_active) {
      return null;
    }

    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      picture: dbUser.picture,
      role: dbUser.role,
      isActive: dbUser.is_active,
    };
  } catch (error) {
    return sessionUser;
  }
}

async function requireAdmin(
  req: VercelRequest,
  res: VercelResponse
): Promise<AdminUser | null> {
  const user = await getAuthUser(req);

  if (!user) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Authentication required. Please log in.",
    });
    return null;
  }

  if (user.role !== "admin" && user.role !== "creator") {
    res.status(403).json({
      error: "Forbidden",
      message: "Admin access required.",
    });
    return null;
  }

  return user as AdminUser;
}

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
