/**
 * API Route: GET /api/questions/:packSlug
 *
 * Returns all questions and answers for a specific question pack
 */

import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  try {
    // Extract pack slug from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    const packSlug = pathParts[pathParts.length - 1];

    if (!packSlug) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing pack slug",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

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

    // Fetch question set
    const questionSets = await sql`
      SELECT 
        id,
        slug,
        name_en,
        name_hu,
        description_en,
        description_hu
      FROM question_sets
      WHERE slug = ${packSlug} AND is_active = true AND is_published = true
    `;

    if (questionSets.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Question pack not found",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const questionSet = questionSets[0];

    // Fetch questions with answers
    const questions = await sql`
      SELECT 
        q.id,
        q.question_en,
        q.question_hu,
        q.category,
        q.difficulty,
        q.source_name,
        q.source_url,
        q.order_index,
        json_agg(
          json_build_object(
            'id', a.id,
            'answer_en', a.answer_en,
            'answer_hu', a.answer_hu,
            'order_index', a.order_index
          ) ORDER BY a.order_index
        ) as answers
      FROM questions q
      LEFT JOIN answers a ON a.question_id = q.id
      WHERE q.set_id = ${questionSet.id} AND q.is_active = true
      GROUP BY q.id, q.question_en, q.question_hu, q.category, 
               q.difficulty, q.source_name, q.source_url, q.order_index
      ORDER BY q.order_index ASC
    `;

    return new Response(
      JSON.stringify({
        success: true,
        questionSet,
        questions,
        count: questions.length,
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
    console.error("Error fetching questions:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to fetch questions",
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
