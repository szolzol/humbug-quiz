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
      } catch (jwtError) {}
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
 * Unified Admin API Endpoint
 * Handles all admin operations via resource and id parameters
 *
 * Routes:
 * GET    /api/admin?resource=users&page=1&limit=50
 * GET    /api/admin?resource=questions&category=history
 * GET    /api/admin?resource=packs
 * GET    /api/admin?resource=auth_check
 * PUT    /api/admin?resource=users&id=123
 * DELETE /api/admin?resource=users&id=123
 * PUT    /api/admin?resource=questions&id=456
 * DELETE /api/admin?resource=questions&id=456
 * PUT    /api/admin?resource=packs&id=789
 * DELETE /api/admin?resource=packs&id=789
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const resource = req.query.resource as string;

    // Auth check doesn't require admin verification
    if (resource === "auth_check") {
      return handleAuthCheck(req, res);
    }

    // All other operations require admin access
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    if (!resource) {
      return res.status(400).json({ error: "Resource parameter required" });
    }

    // Route based on resource type
    switch (resource) {
      case "users":
        return handleUsers(req, res, admin);
      case "questions":
        return handleQuestions(req, res, admin);
      case "answers":
        return handleAnswers(req, res, admin);
      case "packs":
        return handlePacks(req, res, admin);
      default:
        return res.status(400).json({ error: `Unknown resource: ${resource}` });
    }
  } catch (error) {
    console.error("❌ Admin API error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function handleAuthCheck(req: VercelRequest, res: VercelResponse) {
  const user = await getAuthUser(req);

  if (!user) {
    return res.status(200).json({
      hasAccess: false,
      role: null,
      user: null,
    });
  }

  const hasAccess = user.role === "admin" || user.role === "creator";

  return res.status(200).json({
    hasAccess,
    role: user.role,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    },
  });
}

async function handleUsers(
  req: VercelRequest,
  res: VercelResponse,
  admin: AdminUser
) {
  const id = req.query.id as string;

  if (req.method === "GET" && !id) {
    return await getUsersList(req, res);
  }

  if (req.method === "PUT" && id) {
    return await updateUser(req, res, id, admin);
  }

  if (req.method === "DELETE" && id) {
    return await deleteUser(req, res, id, admin);
  }

  return res.status(400).json({ error: "Invalid operation" });
}

async function getUsersList(req: VercelRequest, res: VercelResponse) {
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

    const countQuery = `SELECT COUNT(*) as count FROM users ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const dataQuery = `
      SELECT id, email, name, picture, role, is_active, created_at, updated_at, last_login
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataResult = await pool.query(dataQuery, params);

    // Transform snake_case to camelCase for frontend
    const users = dataResult.rows.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      picture: u.picture,
      role: u.role,
      isActive: u.is_active,
      createdAt: u.created_at,
      updatedAt: u.updated_at,
      lastLogin: u.last_login,
    }));

    res.status(200).json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      error: "Failed to fetch users",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
  } finally {
    await pool.end();
  }
}

