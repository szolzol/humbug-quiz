import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import { parse } from "cookie";

/**
 * Session Check Endpoint
 * Verifies JWT token and returns user info
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res.status(500).json({ error: "JWT secret not configured" });
  }

  // Parse cookies from request
  const cookies = parse(req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) {
    return res.status(401).json({ authenticated: false, user: null });
  }

  try {
    // Verify and decode JWT token
    const decoded = jwt.verify(token, jwtSecret) as {
      userId: string;
      email: string;
      name: string;
      picture: string;
      role?: string; // Role might not exist in old tokens
    };

    // Return user info with role
    res.status(200).json({
      authenticated: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        role: decoded.role || "free", // Default to 'free' if not present
      },
    });
  } catch (error) {
    // Token invalid or expired
    console.error("JWT verification failed:", error);
    res.status(401).json({ authenticated: false, user: null });
  }
}
