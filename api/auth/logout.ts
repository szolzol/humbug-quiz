import type { VercelRequest, VercelResponse } from "@vercel/node";
import { serialize } from "cookie";

/**
 * Logout Endpoint
 * Clears the auth_token cookie
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Clear auth cookie by setting it to expire immediately
  const cookie = serialize("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0, // Expire immediately
    path: "/",
  });

  res.setHeader("Set-Cookie", cookie);

  // Return success
  res.status(200).json({ success: true, message: "Logged out successfully" });
}
