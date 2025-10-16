/**
 * API Route: GET /api/question-sets
 *
 * Returns all active question sets with their metadata
 */

import { neon } from "@neondatabase/serverless";

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

    // Fetch all active question sets with question counts
    const questionSets = await sql`
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
      WHERE is_active = true AND is_published = true
      ORDER BY display_order ASC, created_at ASC
    `;

    return new Response(
      JSON.stringify({
        success: true,
        questionSets,
        count: questionSets.length,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
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
