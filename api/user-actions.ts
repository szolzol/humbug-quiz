import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "@neondatabase/serverless";
import jwt from "jsonwebtoken";

// Helper to parse user from session cookie
function getUserFromSession(req: VercelRequest) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  const token = cookies.auth_token;
  if (!token || !process.env.JWT_SECRET) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      userId: string;
      email: string;
      name: string;
      picture: string;
    };
    return decoded;
  } catch (error) {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Cookie"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Get authenticated user
  const user = getUserFromSession(req);
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Route by action
  const { action } = req.query;

  try {
    switch (action) {
      case "feedback":
        return await handleFeedback(req, res, user);
      case "progress":
        return await handleProgress(req, res, user);
      case "reset-progress":
        return await handleResetProgress(req, res, user);
      case "mark-completed":
        return await handleMarkCompleted(req, res, user);
      case "track-play":
        return await handleTrackPlay(req, res, user);
      default:
        return res.status(400).json({ error: "Invalid action" });
    }
  } catch (error) {
    console.error("User action error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Handle question feedback (thumbs up/down)
 * POST /api/user-actions?action=feedback
 * Body: { questionId: number, vote: 1 | -1 }
 */
async function handleFeedback(
  req: VercelRequest,
  res: VercelResponse,
  user: { userId: string }
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { questionId, vote } = req.body;

  if (!questionId || (vote !== 1 && vote !== -1)) {
    return res
      .status(400)
      .json({ error: "questionId and vote (1 or -1) required" });
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_POSTGRES_URL,
  });

  try {
    // Upsert feedback (update if exists, insert if not)
    await pool.query(
      `INSERT INTO question_feedback (question_id, user_id, vote, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (question_id, user_id)
       DO UPDATE SET vote = $3, updated_at = NOW()`,
      [questionId, user.userId, vote]
    );

    // Get updated counts
    const result = await pool.query(
      `SELECT thumbs_up_count, thumbs_down_count, feedback_score
       FROM questions WHERE id = $1`,
      [questionId]
    );

    return res.status(200).json({
      success: true,
      feedback: result.rows[0],
    });
  } catch (error) {
    console.error("Feedback error:", error);
    return res.status(500).json({ error: "Failed to save feedback" });
  } finally {
    await pool.end();
  }
}

/**
 * Handle question progress tracking
 * GET /api/user-actions?action=progress&questionId=123
 * POST /api/user-actions?action=progress
 * Body: { questionId: number, usedAnswers: number[] }
 */
async function handleProgress(
  req: VercelRequest,
  res: VercelResponse,
  user: { userId: string }
) {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_POSTGRES_URL,
  });

  try {
    if (req.method === "GET") {
      // Get user's progress for a question
      const { questionId } = req.query;

      if (!questionId) {
        return res.status(400).json({ error: "questionId required" });
      }

      const result = await pool.query(
        `SELECT used_answers, is_completed, completed_at
         FROM user_question_progress
         WHERE user_id = $1 AND question_id = $2`,
        [user.userId, questionId]
      );

      if (result.rows.length === 0) {
        return res.status(200).json({
          usedAnswers: [],
          isCompleted: false,
          completedAt: null,
        });
      }

      return res.status(200).json({
        usedAnswers: result.rows[0].used_answers || [],
        isCompleted: result.rows[0].is_completed,
        completedAt: result.rows[0].completed_at,
      });
    }

    if (req.method === "POST") {
      // Update user's progress (mark answers as used)
      const { questionId, usedAnswers } = req.body;

      if (!questionId || !Array.isArray(usedAnswers)) {
        return res
          .status(400)
          .json({ error: "questionId and usedAnswers array required" });
      }

      // Upsert progress
      await pool.query(
        `INSERT INTO user_question_progress (user_id, question_id, used_answers, last_viewed_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (user_id, question_id)
         DO UPDATE SET used_answers = $3, last_viewed_at = NOW()`,
        [user.userId, questionId, usedAnswers]
      );

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Progress error:", error);
    return res.status(500).json({ error: "Failed to save progress" });
  } finally {
    await pool.end();
  }
}

/**
 * Reset all marked answers for a question
 * POST /api/user-actions?action=reset-progress
 * Body: { questionId: number }
 */
async function handleResetProgress(
  req: VercelRequest,
  res: VercelResponse,
  user: { userId: string }
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { questionId } = req.body;

  if (!questionId) {
    return res.status(400).json({ error: "questionId required" });
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_POSTGRES_URL,
  });

  try {
    // Reset used answers and mark as not completed
    await pool.query(
      `INSERT INTO user_question_progress (user_id, question_id, used_answers, is_completed, last_viewed_at)
       VALUES ($1, $2, ARRAY[]::INTEGER[], false, NOW())
       ON CONFLICT (user_id, question_id)
       DO UPDATE SET used_answers = ARRAY[]::INTEGER[], is_completed = false, completed_at = NULL, last_viewed_at = NOW()`,
      [user.userId, questionId]
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Reset progress error:", error);
    return res.status(500).json({ error: "Failed to reset progress" });
  } finally {
    await pool.end();
  }
}

/**
 * Mark question as completed (ONCE PER USER)
 * POST /api/user-actions?action=mark-completed
 * Body: { questionId: number }
 */
async function handleMarkCompleted(
  req: VercelRequest,
  res: VercelResponse,
  user: { userId: string }
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { questionId } = req.body;

  if (!questionId) {
    return res.status(400).json({ error: "questionId required" });
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_POSTGRES_URL,
  });

  try {
    // Check if user already completed this question
    const existingResult = await pool.query(
      `SELECT is_completed FROM user_question_progress 
       WHERE user_id = $1 AND question_id = $2`,
      [user.userId, questionId]
    );

    const alreadyCompleted =
      existingResult.rows.length > 0 && existingResult.rows[0].is_completed;

    // Mark question as completed
    await pool.query(
      `INSERT INTO user_question_progress (user_id, question_id, is_completed, completed_at, last_viewed_at)
       VALUES ($1, $2, true, NOW(), NOW())
       ON CONFLICT (user_id, question_id)
       DO UPDATE SET is_completed = true, completed_at = NOW(), last_viewed_at = NOW()`,
      [user.userId, questionId]
    );

    // Increment times_completed counter ONLY if not already completed by this user
    if (!alreadyCompleted) {
      await pool.query(
        `UPDATE questions 
         SET times_completed = times_completed + 1, 
             updated_at = NOW() 
         WHERE id = $1`,
        [questionId]
      );
    }

    return res
      .status(200)
      .json({ success: true, wasAlreadyCompleted: alreadyCompleted });
  } catch (error) {
    console.error("Mark completed error:", error);
    return res.status(500).json({ error: "Failed to mark as completed" });
  } finally {
    await pool.end();
  }
}

