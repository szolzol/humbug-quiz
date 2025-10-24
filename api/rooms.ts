/**
 * Unified Multiplayer Rooms API
 * Action-based routing to minimize Vercel function count (Hobby tier: ~12 functions max)
 * Supports: create, join, leave, start, state, answer, next
 *
 * Polling-based architecture:
 * - Clients poll /api/rooms?action=state every 3 seconds
 * - ETag/state_version for 304 Not Modified responses
 * - Session-based guest authentication (no account required)
 */

import { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import {
  query as dbQuery,
  queryOne,
  execute,
  generateUniqueRoomCode,
  isRoomJoinable,
  touchRoom,
  GameRoom,
  RoomPlayer,
  GameSession,
  PlayerAnswer,
} from "../lib/db-multiplayer";

// Standardized response format
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  stateVersion?: number; // For ETag optimization
}

// Response helper
function respond<T>(
  res: VercelResponse,
  success: boolean,
  data?: T,
  error?: string,
  statusCode: number = 200
): void {
  const response: ApiResponse<T> = { success };
  if (data !== undefined) response.data = data;
  if (error) response.error = error;

  res.status(statusCode).json(response);
}

// Session cookie management
const SESSION_COOKIE_NAME = "humbug_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getOrCreateSession(req: VercelRequest, res: VercelResponse): string {
  const cookies = cookie.parse(req.headers.cookie || "");
  let sessionId = cookies[SESSION_COOKIE_NAME];

  if (!sessionId) {
    sessionId = randomBytes(32).toString("hex");
    res.setHeader(
      "Set-Cookie",
      cookie.serialize(SESSION_COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE,
        path: "/",
      })
    );
  }

  return sessionId;
}

// User info from JWT token
interface AuthenticatedUser {
  userId: string;
  email: string;
  name: string;
  nickname?: string;
  picture: string;
  role: "free" | "premium" | "admin" | "creator";
}

/**
 * Get authenticated user from JWT cookie
 * Returns null if not authenticated or token invalid
 */
function getAuthenticatedUser(req: VercelRequest): AuthenticatedUser | null {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return null;

  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, jwtSecret) as any;
    return {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      nickname: decoded.nickname,
      picture: decoded.picture,
      role: decoded.role || "free",
    };
  } catch (error) {
    return null;
  }
}

/**
 * Get available question sets for user based on their role
 */
async function getAvailableQuestionSets(
  role: "free" | "premium" | "admin" | "creator"
): Promise<number[]> {
  // Admin and creators see all sets
  if (role === "admin" || role === "creator") {
    const sets = await dbQuery<{ id: number }>(
      `SELECT id FROM question_sets WHERE is_active = true ORDER BY display_order`
    );
    return sets.map((s) => s.id);
  }

  // Premium users see free + premium sets
  if (role === "premium") {
    const sets = await dbQuery<{ id: number }>(
      `SELECT id FROM question_sets 
       WHERE is_active = true 
       AND access_level IN ('free', 'premium')
       ORDER BY display_order`
    );
    return sets.map((s) => s.id);
  }

  // Free users only see free sets
  const sets = await dbQuery<{ id: number }>(
    `SELECT id FROM question_sets 
     WHERE is_active = true 
     AND access_level = 'free'
     ORDER BY display_order`
  );
  return sets.map((s) => s.id);
}

/**
 * Fuzzy answer matching with tolerance for typos and formatting
 * Returns true if user answer is "close enough" to any correct answer
 */