async function updateUser(
  req: VercelRequest,
  res: VercelResponse,
  userId: string,
  admin: AdminUser
) {
  if (!process.env.POSTGRES_POSTGRES_URL) {
    return res.status(500).json({ error: "Database not configured" });
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_POSTGRES_URL,
  });

  try {
    const { role, is_active } = req.body;

    if (!role && is_active === undefined) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (role) {
      updates.push(`role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      params.push(is_active);
      paramIndex++;
    }

    updates.push(`updated_at = NOW()`);
    params.push(userId);

    const query = `
      UPDATE users
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING id, email, name, picture, role, is_active, created_at, updated_at
    `;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  } finally {
    await pool.end();
  }
}

async function deleteUser(
  req: VercelRequest,
  res: VercelResponse,
  userId: string,
  admin: AdminUser
) {
  if (!process.env.POSTGRES_POSTGRES_URL) {
    return res.status(500).json({ error: "Database not configured" });
  }

  if (userId === admin.id) {
    return res.status(400).json({ error: "Cannot delete your own account" });
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_POSTGRES_URL,
  });

  try {
    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 RETURNING id, email`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res
      .status(200)
      .json({ success: true, message: `User ${result.rows[0].email} deleted` });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  } finally {
    await pool.end();
  }
}

async function handleQuestions(
  req: VercelRequest,
  res: VercelResponse,
  admin: AdminUser
) {
  const id = req.query.id as string;

  if (req.method === "GET" && !id) {
    return await getQuestionsList(req, res);
  }

  if (req.method === "PUT" && id) {
    return await updateQuestion(req, res, id);
  }

  if (req.method === "DELETE" && id) {
    return await deleteQuestion(req, res, id);
  }

  return res.status(400).json({ error: "Invalid operation" });
}

async function handleAnswers(
  req: VercelRequest,
  res: VercelResponse,
  admin: AdminUser
) {
  const questionId = req.query.question_id as string;

  if (req.method === "GET" && questionId) {
    return await getAnswersList(req, res, questionId);
  }

  return res.status(400).json({ error: "Invalid operation" });
}

async function getAnswersList(
  req: VercelRequest,
  res: VercelResponse,
  questionId: string
) {
  if (!process.env.POSTGRES_POSTGRES_URL) {
    return res.status(500).json({ error: "Database not configured" });
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_POSTGRES_URL,
  });

  try {
    const result = await pool.query(
      `SELECT id, answer_en, answer_hu, order_index, is_alternative, times_given, created_at
       FROM answers
       WHERE question_id = $1
       ORDER BY order_index ASC`,
      [questionId]
    );

    const answers = result.rows.map((a) => ({
      id: a.id,
      answer_en: a.answer_en,
      answer_hu: a.answer_hu,
      order_index: a.order_index,
      is_alternative: a.is_alternative,
      times_given: a.times_given || 0,
      created_at: a.created_at,
    }));

    res.status(200).json({ answers });
  } catch (error) {
    console.error("Error fetching answers:", error);
    res.status(500).json({ error: "Failed to fetch answers" });
  } finally {
    await pool.end();
  }
}

