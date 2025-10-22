/**
 * Database utilities for Multiplayer MVP
 * Uses Neon serverless with pooled connections (PgBouncer)
 */

import { neon } from "@neondatabase/serverless";

// Use pooled connection string for serverless environments
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Ensure we're using pooled connection (pgbouncer=true)
const pooledUrl = DATABASE_URL.includes("?")
  ? `${DATABASE_URL}&pgbouncer=true`
  : `${DATABASE_URL}?pgbouncer=true`;

export const sql = neon(pooledUrl);

/**
 * Query helper with error handling and logging
 */
export async function query<T = any>(
  sqlQuery: string,
  params: any[] = []
): Promise<T[]> {
  try {
    const startTime = Date.now();
    const result = await sql(sqlQuery, params);
    const duration = Date.now() - startTime;

    // Log slow queries (>500ms)
    if (duration > 500) {
      console.warn(
        `[DB] Slow query (${duration}ms):`,
        sqlQuery.substring(0, 100)
      );
    }

    return result as T[];
  } catch (error) {
    console.error("[DB] Query error:", error);
    console.error("[DB] Query:", sqlQuery);
    console.error("[DB] Params:", params);
    throw error;
  }
}

/**
 * Transaction wrapper for atomic operations
 * Note: Simplified for serverless - uses single connection per transaction
 */
export async function transaction<T>(
  callback: (tx: typeof sql) => Promise<T>
): Promise<T> {
  try {
    // In serverless, we rely on Neon's transaction handling
    // BEGIN/COMMIT happens automatically per request
    return await callback(sql);
  } catch (error) {
    console.error("[DB] Transaction error:", error);
    throw error;
  }
}

/**
 * Get single row or null
 */
export async function queryOne<T = any>(
  sqlQuery: string,
  params: any[] = []
): Promise<T | null> {
  const results = await query<T>(sqlQuery, params);
  return results.length > 0 ? results[0] : null;
}

/**
 * Execute a query and return affected row count
 */
export async function execute(
  sqlQuery: string,
  params: any[] = []
): Promise<number> {
  const result = await sql(sqlQuery, params);
  return result.length;
}

/**
 * Generate a unique 6-character room code
 */
export async function generateUniqueRoomCode(): Promise<string> {
  const MAX_ATTEMPTS = 10;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const result = await queryOne<{ generate_room_code: string }>(
      "SELECT generate_room_code()"
    );

    if (!result) {
      throw new Error("Failed to generate room code");
    }

    const code = result.generate_room_code;

    // Check if code already exists
    const existing = await queryOne(
      "SELECT id FROM game_rooms WHERE code = $1",
      [code]
    );

    if (!existing) {
      return code;
    }
  }

  throw new Error(
    "Failed to generate unique room code after multiple attempts"
  );
}

/**
 * Cleanup expired rooms (for cron job)
 */
export async function cleanupExpiredRooms(): Promise<number> {
  const result = await queryOne<{ deleted_count: number }>(
    "SELECT * FROM cleanup_expired_rooms()"
  );
  return result?.deleted_count || 0;
}

/**
 * Types for database tables
 */

export interface GameRoom {
  id: string;
  code: string;
  host_session_id: string;
  max_players: number;
  question_set_id: number | null;
  state: "lobby" | "playing" | "finished";
  state_version: number;
  last_activity: Date;
  created_at: Date;
  expires_at: Date;
}

export interface RoomPlayer {
  id: number;
  room_id: string;
  session_id: string;
  nickname: string;
  lives: number;
  score: number;
  is_host: boolean;
  joined_at: Date;
  last_seen: Date;
}

export interface GameSession {
  id: number;
  room_id: string;
  current_question_id: number | null;
  current_question_index: number;
  current_turn_player_id: number | null;
  round_number: number;
  question_ids: number[];
  total_questions: number;
  started_at: Date;
  last_updated: Date;
}

export interface PlayerAnswer {
  id: number;
  session_id: number;
  player_id: number;
  question_id: number;
  answer_text: string;
  is_correct: boolean;
  points_earned: number;
  submitted_at: Date;
  round_number: number;
}

/**
 * Helper to update room activity and bump state version
 */
export async function touchRoom(roomId: string): Promise<void> {
  await execute(
    `UPDATE game_rooms 
     SET last_activity = NOW(), 
         state_version = state_version + 1 
     WHERE id = $1`,
    [roomId]
  );
}

/**
 * Check if room exists and is joinable
 */
export async function isRoomJoinable(code: string): Promise<{
  joinable: boolean;
  reason?: string;
  roomId?: string;
}> {
  const room = await queryOne<GameRoom>(
    `SELECT * FROM game_rooms WHERE code = $1`,
    [code]
  );

  if (!room) {
    return { joinable: false, reason: "Room not found" };
  }

  if (room.state !== "lobby") {
    return { joinable: false, reason: "Game already started", roomId: room.id };
  }

  if (new Date(room.expires_at) < new Date()) {
    return { joinable: false, reason: "Room expired", roomId: room.id };
  }

  const playerCount = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM room_players WHERE room_id = $1`,
    [room.id]
  );

  if (playerCount && playerCount.count >= room.max_players) {
    return { joinable: false, reason: "Room is full", roomId: room.id };
  }

  return { joinable: true, roomId: room.id };
}
