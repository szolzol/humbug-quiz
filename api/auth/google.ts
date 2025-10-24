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

  // Debug logging
  console.log("🔍 OAuth Debug Info:");
  console.log("   Host header:", req.headers.host);
  console.log("   Detected host:", host);
  console.log("   Protocol:", protocol);
  console.log("   App URL:", appUrl);
  console.log("   Redirect URI:", redirectUri);

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
  // Use 'select_account' instead of 'consent' to allow faster login for returning users
  googleAuthUrl.searchParams.append("prompt", "select_account");

  // Redirect to Google
  res.redirect(302, googleAuthUrl.toString());
}