async function getQuestionsList(req: VercelRequest, res: VercelResponse) {
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

    console.log("📊 Query params:", {
      category,
      setId,
      isActive,
      search,
      sort,
    });

    if (category && category !== "all") {
      whereClauses.push(`q.category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (setId && setId !== "all" && setId !== "") {
      whereClauses.push(`q.set_id = $${paramIndex}`);
      params.push(parseInt(setId)); // Convert to integer for database
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

    let orderByClause = "ORDER BY q.updated_at DESC";
    if (sort === "created_desc") orderByClause = "ORDER BY q.created_at DESC";
    else if (sort === "created_asc")
      orderByClause = "ORDER BY q.created_at ASC";
    else if (sort === "updated_asc")
      orderByClause = "ORDER BY q.updated_at ASC";

    const countQuery = `SELECT COUNT(*) as count FROM questions q ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const dataQuery = `
      SELECT q.*, qs.name_en as set_name,
             (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id) as answer_count
      FROM questions q
      LEFT JOIN question_sets qs ON q.set_id = qs.id
      ${whereClause}
      ${orderByClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataResult = await pool.query(dataQuery, params);

    // Transform snake_case to camelCase for frontend
    const questions = dataResult.rows.map((q) => ({
      id: q.id,
      questionEn: q.question_en,
      questionHu: q.question_hu,
      category: q.category,
      difficulty: q.difficulty,
      setId: q.set_id,
      setName: q.set_name,
      sourceUrl: q.source_url,
      sourceName: q.source_name,
      orderIndex: q.order_index,
      isActive: q.is_active,
      createdAt: q.created_at,
      updatedAt: q.updated_at,
      timesPlayed: q.times_played || 0,
      timesCompleted: q.times_completed || 0,
      answerCount: parseInt(q.answer_count) || 0,
      metadata: q.metadata,
    }));

    res.status(200).json({
      questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({
      error: "Failed to fetch questions",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
  } finally {
    await pool.end();
  }
}

async function updateQuestion(
  req: VercelRequest,
  res: VercelResponse,
  questionId: string
) {
  if (!process.env.POSTGRES_POSTGRES_URL) {
    return res.status(500).json({ error: "Database not configured" });
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_POSTGRES_URL,
  });

  try {
    const {
      question_en,
      question_hu,
      category,
      difficulty,
      is_active,
      source_name,
      source_url,
      answers,
    } = req.body;

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (question_en !== undefined) {
      updates.push(`question_en = $${paramIndex}`);
      params.push(question_en);
      paramIndex++;
    }

    if (question_hu !== undefined) {
      updates.push(`question_hu = $${paramIndex}`);
      params.push(question_hu);
      paramIndex++;
    }

    if (source_name !== undefined) {
      updates.push(`source_name = $${paramIndex}`);
      params.push(source_name);
      paramIndex++;
    }

    if (source_url !== undefined) {
      updates.push(`source_url = $${paramIndex}`);
      params.push(source_url);
      paramIndex++;
    }

    if (category !== undefined) {
      updates.push(`category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (difficulty !== undefined) {
      updates.push(`difficulty = $${paramIndex}`);
      params.push(difficulty);
      paramIndex++;
    }

    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      params.push(is_active);
      paramIndex++;
    }

    if (updates.length === 0 && !answers) {
      return res.status(400).json({ error: "No fields to update" });
    }

    if (updates.length > 0) {
      updates.push(`updated_at = NOW()`);
      params.push(questionId);

      const query = `UPDATE questions SET ${updates.join(
        ", "
      )} WHERE id = $${paramIndex} RETURNING *`;
      await pool.query(query, params);
    }

    // Handle answers if provided
    if (answers && Array.isArray(answers)) {
      // Delete existing answers that are not in the new list
      const answerIds = answers
        .filter((a) => a.id)
        .map((a) => a.id)
        .join(",");
      if (answerIds) {
        await pool.query(
          `DELETE FROM answers WHERE question_id = $1 AND id NOT IN (${answerIds})`,
          [questionId]
        );
      } else {
        await pool.query(`DELETE FROM answers WHERE question_id = $1`, [
          questionId,
        ]);
      }

      // Update or insert answers
      for (const answer of answers) {
        if (answer.id) {
          // Update existing answer
          await pool.query(
            `UPDATE answers SET answer_en = $1, answer_hu = $2, order_index = $3, is_alternative = $4 WHERE id = $5`,
            [
              answer.answer_en,
              answer.answer_hu,
              answer.order_index,
              answer.is_alternative || false,
              answer.id,
            ]
          );
        } else {
          // Insert new answer
          await pool.query(
            `INSERT INTO answers (question_id, answer_en, answer_hu, order_index, is_alternative) VALUES ($1, $2, $3, $4, $5)`,
            [
              questionId,
              answer.answer_en,
              answer.answer_hu,
              answer.order_index,
              answer.is_alternative || false,
            ]
          );
        }
      }
    }

    res
      .status(200)
      .json({ success: true, message: "Question updated successfully" });
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({ error: "Failed to update question" });
  } finally {
    await pool.end();
  }
}

async function deleteQuestion(
  req: VercelRequest,
  res: VercelResponse,
  questionId: string
) {
  if (!process.env.POSTGRES_POSTGRES_URL) {
    return res.status(500).json({ error: "Database not configured" });
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_POSTGRES_URL,
  });

  try {
    const result = await pool.query(
      `DELETE FROM questions WHERE id = $1 RETURNING id`,
      [questionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.status(200).json({ success: true, message: "Question deleted" });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ error: "Failed to delete question" });
  } finally {
    await pool.end();
  }
}

async function handlePacks(
  req: VercelRequest,
  res: VercelResponse,
  admin: AdminUser
) {
  const id = req.query.id as string;

  if (req.method === "GET" && !id) {
    return await getPacksList(req, res);
  }

  if (req.method === "PUT" && id) {
    return await updatePack(req, res, id);
  }

  if (req.method === "DELETE" && id) {
    return await deletePack(req, res, id);
  }

  return res.status(400).json({ error: "Invalid operation" });
}

