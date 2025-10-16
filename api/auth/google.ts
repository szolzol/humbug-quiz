import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Google OAuth Redirect Endpoint
 * Redirects user to Google's OAuth consent screen
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  
  // Dynamically detect the current domain from request headers
  const host = req.headers.host || "localhost:5000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const appUrl = `${protocol}://${host}`;
  const redirectUri = `${appUrl}/api/auth/callback`;

  if (!clientId) {
    return res.status(500).json({ error: "Google OAuth not configured" });
  }

  // Build Google OAuth URL
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.append("client_id", clientId);
  googleAuthUrl.searchParams.append("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.append("response_type", "code");
  googleAuthUrl.searchParams.append("scope", "openid email profile");
  googleAuthUrl.searchParams.append("access_type", "offline");
  googleAuthUrl.searchParams.append("prompt", "consent");

  // Redirect to Google
  res.redirect(302, googleAuthUrl.toString());
}
