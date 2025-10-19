import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "./lib/auth";
import { Pool, neon } from "@neondatabase/serverless";
import { parse as parseCookie } from "cookie";
import jwt from "jsonwebtoken";

/**
 * Unified Admin API Handler
 * Handles all /api/admin/* routes to stay within Vercel's 12 function limit
 *
 * Routes:
 * - GET /api/admin?endpoint=auth-check
 * - GET /api/admin?endpoint=users&...filters
 * - GET /api/admin?endpoint=questions&...filters
 * - GET /api/admin?endpoint=packs&...filters
 * - GET /api/admin?endpoint=activity&...filters
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const endpoint = req.query.endpoint as string;

  // Route to appropriate handler based on endpoint parameter
  switch (endpoint) {
    case "auth-check":
      return handleAuthCheck(req, res);

    case "users":
      return handleUsers(req, res);

    case "questions":
      return handleQuestions(req, res);

    case "packs":
      return handlePacks(req, res);

    case "activity":
      return handleActivity(req, res);

    default:
      res.status(404).json({
        error: "Not found",
        message: "Invalid admin endpoint",
      });
  }
}

/**
 * Auth Check Handler
 * GET /api/admin?endpoint=auth-check
 */
async function handleAuthCheck(req: VercelRequest, res: VercelResponse) {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res.status(500).json({
      hasAccess: false,
      role: null,
      user: null,
      error: "JWT secret not configured",
    });
  }

  // Parse cookies from request
  const cookies = parseCookie(req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) {
    return res.status(200).json({
      hasAccess: false,
      role: null,
      user: null,
    });
  }

  try {
    // Verify and decode JWT token
    const decoded = jwt.verify(token, jwtSecret) as {
      userId: string;
      email: string;
      name: string;
      picture: string;
      role?: string;
    };

    // Get role from token (or query database if needed)
    let userRole = decoded.role || "free";
    let userName = decoded.name;
    let userEmail = decoded.email;
    let userPicture = decoded.picture;
    let isActive = true;

    // Double-check role from database if available
    if (process.env.POSTGRES_POSTGRES_URL) {
      try {
        const sql = neon(process.env.POSTGRES_POSTGRES_URL);

        const [dbUser] = await sql`
          SELECT id, email, name, picture, role, is_active
          FROM users
          WHERE id = ${decoded.userId}
          LIMIT 1
        `;

        if (!dbUser || !dbUser.is_active) {
          return res.status(200).json({
            hasAccess: false,
            role: null,
            user: null,
          });
        }

        // Use database values (most up-to-date)
        userRole = dbUser.role;
        userName = dbUser.name;
        userEmail = dbUser.email;
        userPicture = dbUser.picture;
        isActive = dbUser.is_active;
      } catch (dbError) {
        console.error("❌ Database error during admin check:", dbError);
        // Fallback to token data if database fails
      }
    }

    // Check if user has admin or creator role
    const isAdmin = userRole === "admin" || userRole === "creator";

    res.status(200).json({
      hasAccess: isAdmin,
      role: userRole,
      user: isAdmin
        ? {
            id: decoded.userId,
            email: userEmail,
            name: userName,
            picture: userPicture,
          }
        : null,
    });
  } catch (error) {
    // Token invalid or expired
    console.error("❌ Admin auth check error:", error);
    res.status(200).json({
      hasAccess: false,
      role: null,
      user: null,
    });
  }
}

/**
 * Users Handler
 * GET /api/admin?endpoint=users&page=1&limit=50&...
 */