async function getPacksList(req: VercelRequest, res: VercelResponse) {
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
    const isActive = req.query.is_active as string;
    const isPremium = req.query.is_premium as string;
    const search = req.query.search as string;

    const offset = (page - 1) * limit;

    const whereClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (category && category !== "all") {
      whereClauses.push(`category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (isActive === "active") {
      whereClauses.push(`is_active = true`);
    } else if (isActive === "inactive") {
      whereClauses.push(`is_active = false`);
    }

    if (isPremium === "premium") {
      whereClauses.push(`is_premium = true`);
    } else if (isPremium === "free") {
      whereClauses.push(`is_premium = false`);
    }

    if (search) {
      whereClauses.push(
        `(name_en ILIKE $${paramIndex} OR name_hu ILIKE $${paramIndex} OR description_en ILIKE $${paramIndex} OR description_hu ILIKE $${paramIndex})`
      );
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const countQuery = `SELECT COUNT(*) as count FROM question_sets ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const dataQuery = `
      SELECT qs.*, 
             u.email as creator_email,
             (SELECT COUNT(*) FROM questions q WHERE q.set_id = qs.id) as question_count
      FROM question_sets qs
      LEFT JOIN users u ON qs.creator_id = u.id
      ${whereClause}
      ORDER BY qs.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataResult = await pool.query(dataQuery, params);

    // Transform to match frontend interface (keeping snake_case for compatibility)
    const packs = dataResult.rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      name_en: p.name_en,
      name_hu: p.name_hu,
      description_en: p.description_en,
      description_hu: p.description_hu,
      access_level: p.access_level,
      pack_type: p.pack_type,
      is_active: p.is_active,
      is_published: p.is_published,
      display_order: p.display_order,
      creator_id: p.creator_id,
      creator_email: p.creator_email,
      created_at: p.created_at,
      updated_at: p.updated_at,
      question_count: p.question_count,
    }));

    res.status(200).json({
      packs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching packs:", error);
    res.status(500).json({ error: "Failed to fetch packs" });
  } finally {
    await pool.end();
  }
}

async function updatePack(
  req: VercelRequest,
  res: VercelResponse,
  packId: string
) {
  if (!process.env.POSTGRES_POSTGRES_URL) {
    return res.status(500).json({ error: "Database not configured" });
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_POSTGRES_URL,
  });

  try {
    const {
      name,
      slug,
      description,
      category,
      difficulty,
      is_active,
      is_premium,
    } = req.body;

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name_en = $${paramIndex}`);
      params.push(name);
      paramIndex++;
    }

    if (slug !== undefined) {
      updates.push(`slug = $${paramIndex}`);
      params.push(slug);
      paramIndex++;
    }

    if (description !== undefined) {
      updates.push(`description_en = $${paramIndex}`);
      params.push(description);
      paramIndex++;
    }

    if (category !== undefined) {
      updates.push(`category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (difficulty !== undefined) {
      updates.push(`difficulty = $${paramIndex}`);
      params.push(difficulty);
      paramIndex++;
    }

    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      params.push(is_active);
      paramIndex++;
    }

    if (is_premium !== undefined) {
      updates.push(`is_premium = $${paramIndex}`);
      params.push(is_premium);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    updates.push(`updated_at = NOW()`);
    params.push(packId);

    const query = `UPDATE question_sets SET ${updates.join(
      ", "
    )} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pack not found" });
    }

    res.status(200).json({ success: true, pack: result.rows[0] });
  } catch (error) {
    console.error("Error updating pack:", error);
    res.status(500).json({ error: "Failed to update pack" });
  } finally {
    await pool.end();
  }
}

async function deletePack(
  req: VercelRequest,
  res: VercelResponse,
  packId: string
) {
  if (!process.env.POSTGRES_POSTGRES_URL) {
    return res.status(500).json({ error: "Database not configured" });
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_POSTGRES_URL,
  });

  try {
    const result = await pool.query(
      `DELETE FROM question_sets WHERE id = $1 RETURNING id, name_en`,
      [packId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pack not found" });
    }

    res.status(200).json({
      success: true,
      message: `Pack "${result.rows[0].name_en}" deleted`,
    });
  } catch (error) {
    console.error("Error deleting pack:", error);
    res.status(500).json({ error: "Failed to delete pack" });
  } finally {
    await pool.end();
  }
}
