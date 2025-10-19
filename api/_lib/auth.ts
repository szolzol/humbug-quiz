import { neon } from "@neondatabase/serverless";
import type { IncomingMessage, ServerResponse } from "http";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  role: "free" | "premium" | "admin" | "creator";
  isActive: boolean;
}

export interface AdminUser extends AuthUser {
  role: "admin" | "creator";
}

/**
 * Parse and verify session cookie
 * Supports both JWT (Vercel) and base64 (localhost) formats
 */
export function parseSessionCookie(
  cookieHeader: string | undefined
): AuthUser | null {
  if (!cookieHeader) return null;

  // Extract auth_token cookie
  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  const token = cookies.auth_token;
  if (!token) return null;

  try {
    // Try JWT first (Vercel production format)
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
          isActive: true, // Will be verified against DB
        };
      } catch (jwtError) {
        // Not a JWT or invalid, try base64 format
      }
    }

    // Fallback to base64 format (localhost dev server)
    const sessionData = JSON.parse(
      Buffer.from(token, "base64").toString("utf-8")
    );

    // Check expiration
    if (sessionData.exp && Date.now() > sessionData.exp) {
      console.warn("⚠️ Session expired");
      return null;
    }

    // Return user data (no role/active check yet - done in DB)
    return {
      id: sessionData.id,
      email: sessionData.email,
      name: sessionData.name,
      picture: sessionData.picture,
      role: sessionData.role || "free",
      isActive: sessionData.isActive !== false,
    };
  } catch (error) {
    console.error("❌ Session parse error:", error);
    return null;
  }
}

/**
 * Get authenticated user from request
 * Verifies session cookie against database
 */
export async function getAuthUser(
  req: IncomingMessage
): Promise<AuthUser | null> {
  const cookieHeader = req.headers.cookie;
  const sessionUser = parseSessionCookie(cookieHeader);

  if (!sessionUser) return null;

  // Check if database is configured
  if (!process.env.POSTGRES_POSTGRES_URL) {
    console.warn("⚠️ Database not configured, using session data only");
    return sessionUser;
  }

  // Verify user still exists and is active in database
  const sql = neon(process.env.POSTGRES_POSTGRES_URL);

  try {
    const [dbUser] = await sql`
      SELECT id, email, name, picture, role, is_active
      FROM users
      WHERE id = ${sessionUser.id}
      LIMIT 1
    `;

    if (!dbUser || !dbUser.is_active) {
      console.warn("⚠️ User not found or inactive:", sessionUser.id);
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
    console.error("❌ Database error during auth check:", error);
    // Fallback to session data if DB fails
    return sessionUser;
  }
}

/**
 * Require authenticated user (any role)
 * Returns user or sends 401 response
 */
export async function requireAuth(
  req: IncomingMessage | VercelRequest,
  res: ServerResponse | VercelResponse
): Promise<AuthUser | null> {
  const user = await getAuthUser(req);

  if (!user) {
    if ("status" in res) {
      // VercelResponse
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required. Please log in.",
      });
    } else {
      // ServerResponse
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: "Unauthorized",
          message: "Authentication required. Please log in.",
        })
      );
    }
    return null;
  }

  return user;
}

/**
 * Require admin or creator role
 * Returns user or sends 403 response
 */
export async function requireAdmin(
  req: IncomingMessage | VercelRequest,
  res: ServerResponse | VercelResponse
): Promise<AdminUser | null> {
  const user = await requireAuth(req, res);

  if (!user) return null;

  if (user.role !== "admin" && user.role !== "creator") {
    if ("status" in res) {
      // VercelResponse
      res.status(403).json({
        error: "Forbidden",
        message: "Admin or creator access required. Your role: " + user.role,
      });
    } else {
      // ServerResponse
      res.statusCode = 403;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: "Forbidden",
          message: "Admin or creator access required. Your role: " + user.role,
        })
      );
    }
    return null;
  }

  return user as AdminUser;
}

/**
 * Require full admin role only (not creator)
 * Returns user or sends 403 response
 */
export async function requireFullAdmin(
  req: IncomingMessage,
  res: ServerResponse
): Promise<AdminUser | null> {
  const user = await requireAuth(req, res);

  if (!user) return null;

  if (user.role !== "admin") {
    res.statusCode = 403;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: "Forbidden",
        message: "Full admin access required.",
      })
    );
    return null;
  }

  return user as AdminUser;
}

/**
 * Check if user has specific permission
 * (For future fine-grained permission system)
 */
export async function hasPermission(
  userId: string,
  permissionKey: string,
  action: "create" | "read" | "update" | "delete"
): Promise<boolean> {
  // TODO: Implement after admin_permissions table is added
  // For now, admin role has all permissions
  if (!process.env.POSTGRES_POSTGRES_URL) {
    return false;
  }

  const sql = neon(process.env.POSTGRES_POSTGRES_URL);

  try {
    const [user] = await sql`
      SELECT role FROM users WHERE id = ${userId} LIMIT 1
    `;

    return user?.role === "admin";
  } catch (error) {
    console.error("❌ Error checking permission:", error);
    return false;
  }
}