function fuzzyMatchAnswer(
  userAnswer: string,
  correctAnswers: string[]
): boolean {
  // Normalize function: lowercase, remove extra whitespace, remove common prefixes/suffixes
  const normalize = (str: string): string => {
    return (
      str
        .toLowerCase()
        .trim()
        // Remove common articles and prefixes
        .replace(/^(the|a|an|le|la|les|el|il|un|una)\s+/i, "")
        // Remove common suffixes (FC, CF, etc for football clubs)
        .replace(
          /\s+(fc|cf|afc|bfc|cfc|united|city|town|rovers|athletic|albion|wanderers)$/i,
          ""
        )
        // Remove special characters but keep alphanumeric and spaces
        .replace(/[^\w\s]/g, " ")
        // Normalize multiple spaces
        .replace(/\s+/g, " ")
        .trim()
    );
  };

  // Extract key words (ignore very short words)
  const extractKeyWords = (str: string): string[] => {
    return str
      .split(/\s+/)
      .filter((word) => word.length > 2) // Ignore 1-2 char words like "FC", "CF"
      .map((w) => w.toLowerCase());
  };

  const normalizedUser = normalize(userAnswer);
  const userWords = extractKeyWords(normalizedUser);

  // Check each correct answer
  for (const correct of correctAnswers) {
    const normalizedCorrect = normalize(correct);

    // Exact match after normalization
    if (normalizedUser === normalizedCorrect) {
      return true;
    }

    const correctWords = extractKeyWords(normalizedCorrect);

    // Calculate word overlap percentage
    if (correctWords.length === 0) continue;

    const matchingWords = userWords.filter((word) =>
      correctWords.some((cWord) => {
        // Exact word match
        if (word === cWord) return true;

        // Allow 1 character difference for short words (typo tolerance)
        if (word.length >= 3 && cWord.length >= 3) {
          return levenshteinDistance(word, cWord) <= 1;
        }

        return false;
      })
    );

    const overlapRatio = matchingWords.length / correctWords.length;

    // Accept if:
    // - All significant words match (100%)
    // - Or at least 75% of words match for multi-word answers
    if (
      overlapRatio === 1.0 ||
      (correctWords.length >= 2 && overlapRatio >= 0.75)
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Levenshtein distance - minimum edits to transform one string to another
 * Used for typo tolerance
 */
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Simple in-memory rate limiting (per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 120; // 120 requests per minute per IP (for polling)

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || record.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}

// Action validation schemas (using Zod)
const CreateRoomSchema = z.object({
  maxPlayers: z.number().min(2).max(10).optional().default(10),
  questionSetId: z.number().optional(),
});

const JoinRoomSchema = z.object({
  code: z.string().regex(/^[A-Z0-9]{6}$/, "Invalid room code format"),
  nickname: z.string().min(1).max(50).trim(),
});

const StartGameSchema = z.object({
  roomId: z.string().uuid(),
  questionSetId: z.number().optional(),
});

const AnswerSchema = z.object({
  roomId: z.string().uuid(),
  answer: z.string().min(1).max(200).trim(),
});

const NextQuestionSchema = z.object({
  roomId: z.string().uuid(),
});

const HumbugSchema = z.object({
  roomId: z.string().uuid(),
  answerId: z.number().int().positive(),
});

const StateSchema = z.object({
  roomId: z.string().uuid().optional(),
  code: z
    .string()
    .regex(/^[A-Z0-9]{6}$/)
    .optional(),
});

const LeaveRoomSchema = z.object({
  roomId: z.string().uuid(),
});

// Main handler
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // CORS headers (for local development)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, If-None-Match");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Get client IP for rate limiting
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    req.socket?.remoteAddress ||
    "unknown";

  // Check rate limit
  const rateLimit = checkRateLimit(ip);
  res.setHeader("X-RateLimit-Limit", RATE_LIMIT_MAX.toString());
  res.setHeader("X-RateLimit-Remaining", rateLimit.remaining.toString());

  if (!rateLimit.allowed) {
    return respond(res, false, undefined, "Rate limit exceeded", 429);
  }

  // Get or create session
  const sessionId = getOrCreateSession(req, res);

  // Parse action from query
  const action = (req.query.action as string) || "";

  try {
    // Route to appropriate action handler
    switch (action) {
      case "create":
        return await handleCreate(req, res, sessionId);

      case "join":
        return await handleJoin(req, res, sessionId);

      case "leave":
        return await handleLeave(req, res, sessionId);

      case "start":
        return await handleStart(req, res, sessionId);

      case "state":
        return await handleState(req, res, sessionId);

      case "answer":
        return await handleAnswer(req, res, sessionId);

      case "next":
        return await handleNext(req, res, sessionId);

      case "humbug":
        return await handleHumbug(req, res, sessionId);

      case "available-sets":
        return await handleAvailableSets(req, res);

      default:
        return respond(
          res,
          false,
          undefined,
          `Invalid action: ${action}. Supported: create, join, leave, start, state, answer, next, humbug, available-sets`,
          400
        );
    }
  } catch (error: any) {
    console.error(`[Rooms API] Error in action ${action}:`, error);
    return respond(
      res,
      false,
      undefined,
      error.message || "Internal server error",
      500
    );
  }
}

// Action handlers

/**
 * Get available question sets for current user based on their role
 */
async function handleAvailableSets(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== "GET") {
    return respond(res, false, undefined, "Method not allowed", 405);
  }

  try {
    const authUser = getAuthenticatedUser(req);
    const userRole = authUser?.role || "free";

    // Get available set IDs
    const availableSetIds = await getAvailableQuestionSets(userRole);

    // Get full set details
    const sets = await dbQuery<any>(
      `SELECT id, slug, name_en, name_hu, description_en, description_hu, 
              access_level, question_count, cover_image_url, icon_url
       FROM question_sets 
       WHERE id = ANY($1::int[]) AND is_active = true
       ORDER BY display_order`,
      [availableSetIds]
    );

    respond(res, true, {
      userRole,
      authenticated: !!authUser,
      sets,
    });
  } catch (error: any) {
    console.error("[Rooms] Available sets error:", error);
    respond(res, false, undefined, error.message, 500);
  }
}

async function handleCreate(
  req: VercelRequest,
  res: VercelResponse,
  sessionId: string
): Promise<void> {
  if (req.method !== "POST") {
    return respond(res, false, undefined, "Method not allowed", 405);
  }

  try {
    // Parse request body
    const body = CreateRoomSchema.parse(req.body);

    console.log("[Rooms] Create room request:", {
      sessionId,
      body,
      hasDbUrl: !!process.env.DATABASE_URL,
      hasPostgresUrl: !!process.env.POSTGRES_POSTGRES_URL,
    });

    // Generate unique room code
    const code = await generateUniqueRoomCode();
    console.log("[Rooms] Generated room code:", code);

    // Set expiration to 4 hours from now (UTC)
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

    // Create room
    const room = await queryOne<GameRoom>(
      `INSERT INTO game_rooms (code, host_session_id, max_players, question_set_id, state, state_version, expires_at)
       VALUES ($1, $2, $3, $4, 'lobby', 0, $5)
       RETURNING *`,
      [code, sessionId, body.maxPlayers, body.questionSetId || null, expiresAt]
    );

    if (!room) {
      throw new Error("Failed to create room");
    }

    console.log(
      `[Rooms] Created room ${code} (${room.id}) by session ${sessionId}`
    );

    respond(res, true, {
      roomId: room.id,
      code: room.code,
      state: room.state,
      maxPlayers: room.max_players,
      expiresAt: room.expires_at,
    });
  } catch (error: any) {
    console.error("[Rooms] Create error:", error);
    console.error("[Rooms] Error stack:", error.stack);
    respond(
      res,
      false,
      undefined,
      error.message || "Failed to create room",
      500
    );
  }
}

async function handleJoin(
  req: VercelRequest,
  res: VercelResponse,
  sessionId: string
): Promise<void> {
  if (req.method !== "POST") {
    return respond(res, false, undefined, "Method not allowed", 405);
  }

  const body = JoinRoomSchema.parse(req.body);

  try {
    // Get authenticated user (if logged in)
    const authUser = getAuthenticatedUser(req);

    // Use profile nickname if authenticated, otherwise use provided nickname
    const nickname = authUser?.nickname || body.nickname;

    // Check if room is joinable
    const joinCheck = await isRoomJoinable(body.code);

    if (!joinCheck.joinable) {
      return respond(res, false, undefined, joinCheck.reason, 400);
    }

    const roomId = joinCheck.roomId!;

    // Check if player already in room
    const existingPlayer = await queryOne<RoomPlayer>(
      `SELECT * FROM room_players WHERE room_id = $1 AND session_id = $2`,
      [roomId, sessionId]
    );

    if (existingPlayer) {
      // Update nickname if changed (from profile or manual)
      await execute(
        `UPDATE room_players 
         SET nickname = $1, last_seen = NOW()
         WHERE id = $2`,
        [nickname, existingPlayer.id]
      );

      console.log(
        `[Rooms] Player ${existingPlayer.id} (${nickname}) rejoined room ${body.code}`
      );

      return respond(res, true, {
        roomId,
        playerId: existingPlayer.id,
        isHost: existingPlayer.is_host,
        nickname,
        rejoined: true,
        authenticated: !!authUser,
      });
    }

    // Get room to check if creator is host
    const room = await queryOne<GameRoom>(
      `SELECT * FROM game_rooms WHERE id = $1`,
      [roomId]
    );

    if (!room) {
      return respond(res, false, undefined, "Room not found", 404);
    }

    const isHost = room.host_session_id === sessionId;

    // Insert new player
    const player = await queryOne<RoomPlayer>(
      `INSERT INTO room_players (room_id, session_id, nickname, is_host)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [roomId, sessionId, nickname, isHost]
    );

    if (!player) {
      throw new Error("Failed to join room");
    }

    // Touch room to update state_version
    await touchRoom(roomId);

    console.log(
      `[Rooms] Player ${player.id} (${nickname}) joined room ${body.code}`
    );

    respond(res, true, {
      roomId,
      playerId: player.id,
      isHost,
      nickname,
      authenticated: !!authUser,
      userRole: authUser?.role,
    });
  } catch (error: any) {
    console.error("[Rooms] Join error:", error);
    respond(res, false, undefined, error.message, 500);
  }
}

async function handleLeave(
  req: VercelRequest,
  res: VercelResponse,
  sessionId: string
): Promise<void> {
  if (req.method !== "POST") {
    return respond(res, false, undefined, "Method not allowed", 405);
  }

  const body = LeaveRoomSchema.parse(req.body);

  try {
    // Get player info
    const player = await queryOne<RoomPlayer>(
      `SELECT * FROM room_players 
       WHERE room_id = $1 AND session_id = $2`,
      [body.roomId, sessionId]
    );

    if (!player) {
      return respond(res, false, undefined, "Not in this room", 404);
    }

    // Remove player
    await execute(`DELETE FROM room_players WHERE id = $1`, [player.id]);

    // Check if room is now empty
    const remainingPlayers = await dbQuery<RoomPlayer>(
      `SELECT * FROM room_players WHERE room_id = $1`,
      [body.roomId]
    );

    if (remainingPlayers.length === 0) {
      // Delete empty room
      await execute(`DELETE FROM game_rooms WHERE id = $1`, [body.roomId]);
      console.log(`[Rooms] Deleted empty room ${body.roomId}`);
    } else {
      // If host left, assign new host
      if (player.is_host) {
        const newHost = remainingPlayers[0];
        await execute(`UPDATE room_players SET is_host = true WHERE id = $1`, [
          newHost.id,
        ]);
        console.log(`[Rooms] Transferred host to player ${newHost.id}`);
      }

      // Touch room to update state
      await touchRoom(body.roomId);
    }

    console.log(`[Rooms] Player ${player.id} left room ${body.roomId}`);

    respond(res, true, { left: true });
  } catch (error: any) {
    console.error("[Rooms] Leave error:", error);
    respond(res, false, undefined, error.message, 500);
  }
}

async function handleStart(
  req: VercelRequest,
  res: VercelResponse,
  sessionId: string
): Promise<void> {
  if (req.method !== "POST") {
    return respond(res, false, undefined, "Method not allowed", 405);
  }

  const body = StartGameSchema.parse(req.body);

  try {
    // Get room and verify host
    const room = await queryOne<GameRoom>(
      `SELECT * FROM game_rooms WHERE id = $1`,
      [body.roomId]
    );

    if (!room) {
      return respond(res, false, undefined, "Room not found", 404);
    }

    if (room.host_session_id !== sessionId) {
      return respond(
        res,
        false,
        undefined,
        "Only host can start the game",
        403
      );
    }

    if (room.state !== "lobby") {
      return respond(res, false, undefined, "Game already started", 400);
    }

    // Check minimum players
    const players = await dbQuery<RoomPlayer>(
      `SELECT * FROM room_players WHERE room_id = $1 ORDER BY joined_at ASC`,
      [body.roomId]
    );

    if (players.length < 2) {
      return respond(
        res,
        false,
        undefined,
        "Need at least 2 players to start",
        400
      );
    }

    // Get authenticated user to check question set access
    const authUser = getAuthenticatedUser(req);
    const userRole = authUser?.role || "free";

    // Get available question sets for user's role
    const availableSets = await getAvailableQuestionSets(userRole);

    if (availableSets.length === 0) {
      return respond(res, false, undefined, "No question sets available", 400);
    }

    // Determine which question set to use
    let questionSetId = body.questionSetId;

    // If no set specified, use first available (usually Free Pack)
    if (!questionSetId) {
      questionSetId = availableSets[0];
    }

    // Verify user has access to requested set
    if (!availableSets.includes(questionSetId)) {
      return respond(
        res,
        false,
        undefined,
        `You don't have access to this question set. Available sets: ${availableSets.join(
          ", "
        )}`,
        403
      );
    }

    // Get question set info for total questions
    const questionSet = await queryOne<{ id: number; question_count: number }>(
      `SELECT id, question_count FROM question_sets WHERE id = $1`,
      [questionSetId]
    );

    if (!questionSet) {
      return respond(res, false, undefined, "Question set not found", 404);
    }

    const totalQuestions = Math.min(10, questionSet.question_count); // Max 10 questions per game
    const minQuestions = 3; // Minimum for testing

    const questions = await dbQuery<{ id: number }>(
      `SELECT id FROM questions 
       WHERE set_id = $1 AND is_active = true
       ORDER BY RANDOM() 
       LIMIT $2`,
      [questionSetId, totalQuestions]
    );

    if (questions.length < minQuestions) {
      return respond(
        res,
        false,
        undefined,
        `Not enough questions in set (need at least ${minQuestions}, found ${questions.length})`,
        400
      );
    }

    const questionIds = questions.map((q) => q.id);
    const firstQuestionId = questionIds[0];
    const firstPlayerId = players[0].id;
    const actualTotalQuestions = questions.length; // Use actual count

    // Create game session
    await queryOne(
      `INSERT INTO multiplayer_sessions 
       (room_id, current_question_id, current_question_index, current_turn_player_id, 
        round_number, question_ids, total_questions)
       VALUES ($1, $2, 0, $3, 1, $4, $5)
       RETURNING *`,
      [
        body.roomId,
        firstQuestionId,
        firstPlayerId,
        questionIds,
        actualTotalQuestions,
      ]
    );

    // Update room state
    await execute(
      `UPDATE game_rooms 
       SET state = 'playing', 
           question_set_id = $2,
           state_version = state_version + 1 
       WHERE id = $1`,
      [body.roomId, questionSetId]
    );

    console.log(
      `[Rooms] Game started in room ${room.code} with ${players.length} players, set ${questionSetId} (${actualTotalQuestions} questions), host role: ${userRole}`
    );

    respond(res, true, {
      started: true,
      totalQuestions,
      firstPlayerId,
    });
  } catch (error: any) {
    console.error("[Rooms] Start error:", error);
    respond(res, false, undefined, error.message, 500);
  }
}

async function handleState(
  req: VercelRequest,
  res: VercelResponse,
  sessionId: string
): Promise<void> {
  if (req.method !== "GET") {
    return respond(res, false, undefined, "Method not allowed", 405);
  }

  const queryParams = StateSchema.parse(req.query);

  try {
    // Get room by ID or code
    let room: GameRoom | null = null;

    if (queryParams.roomId) {
      room = await queryOne<GameRoom>(
        `SELECT * FROM game_rooms WHERE id = $1`,
        [queryParams.roomId]
      );
    } else if (queryParams.code) {
      room = await queryOne<GameRoom>(
        `SELECT * FROM game_rooms WHERE code = $1`,
        [queryParams.code]
      );
    } else {
      return respond(res, false, undefined, "roomId or code required", 400);
    }

    if (!room) {
      return respond(res, false, undefined, "Room not found", 404);
    }

    // Check ETag for 304 Not Modified optimization
    const clientETag = req.headers["if-none-match"];
    const serverETag = `"${room.state_version}"`;

    if (clientETag === serverETag) {
      res.setHeader("ETag", serverETag);
      res.status(304).end();
      return;
    }

    // Get players in room (ordered by joined_at)
    const players = await dbQuery<RoomPlayer>(
      `SELECT * FROM room_players 
       WHERE room_id = $1 
       ORDER BY joined_at ASC`,
      [room.id]
    );

    // Get game session if playing
    let gameState = null;
    if (room.state === "playing") {
      const session = await queryOne(
        `SELECT ms.*, 
                q.question_en, 
                q.question_hu,
                q.category,
                rp.nickname as current_player_nickname
         FROM multiplayer_sessions ms
         LEFT JOIN questions q ON ms.current_question_id = q.id
         LEFT JOIN room_players rp ON ms.current_turn_player_id = rp.id
         WHERE ms.room_id = $1`,
        [room.id]
      );

      if (session) {
        // Get recent answers for current question (for HUMBUG mechanic)
        const recentAnswers = await dbQuery(
          `SELECT pa.*, rp.nickname as player_nickname
           FROM player_answers pa
           JOIN room_players rp ON pa.player_id = rp.id
           WHERE pa.session_id = $1 
           AND pa.question_id = $2
           ORDER BY pa.submitted_at DESC
           LIMIT 10`,
          [session.id, session.current_question_id]
        );

        gameState = {
          currentQuestionIndex: session.current_question_index,
          totalQuestions: session.total_questions,
          roundNumber: session.round_number,
          currentQuestion: session.question_en
            ? {
                id: session.current_question_id,
                textEn: session.question_en,
                textHu: session.question_hu,
                category: session.category,
              }
            : null,
          currentTurnPlayerId: session.current_turn_player_id,
          currentPlayerNickname: session.current_player_nickname,
          humbugDeadline: session.humbug_deadline,
          lastHumbugEvent: session.last_humbug_event, // Broadcast HUMBUG results to all players
          recentAnswers: recentAnswers.map((a: any) => ({
            answerId: a.id,
            playerNickname: a.player_nickname,
            answerText: a.answer_text,
            isCorrect: a.is_correct,
            pointsEarned: a.points_earned,
            submittedAt: a.submitted_at,
            revealed: a.revealed,
            humbugCalledBy: a.humbug_called_by,
          })),
        };
      }
    }

    // Find current player info
    const currentPlayer = players.find(
      (p: RoomPlayer) => p.session_id === sessionId
    );

    const stateData = {
      room: {
        id: room.id,
        code: room.code,
        state: room.state,
        maxPlayers: room.max_players,
        stateVersion: room.state_version,
        expiresAt: room.expires_at,
      },
      players: players.map((p: RoomPlayer) => ({
        id: p.id,
        nickname: p.nickname,
        lives: p.lives,
        score: p.score,
        isHost: p.is_host,
        isCurrentPlayer: currentPlayer?.id === p.id,
        joinedAt: p.joined_at,
      })),
      currentPlayer: currentPlayer
        ? {
            id: currentPlayer.id,
            nickname: currentPlayer.nickname,
            isHost: currentPlayer.is_host,
          }
        : null,
      gameState,
    };

    res.setHeader("ETag", serverETag);
    res.setHeader("Cache-Control", "no-cache, must-revalidate");

    respond(res, true, stateData);
  } catch (error: any) {
    console.error("[Rooms] State error:", error);
    respond(res, false, undefined, error.message, 500);
  }
}

async function handleAnswer(
  req: VercelRequest,
  res: VercelResponse,
  sessionId: string
): Promise<void> {
  if (req.method !== "POST") {
    return respond(res, false, undefined, "Method not allowed", 405);
  }

  const body = AnswerSchema.parse(req.body);

  try {
    // Get current player
    const player = await queryOne<RoomPlayer>(
      `SELECT * FROM room_players WHERE room_id = $1 AND session_id = $2`,
      [body.roomId, sessionId]
    );

    if (!player) {
      return respond(res, false, undefined, "Not in this room", 404);
    }

    // Get game session with all accepted answers
    const session = await queryOne<any>(
      `SELECT ms.*, 
              COALESCE(
                json_agg(DISTINCT a.answer_en) FILTER (WHERE a.answer_en IS NOT NULL),
                '[]'::json
              ) as answers_en,
              COALESCE(
                json_agg(DISTINCT a.answer_hu) FILTER (WHERE a.answer_hu IS NOT NULL),
                '[]'::json
              ) as answers_hu
       FROM multiplayer_sessions ms
       LEFT JOIN questions q ON ms.current_question_id = q.id
       LEFT JOIN answers a ON a.question_id = q.id
       WHERE ms.room_id = $1
       GROUP BY ms.id`,
      [body.roomId]
    );

    if (!session) {
      return respond(res, false, undefined, "Game not started", 400);
    }

    // Check if it's player's turn
    if (session.current_turn_player_id !== player.id) {
      return respond(res, false, undefined, "Not your turn", 403);
    }

    // Combine all allowed answers (both languages)
    const allowedAnswers: string[] = [
      ...(session.answers_en || []),
      ...(session.answers_hu || []),
    ].filter(Boolean);

    // Check answer with fuzzy matching (tolerates typos, missing articles, etc.)
    const isCorrect = fuzzyMatchAnswer(body.answer, allowedAnswers);

    const pointsEarned = isCorrect ? 10 : 0;

    // Record answer (revealed = FALSE, awaiting HUMBUG challenge)
    const answer = await queryOne(
      `INSERT INTO player_answers 
       (session_id, player_id, question_id, answer_text, is_correct, points_earned, round_number, revealed)
       VALUES ($1::INTEGER, $2::INTEGER, $3::INTEGER, $4::TEXT, $5::BOOLEAN, $6::INTEGER, $7::INTEGER, FALSE)
       RETURNING *`,
      [
        session.id,
        player.id,
        session.current_question_id,
        body.answer,
        isCorrect,
        pointsEarned,
        session.round_number,
      ]
    );

    // Set HUMBUG deadline (30 seconds from now)
    const humbugDeadline = new Date(Date.now() + 30000); // 30 seconds
    await execute(
      `UPDATE multiplayer_sessions 
       SET last_answer_at = NOW(), humbug_deadline = $1
       WHERE id = $2`,
      [humbugDeadline, session.id]
    );

    // Update player stats ONLY if correct (wrong answers wait for HUMBUG or timeout)
    if (isCorrect) {
      await execute(
        `UPDATE room_players SET score = score + $1::INTEGER WHERE id = $2`,
        [pointsEarned, player.id]
      );
    }
    // If wrong answer, life will be deducted ONLY after:
    // 1. HUMBUG is called and confirms wrong answer, OR
    // 2. 30-second timer expires without HUMBUG

    // Auto-advance to next player's turn (turn rotation)
    const allPlayers = await dbQuery<RoomPlayer>(
      `SELECT * FROM room_players WHERE room_id = $1 ORDER BY joined_at ASC`,
      [body.roomId]
    );

    const currentPlayerIndex = allPlayers.findIndex(
      (p) => p.id === session.current_turn_player_id
    );
    const nextPlayerIndex = (currentPlayerIndex + 1) % allPlayers.length;
    const nextPlayerId = allPlayers[nextPlayerIndex].id;

    // Update turn to next player
    await execute(
      `UPDATE multiplayer_sessions 
       SET current_turn_player_id = $1, last_updated = NOW()
       WHERE room_id = $2`,
      [nextPlayerId, body.roomId]
    );

    // Touch room (bumps state_version for polling)
    await touchRoom(body.roomId);

    console.log(
      `[Rooms] Player ${player.nickname} answered "${body.answer}" - ${
        isCorrect ? "CORRECT" : "WRONG"
      } (revealed=FALSE, awaiting HUMBUG) | Next turn: ${
        allPlayers[nextPlayerIndex].nickname
      }`
    );

    respond(res, true, {
      correct: isCorrect,
      pointsEarned,
      livesRemaining: player.lives, // Lives unchanged - penalty only after HUMBUG or timeout
      nextPlayer: allPlayers[nextPlayerIndex].nickname,
      awaitingHumbug: true, // Flag to indicate 30-second HUMBUG window is active
    });
  } catch (error: any) {
    console.error("[Rooms] Answer error:", error);
    respond(res, false, undefined, error.message, 500);
  }
}

async function handleNext(
  req: VercelRequest,
  res: VercelResponse,
  sessionId: string
): Promise<void> {
  if (req.method !== "POST") {
    return respond(res, false, undefined, "Method not allowed", 405);
  }

  const body = NextQuestionSchema.parse(req.body);

  try {
    // Verify host
    const room = await queryOne<GameRoom>(
      `SELECT * FROM game_rooms WHERE id = $1`,
      [body.roomId]
    );

    if (!room) {
      return respond(res, false, undefined, "Room not found", 404);
    }

    if (room.host_session_id !== sessionId) {
      return respond(res, false, undefined, "Only host can advance", 403);
    }

    // Get session
    const session = await queryOne<any>(
      `SELECT * FROM multiplayer_sessions WHERE room_id = $1`,
      [body.roomId]
    );

    if (!session) {
      return respond(res, false, undefined, "Game not started", 400);
    }

    // Get all active players
    const players = await dbQuery<RoomPlayer>(
      `SELECT * FROM room_players 
       WHERE room_id = $1 AND lives > 0 
       ORDER BY joined_at ASC`,
      [body.roomId]
    );

    if (players.length === 0) {
      // Game over - all players eliminated
      await execute(
        `UPDATE game_rooms SET state = 'finished', state_version = state_version + 1 WHERE id = $1`,
        [body.roomId]
      );

      return respond(res, true, { gameOver: true, reason: "all_eliminated" });
    }

    // Advance to next question or next player
    const nextQuestionIndex = session.current_question_index + 1;

    if (nextQuestionIndex >= session.total_questions) {
      // Game over - all questions answered
      await execute(
        `UPDATE game_rooms SET state = 'finished', state_version = state_version + 1 WHERE id = $1`,
        [body.roomId]
      );

      // Get final scores
      const finalScores = await dbQuery(
        `SELECT nickname, score, lives 
         FROM room_players 
         WHERE room_id = $1 
         ORDER BY score DESC, lives DESC`,
        [body.roomId]
      );

      return respond(res, true, {
        gameOver: true,
        reason: "completed",
        finalScores,
      });
    }

    // Move to next player (round-robin)
    const currentPlayerIndex = players.findIndex(
      (p: RoomPlayer) => p.id === session.current_turn_player_id
    );
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    const nextPlayer = players[nextPlayerIndex];

    // Update session
    const nextQuestionId = session.question_ids[nextQuestionIndex];
    const newRound =
      nextPlayerIndex === 0 ? session.round_number + 1 : session.round_number;

    await execute(
      `UPDATE multiplayer_sessions 
       SET current_question_index = $1,
           current_question_id = $2,
           current_turn_player_id = $3,
           round_number = $4,
           last_humbug_event = NULL,
           last_updated = NOW()
       WHERE id = $5`,
      [nextQuestionIndex, nextQuestionId, nextPlayer.id, newRound, session.id]
    );

    await touchRoom(body.roomId);

    console.log(
      `[Rooms] Advanced to question ${nextQuestionIndex + 1}/${
        session.total_questions
      }, player ${nextPlayer.nickname}`
    );

    respond(res, true, {
      nextQuestionIndex,
      nextPlayerId: nextPlayer.id,
      roundNumber: newRound,
    });
  } catch (error: any) {
    console.error("[Rooms] Next error:", error);
    respond(res, false, undefined, error.message, 500);
  }
}

/**
 * Handle HUMBUG call - challenge the previous answer
 */
async function handleHumbug(
  req: VercelRequest,
  res: VercelResponse,
  sessionId: string
): Promise<void> {
  try {
    const body = HumbugSchema.parse(req.body);

    // Get challenger (current player) - session_id is directly in room_players
    const challenger = await queryOne<RoomPlayer>(
      `SELECT * FROM room_players 
       WHERE session_id = $1 AND room_id = $2`,
      [sessionId, body.roomId]
    );

    if (!challenger) {
      return respond(res, false, undefined, "Player not found in room", 403);
    }

    // Get the answer being challenged
    const answer = await queryOne<PlayerAnswer>(
      `SELECT pa.*, rp.nickname as answerer_nickname
       FROM player_answers pa
       INNER JOIN room_players rp ON pa.player_id = rp.id
       WHERE pa.id = $1`,
      [body.answerId]
    );

    if (!answer) {
      return respond(res, false, undefined, "Answer not found", 404);
    }

    // Get session to check timer
    const session = await queryOne<GameSession>(
      `SELECT * FROM multiplayer_sessions WHERE room_id = $1`,
      [body.roomId]
    );

    if (!session) {
      return respond(res, false, undefined, "Game session not found", 404);
    }

    // Check if HUMBUG timer has expired
    const now = new Date();
    const deadline = session.humbug_deadline
      ? new Date(session.humbug_deadline)
      : null;

    if (!deadline || now > deadline) {
      return respond(
        res,
        false,
        undefined,
        "HUMBUG timer expired (30 seconds passed)",
        400
      );
    }

    // Check if already revealed
    if (answer.revealed) {
      return respond(
        res,
        false,
        undefined,
        "This answer has already been revealed",
        400
      );
    }

    // Check if challenger is the answerer (can't HUMBUG yourself)
    if (challenger.id === answer.player_id) {
      return respond(
        res,
        false,
        undefined,
        "You cannot HUMBUG your own answer",
        400
      );
    }

    // Reveal the answer and record who called HUMBUG
    await execute(
      `UPDATE player_answers 
       SET revealed = TRUE, humbug_called_by = $1
       WHERE id = $2`,
      [challenger.id, answer.id]
    );

    // Apply penalty based on answer correctness
    let penaltyTarget: "challenger" | "answerer";
    let penaltyPlayerId: number;
    let penaltyPlayerName: string;
    const answererName = answer.answerer_nickname || "Unknown";

    if (answer.is_correct) {
      // Answer was CORRECT - challenger was wrong, loses 1 life
      penaltyTarget = "challenger";
      penaltyPlayerId = challenger.id;
      penaltyPlayerName = challenger.nickname;

      await execute(`UPDATE room_players SET lives = lives - 1 WHERE id = $1`, [
        challenger.id,
      ]);

      console.log(
        `[Rooms] HUMBUG: ${challenger.nickname} challenged CORRECT answer by ${answererName} - CHALLENGER loses 1 life`
      );
    } else {
      // Answer was WRONG - challenger was right, answerer loses 1 life
      penaltyTarget = "answerer";
      penaltyPlayerId = answer.player_id;
      penaltyPlayerName = answererName;

      await execute(`UPDATE room_players SET lives = lives - 1 WHERE id = $1`, [
        answer.player_id,
      ]);

      console.log(
        `[Rooms] HUMBUG: ${challenger.nickname} challenged WRONG answer by ${answererName} - ANSWERER loses 1 life`
      );
    }

    // Check if penalty caused elimination
    const penalizedPlayer = await queryOne<RoomPlayer>(
      `SELECT * FROM room_players WHERE id = $1`,
      [penaltyPlayerId]
    );

    const eliminated = penalizedPlayer && penalizedPlayer.lives <= 0;

    if (eliminated) {
      console.log(`[Rooms] Player ${penaltyPlayerName} ELIMINATED (0 lives)`);
    }

    // Store HUMBUG event in session for broadcasting to all players
    const humbugEvent = {
      answerId: answer.id,
      challengerId: challenger.id,
      challengerName: challenger.nickname,
      answererId: answer.player_id,
      answererName,
      answerText: answer.answer_text,
      answerWasCorrect: answer.is_correct,
      penaltyTarget,
      penaltyPlayerName,
      eliminated,
      livesRemaining: penalizedPlayer?.lives || 0,
      timestamp: new Date().toISOString(),
    };

    await execute(
      `UPDATE multiplayer_sessions 
       SET last_humbug_event = $1
       WHERE room_id = $2`,
      [JSON.stringify(humbugEvent), body.roomId]
    );

    // Touch room to bump state_version
    await touchRoom(body.roomId);

    respond(res, true, humbugEvent);
  } catch (error: any) {
    console.error("[Rooms] HUMBUG error:", error);
    respond(res, false, undefined, error.message, 500);
  }
}
