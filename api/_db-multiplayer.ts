/**
 * Database utilities for Multiplayer MVP
 * Uses Neon serverless with pooled connections (PgBouncer)
 */

import { Pool, neon } from "@neondatabase/serverless";

// Use pooled connection string for serverless environments
// Note: Using POSTGRES_POSTGRES_URL to match existing project convention
const DATABASE_URL =
  process.env.DATABASE_URL || process.env.POSTGRES_POSTGRES_URL;

if (!DATABASE_URL) {
  try {
    console.error(
      "[db-multiplayer] ERROR: DATABASE_URL or POSTGRES_POSTGRES_URL environment variable is required"
    );
    console.error(
      "[db-multiplayer] Available env vars:",
      Object.keys(process.env).filter(
        (k) => k.includes("POSTGRES") || k.includes("DATABASE")
      )
    );
  } catch (e) {
    console.error("[db-multiplayer] Could not log env vars:", e);
  }
}

// Use Pool for parameterized queries (not template literals)
// Lazy initialization to prevent crashes if env var missing
let pool: Pool | null = null;
let sql: ReturnType<typeof neon> | null = null;

function getPool(): Pool {
  if (!DATABASE_URL) {
    throw new Error(
      "Database not configured. DATABASE_URL or POSTGRES_POSTGRES_URL required"
    );
  }
  if (!pool) {
    pool = new Pool({ connectionString: DATABASE_URL });
  }
  return pool;
}

function getSql(): ReturnType<typeof neon> {
  if (!DATABASE_URL) {
    throw new Error(
      "Database not configured. DATABASE_URL or POSTGRES_POSTGRES_URL required"
    );
  }
  if (!sql) {
    sql = neon(DATABASE_URL);
  }
  return sql;
}

/**
 * Query helper with error handling and logging
 */
export async function query<T = any>(
  sqlQuery: string,
  params: any[] = []
): Promise<T[]> {
  const pool = getPool();

  try {
    const startTime = Date.now();
    const result = await pool.query(sqlQuery, params);
    const duration = Date.now() - startTime;

    // Log slow queries (>500ms)
    if (duration > 500) {
      console.warn(
        `[DB] Slow query (${duration}ms):`,
        sqlQuery.substring(0, 100)
      );
    }

    return result.rows as T[];
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
  callback: (client: any) => Promise<T>
): Promise<T> {
  const pool = getPool();

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("[DB] Transaction error:", error);
    throw error;
  } finally {
    client.release();
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
  const pool = getPool();

  const result = await pool.query(sqlQuery, params);
  return result.rowCount || 0;
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
  last_answer_at: Date | null;
  humbug_deadline: Date | null;
  last_humbug_event: any | null; // JSONB - last HUMBUG challenge result
  // For queries that include question data
  question_en?: string;
  question_hu?: string;
  answers_en?: string[];
  answers_hu?: string[];
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
  revealed: boolean;
  humbug_called_by: number | null;
  answerer_nickname?: string; // Added via JOIN in queries
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

  // Compare with UTC timestamps to avoid timezone issues
  const now = new Date();
  const expiresAt = new Date(room.expires_at);

  if (expiresAt < now) {
    console.log(
      `[DB] Room ${code} expired: expires=${expiresAt.toISOString()}, now=${now.toISOString()}`
    );
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
