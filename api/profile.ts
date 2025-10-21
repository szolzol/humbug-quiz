/**
 * Profile API Endpoint
 * Handles user profile operations: get profile, update nickname, get progress stats
 */

import { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "@neondatabase/serverless";
import { neon } from "@neondatabase/serverless";

// Helper to get authenticated user from cookie
function getUserFromCookie(
  req: VercelRequest
): { userId: string; email: string } | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  const token = cookies.auth_token;
  if (!token) return null;

  try {
    const sessionData = JSON.parse(
      Buffer.from(token, "base64").toString("utf-8")
    );

    // Check expiration
    if (sessionData.exp && Date.now() > sessionData.exp) {
      return null;
    }

    return {
      userId: sessionData.id,
      email: sessionData.email,
    };
  } catch (error) {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserFromCookie(req);

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!process.env.POSTGRES_POSTGRES_URL) {
    return res.status(500).json({ error: "Database not configured" });
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_POSTGRES_URL,
  });

  try {
    // GET - Fetch profile data
    if (req.method === "GET") {
      const sql = neon(process.env.POSTGRES_POSTGRES_URL);

      // Get user profile
      const [profile] = await sql`
        SELECT id, email, name, nickname, picture, role, created_at
        FROM users
        WHERE id = ${user.userId}
        LIMIT 1
      `;

      if (!profile) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get progress per pack
      const packProgress = await sql`
        SELECT 
          qs.id,
          qs.slug,
          qs.name_en,
          qs.name_hu,
          COUNT(DISTINCT uqp.question_id) FILTER (WHERE uqp.last_viewed_at IS NOT NULL) as played_count,
          COUNT(DISTINCT uqp.question_id) FILTER (WHERE uqp.is_completed = true) as completed_count,
          (SELECT COUNT(*) FROM questions WHERE set_id = qs.id AND is_active = true) as total_questions
        FROM question_sets qs
        LEFT JOIN questions q ON q.set_id = qs.id AND q.is_active = true
        LEFT JOIN user_question_progress uqp ON uqp.question_id = q.id AND uqp.user_id = ${user.userId}
        WHERE qs.is_active = true AND qs.is_published = true
        GROUP BY qs.id, qs.slug, qs.name_en, qs.name_hu
        ORDER BY qs.name_en
      `;

      // Get overall stats
      const [stats] = await sql`
        SELECT 
          COUNT(DISTINCT question_id) FILTER (WHERE last_viewed_at IS NOT NULL) as total_played,
          COUNT(DISTINCT question_id) FILTER (WHERE is_completed = true) as total_completed
        FROM user_question_progress
        WHERE user_id = ${user.userId}
      `;

      // Get feedback given
      const [feedbackStats] = await sql`
        SELECT 
          COUNT(*) FILTER (WHERE vote = 1) as thumbs_up_given,
          COUNT(*) FILTER (WHERE vote = -1) as thumbs_down_given
        FROM question_feedback
        WHERE user_id = ${user.userId}
      `;

      await pool.end();

      return res.status(200).json({
        profile: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          nickname: profile.nickname,
          picture: profile.picture,
          role: profile.role,
          createdAt: profile.created_at,
        },
        packProgress: packProgress.map((pack) => ({
          id: pack.id,
          slug: pack.slug,
          nameEn: pack.name_en,
          nameHu: pack.name_hu,
          playedCount: parseInt(pack.played_count) || 0,
          completedCount: parseInt(pack.completed_count) || 0,
          totalQuestions: parseInt(pack.total_questions) || 0,
        })),
        stats: {
          totalPlayed: parseInt(stats?.total_played) || 0,
          totalCompleted: parseInt(stats?.total_completed) || 0,
          thumbsUpGiven: parseInt(feedbackStats?.thumbs_up_given) || 0,
          thumbsDownGiven: parseInt(feedbackStats?.thumbs_down_given) || 0,
        },
      });
    }

    // PUT - Update profile
    if (req.method === "PUT") {
      const { nickname } = req.body;

      if (!nickname || typeof nickname !== "string") {
        return res.status(400).json({ error: "Nickname is required" });
      }

      // Validate nickname (3-20 characters, alphanumeric + spaces/underscores)
      if (nickname.length < 3 || nickname.length > 20) {
        return res
          .status(400)
          .json({ error: "Nickname must be 3-20 characters" });
      }

      if (!/^[a-zA-Z0-9 _]+$/.test(nickname)) {
        return res.status(400).json({
          error:
            "Nickname can only contain letters, numbers, spaces, and underscores",
        });
      }

      // Update nickname
      await pool.query(
        `UPDATE users SET nickname = $1, updated_at = NOW() WHERE id = $2`,
        [nickname, user.userId]
      );

      await pool.end();

      return res.status(200).json({
        success: true,
        nickname,
      });
    }

    await pool.end();
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Profile API error:", error);
    await pool.end();
    return res.status(500).json({ error: "Internal server error" });
  }
}