/**
 * Track question play (ONCE PER USER)
 * POST /api/user-actions?action=track-play
 * Body: { questionId: number }
 */
async function handleTrackPlay(
  req: VercelRequest,
  res: VercelResponse,
  user: { userId: string }
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { questionId } = req.body;

  if (!questionId) {
    return res.status(400).json({ error: "questionId required" });
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_POSTGRES_URL,
  });

  try {
    // Check if user already has progress record (played before)
    const existingResult = await pool.query(
      `SELECT id FROM user_question_progress 
       WHERE user_id = $1 AND question_id = $2`,
      [user.userId, questionId]
    );

    const alreadyPlayed = existingResult.rows.length > 0;

    // Create or update progress record
    await pool.query(
      `INSERT INTO user_question_progress (user_id, question_id, last_viewed_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id, question_id)
       DO UPDATE SET last_viewed_at = NOW()`,
      [user.userId, questionId]
    );

    // Increment times_played counter ONLY if first time played by this user
    if (!alreadyPlayed) {
      await pool.query(
        `UPDATE questions 
         SET times_played = times_played + 1, 
             updated_at = NOW() 
         WHERE id = $1`,
        [questionId]
      );
    }

    return res
      .status(200)
      .json({ success: true, wasAlreadyPlayed: alreadyPlayed });
  } catch (error) {
    console.error("Track play error:", error);
    return res.status(500).json({ error: "Failed to track play" });
  } finally {
    await pool.end();
  }
}
