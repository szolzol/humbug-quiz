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
