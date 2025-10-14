import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

/**
 * Google OAuth Callback Endpoint
 * Exchanges authorization code for user info and creates JWT session
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code } = req.query;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const jwtSecret = process.env.JWT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000";
  const redirectUri = `${appUrl}/api/auth/callback`;

  // Validate environment variables
  if (!clientId || !clientSecret || !jwtSecret) {
    return res.status(500).json({ error: "OAuth configuration missing" });
  }

  // Validate authorization code
  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Authorization code missing" });
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error("Token exchange failed:", error);
      return res
        .status(500)
        .json({ error: "Failed to exchange authorization code" });
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    // Fetch user info from Google
    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    if (!userResponse.ok) {
      const error = await userResponse.text();
      console.error("User info fetch failed:", error);
      return res.status(500).json({ error: "Failed to fetch user info" });
    }

    const userData = await userResponse.json();
    const { id, email, name, picture } = userData;

    // Create JWT token with user info
    const token = jwt.sign(
      {
        userId: id,
        email,
        name,
        picture,
      },
      jwtSecret,
      { expiresIn: "7d" } // Token valid for 7 days
    );

    // Set HTTP-only cookie with JWT
    const cookie = serialize("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      path: "/",
    });

    res.setHeader("Set-Cookie", cookie);

    // Redirect to home page
    res.redirect(302, appUrl);
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}
