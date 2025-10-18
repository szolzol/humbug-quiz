/**
 * API Route: GET /api/question-sets
 *
 * Returns active question sets filtered by user authentication status:
 * - Unauthenticated users: Only 'free' question packs
 * - Authenticated users: Only 'premium' and 'admin_only' packs (excludes free pack)
 */

import { neon } from "@neondatabase/serverless";
import jwt from "jsonwebtoken";

export async function GET(request: Request) {
  try {
    // Check if database URL is configured
    if (!process.env.POSTGRES_POSTGRES_URL) {
      console.error("POSTGRES_POSTGRES_URL not configured");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Database not configured",
          message: "POSTGRES_POSTGRES_URL environment variable is missing",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const sql = neon(process.env.POSTGRES_POSTGRES_URL);

    // Check authentication status from cookie
    const cookieHeader = request.headers.get("cookie") || "";
    const authToken = cookieHeader
      .split(";")
      .find((c) => c.trim().startsWith("auth_token="))
      ?.split("=")[1];

    let isAuthenticated = false;
    let userRole = "free";

    if (authToken && process.env.JWT_SECRET) {
      try {
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET) as {
          userId: string;
          email: string;
        };
        if (decoded.userId) {
          isAuthenticated = true;
          // Optionally fetch user role from database
          const userResult = await sql`
            SELECT role FROM users WHERE id = ${decoded.userId}
          `;
          if (userResult.length > 0) {
            userRole = userResult[0].role;
          }
        }
      } catch (error) {
        // Invalid token, treat as unauthenticated
        console.log("Invalid or expired auth token");
      }
    }

    // Fetch question sets based on authentication status
    let questionSets;

    if (isAuthenticated) {
      // Authenticated users: Show ALL packs (free, premium, admin_only)
      questionSets = await sql`
        SELECT 
          id,
          slug,
          name_en,
          name_hu,
          description_en,
          description_hu,
          access_level,
          is_active,
          is_published,
          cover_image_url,
          icon_url,
          display_order,
          question_count,
          total_plays,
          metadata
        FROM question_sets
        WHERE is_active = true 
          AND is_published = true
        ORDER BY display_order ASC, created_at ASC
      `;
    } else {
      // Unauthenticated users: Show only free packs
      questionSets = await sql`
        SELECT 
          id,
          slug,
          name_en,
          name_hu,
          description_en,
          description_hu,
          access_level,
          is_active,
          is_published,
          cover_image_url,
          icon_url,
          display_order,
          question_count,
          total_plays,
          metadata
        FROM question_sets
        WHERE is_active = true 
          AND is_published = true
          AND access_level = 'free'
        ORDER BY display_order ASC, created_at ASC
      `;
    }

    return new Response(
      JSON.stringify({
        success: true,
        questionSets,
        count: questionSets.length,
        isAuthenticated,
        userRole,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          // Shorter cache for authenticated requests to reflect login changes faster
          "Cache-Control": isAuthenticated
            ? "private, max-age=60"
            : "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching question sets:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to fetch question sets",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
