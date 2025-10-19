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