async function handleUsers(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (!process.env.POSTGRES_POSTGRES_URL) {
    return res.status(500).json({ error: "Database not configured" });
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_POSTGRES_URL,
  });

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const role = req.query.role as string;
    const search = req.query.search as string;
    const isActive = req.query.is_active as string;

    const offset = (page - 1) * limit;

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

    const countQuery = `
      SELECT COUNT(*) as count
      FROM users
      ${whereClause}
    `;

    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    const usersQuery = `
      SELECT 
        id, email, name, picture, role, is_active,
        last_login, created_at, updated_at
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

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  } finally {
    await pool.end();
  }
}

/**
 * Questions Handler
 * GET /api/admin?endpoint=questions&page=1&limit=50&...
 */
async function handleQuestions(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (!process.env.POSTGRES_POSTGRES_URL) {
    return res.status(500).json({ error: "Database not configured" });
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_POSTGRES_URL,
  });

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const category = req.query.category as string;
    const setId = req.query.set_id as string;
    const isActive = req.query.is_active as string;
    const search = req.query.search as string;
    const sort = (req.query.sort as string) || "updated_desc";

    const offset = (page - 1) * limit;

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

    const countQuery = `SELECT COUNT(*) as count FROM questions q ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    const questionsQuery = `
      SELECT 
        q.id, q.set_id AS "setId", qs.name_en AS "setName",
        q.question_en AS "questionEn", q.question_hu AS "questionHu",
        q.category, q.difficulty, q.source_name AS "sourceName",
        q.source_url AS "sourceUrl", q.order_index AS "orderIndex",
        q.is_active AS "isActive", q.created_at AS "createdAt",
        q.updated_at AS "updatedAt", q.times_played AS "timesPlayed",
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

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      questions: questionsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching questions:", error);
    res.status(500).json({ error: "Failed to fetch questions" });
  } finally {
    await pool.end();
  }
}

/**
 * Packs Handler
 * GET /api/admin?endpoint=packs&pack_type=...&access_level=...
 */
async function handlePacks(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (!process.env.POSTGRES_POSTGRES_URL) {
    return res.status(500).json({ error: "Database not configured" });
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_POSTGRES_URL,
  });

  try {
    const packType = req.query.pack_type as string;
    const accessLevel = req.query.access_level as string;
    const isActive = req.query.is_active as string;
    const isPublished = req.query.is_published as string;

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

    const packsQuery = `
      SELECT 
        qs.id, qs.slug, qs.name_en, qs.name_hu,
        qs.description_en, qs.description_hu,
        qs.access_level, qs.pack_type, qs.is_active, qs.is_published,
        qs.display_order, qs.creator_id, u.email AS creator_email,
        qs.created_at, qs.updated_at,
        (SELECT COUNT(*) FROM questions WHERE set_id = qs.id) AS question_count,
        COALESCE((SELECT SUM(times_played) FROM questions WHERE set_id = qs.id), 0) AS total_plays
      FROM question_sets qs
      LEFT JOIN users u ON qs.creator_id = u.id
      ${whereClause}
      ORDER BY qs.display_order ASC, qs.created_at DESC
    `;

    const packsResult = await pool.query(packsQuery, params);

    res.status(200).json({
      packs: packsResult.rows,
      total: packsResult.rows.length,
    });
  } catch (error) {
    console.error("❌ Error fetching packs:", error);
    res.status(500).json({ error: "Failed to fetch packs" });
  } finally {
    await pool.end();
  }
}

/**
 * Activity Handler
 * GET /api/admin?endpoint=activity&page=1&limit=50&...
 */
async function handleActivity(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (!process.env.POSTGRES_POSTGRES_URL) {
    return res.status(500).json({ error: "Database not configured" });
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_POSTGRES_URL,
  });

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const action = req.query.action as string;
    const entityType = req.query.entity_type as string;
    const userId = req.query.user_id as string;

    const offset = (page - 1) * limit;

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

    const countQuery = `
      SELECT COUNT(*) as count
      FROM admin_activity_log
      ${whereClause}
    `;

    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    const logsQuery = `
      SELECT 
        aal.id, aal.user_id, u.email AS user_email, u.name AS user_name,
        aal.action, aal.entity_type, aal.entity_id, aal.details,
        aal.ip_address, aal.created_at
      FROM admin_activity_log aal
      LEFT JOIN users u ON aal.user_id = u.id
      ${whereClause}
      ORDER BY aal.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const logsResult = await pool.query(logsQuery, [...params, limit, offset]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      logs: logsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching activity log:", error);
    res.status(500).json({ error: "Failed to fetch activity log" });
  } finally {
    await pool.end();
  }
}
