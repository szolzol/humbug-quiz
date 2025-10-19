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
 * Admin Pack Detail Endpoint
 * PUT /api/admin/packs/[id] - Update a specific pack
 * DELETE /api/admin/packs/[id] - Delete a specific pack
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify admin access
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const packId = req.query.id as string;

  if (!packId) {
    return res.status(400).json({ error: "Pack ID is required" });
  }

  if (req.method === "PUT") {
    return handleUpdatePack(req, res, packId, admin);
  }

  if (req.method === "DELETE") {
    return handleDeletePack(req, res, packId, admin);
  }

  res.status(405).json({ error: "Method not allowed" });
}

async function handleUpdatePack(
  req: VercelRequest,
  res: VercelResponse,
  packId: string,
  admin: AdminUser
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

    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      params.push(name);
      paramIndex++;
    }

    if (slug !== undefined) {
      updates.push(`slug = $${paramIndex}`);
      params.push(slug);
      paramIndex++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
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

    params.push(packId); // For WHERE clause
    const packIdParam = paramIndex;

    const query = `
      UPDATE question_sets
      SET ${updates.join(", ")}
      WHERE id = $${packIdParam}
      RETURNING *
    `;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pack not found" });
    }

    res.status(200).json({
      success: true,
      pack: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating pack:", error);
    res.status(500).json({
      error: "Failed to update pack",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    await pool.end();
  }
}

async function handleDeletePack(
  req: VercelRequest,
  res: VercelResponse,
  packId: string,
  admin: AdminUser
) {
  if (!process.env.POSTGRES_POSTGRES_URL) {
    return res.status(500).json({ error: "Database not configured" });
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_POSTGRES_URL,
  });

  try {
    const query = `
      DELETE FROM question_sets
      WHERE id = $1
      RETURNING id, name
    `;

    const result = await pool.query(query, [packId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pack not found" });
    }

    res.status(200).json({
      success: true,
      message: `Pack "${result.rows[0].name}" deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting pack:", error);
    res.status(500).json({
      error: "Failed to delete pack",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    await pool.end();
  }
}
