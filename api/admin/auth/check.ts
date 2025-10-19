import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import { parse } from "cookie";

/**
 * Admin Auth Check Endpoint
 * Verifies if the current user has admin access
 * Returns: { hasAccess: boolean, role: string | null, user: object | null }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
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
  const cookies = parse(req.headers.cookie || "");
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
        const { neon } = await import("@neondatabase/serverless");
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
