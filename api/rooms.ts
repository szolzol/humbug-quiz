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

// Simple in-memory rate limiting (per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 60; // 60 requests per minute per IP

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

      default:
        return respond(
          res,
          false,
          undefined,
          `Invalid action: ${action}. Supported: create, join, leave, start, state, answer, next`,
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

// Action handlers (stubs - to be implemented)

async function handleCreate(
  req: VercelRequest,
  res: VercelResponse,
  sessionId: string
): Promise<void> {
  if (req.method !== "POST") {
    return respond(res, false, undefined, "Method not allowed", 405);
  }

  const body = CreateRoomSchema.parse(req.body);

  try {
    // Generate unique room code
    const code = await generateUniqueRoomCode();

    // Create room
    const room = await queryOne<GameRoom>(
      `INSERT INTO game_rooms (code, host_session_id, max_players, question_set_id, state, state_version)
       VALUES ($1, $2, $3, $4, 'lobby', 0)
       RETURNING *`,
      [code, sessionId, body.maxPlayers, body.questionSetId || null]
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
    respond(res, false, undefined, error.message, 500);
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
      // Update nickname if changed
      await execute(
        `UPDATE room_players 
         SET nickname = $1, last_seen = NOW()
         WHERE id = $2`,
        [body.nickname, existingPlayer.id]
      );

      console.log(
        `[Rooms] Player ${existingPlayer.id} rejoined room ${body.code}`
      );

      return respond(res, true, {
        roomId,
        playerId: existingPlayer.id,
        rejoined: true,
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
      [roomId, sessionId, body.nickname, isHost]
    );

    if (!player) {
      throw new Error("Failed to join room");
    }

    // Touch room to update state_version
    await touchRoom(roomId);

    console.log(
      `[Rooms] Player ${player.id} (${body.nickname}) joined room ${body.code}`
    );

    respond(res, true, {
      roomId,
      playerId: player.id,
      isHost,
      nickname: player.nickname,
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

    // Get random questions from the set
    const questionSetId = body.questionSetId || room.question_set_id || 1;
    const totalQuestions = 10; // MVP: fixed 10 questions per game

    const questions = await dbQuery<{ id: number }>(
      `SELECT id FROM questions 
       WHERE set_id = $1 
       ORDER BY RANDOM() 
       LIMIT $2`,
      [questionSetId, totalQuestions]
    );

    if (questions.length < totalQuestions) {
      return respond(
        res,
        false,
        undefined,
        `Not enough questions in set (need ${totalQuestions}, found ${questions.length})`,
        400
      );
    }

    const questionIds = questions.map((q) => q.id);
    const firstQuestionId = questionIds[0];
    const firstPlayerId = players[0].id;

    // Create game session
    await queryOne(
      `INSERT INTO multiplayer_sessions 
       (room_id, current_question_id, current_question_index, current_turn_player_id, 
        round_number, question_ids, total_questions)
       VALUES ($1, $2, 0, $3, 1, $4, $5)
       RETURNING *`,
      [body.roomId, firstQuestionId, firstPlayerId, questionIds, totalQuestions]
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
      `[Rooms] Game started in room ${room.code} with ${players.length} players`
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
                q.question_text, 
                q.category,
                rp.nickname as current_player_nickname
         FROM multiplayer_sessions ms
         LEFT JOIN questions q ON ms.current_question_id = q.id
         LEFT JOIN room_players rp ON ms.current_turn_player_id = rp.id
         WHERE ms.room_id = $1`,
        [room.id]
      );

      if (session) {
        gameState = {
          currentQuestionIndex: session.current_question_index,
          totalQuestions: session.total_questions,
          roundNumber: session.round_number,
          currentQuestion: session.question_text
            ? {
                id: session.current_question_id,
                text: session.question_text,
                category: session.category,
              }
            : null,
          currentTurnPlayerId: session.current_turn_player_id,
          currentPlayerNickname: session.current_player_nickname,
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

    // Get game session
    const session = await queryOne<any>(
      `SELECT ms.*, q.allowed_answers 
       FROM multiplayer_sessions ms
       LEFT JOIN questions q ON ms.current_question_id = q.id
       WHERE ms.room_id = $1`,
      [body.roomId]
    );

    if (!session) {
      return respond(res, false, undefined, "Game not started", 400);
    }

    // Check if it's player's turn
    if (session.current_turn_player_id !== player.id) {
      return respond(res, false, undefined, "Not your turn", 403);
    }

    // Check answer (exact match for MVP, case-insensitive)
    const allowedAnswers: string[] = session.allowed_answers || [];
    const normalizedAnswer = body.answer.toLowerCase().trim();
    const isCorrect = allowedAnswers.some(
      (allowed: string) => allowed.toLowerCase().trim() === normalizedAnswer
    );

    const pointsEarned = isCorrect ? 10 : 0;

    // Record answer
    await queryOne(
      `INSERT INTO player_answers 
       (session_id, player_id, question_id, answer_text, is_correct, points_earned, round_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
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

    // Update player stats
    if (isCorrect) {
      await execute(
        `UPDATE room_players SET score = score + $1 WHERE id = $2`,
        [pointsEarned, player.id]
      );
    } else {
      await execute(`UPDATE room_players SET lives = lives - 1 WHERE id = $2`, [
        player.id,
      ]);
    }

    // Touch room
    await touchRoom(body.roomId);

    console.log(
      `[Rooms] Player ${player.id} answered "${body.answer}" - ${
        isCorrect ? "CORRECT" : "WRONG"
      }`
    );

    respond(res, true, {
      correct: isCorrect,
      pointsEarned,
      livesRemaining: isCorrect ? player.lives : player.lives - 1,
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
