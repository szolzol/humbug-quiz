/**
 * Backend Unit Test for Multiplayer API
 * Tests all 7 actions without browser
 */

import { config } from "dotenv";
import { Pool } from "@neondatabase/serverless";

// Load environment
config({ path: ".env.local" });

const DATABASE_URL =
  process.env.DATABASE_URL || process.env.POSTGRES_POSTGRES_URL;
const pool = new Pool({ connectionString: DATABASE_URL });

console.log("🧪 Testing Multiplayer Backend...\n");

// Test utilities
async function query(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows;
}

async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

async function execute(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rowCount || 0;
}

// Generate random room code
function generateRoomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

// Test functions
async function testCreateRoom() {
  console.log("1️⃣  Testing: Create Room");

  const code = generateRoomCode();
  const sessionId = "test-session-" + Date.now();
  const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

  const room = await queryOne(
    `INSERT INTO game_rooms (code, host_session_id, max_players, state, state_version, expires_at)
     VALUES ($1, $2, 10, 'lobby', 0, $3)
     RETURNING *`,
    [code, sessionId, expiresAt]
  );

  if (room && room.code === code) {
    console.log(`   ✅ Room created: ${code} (ID: ${room.id})`);
    return { room, sessionId };
  } else {
    throw new Error("Failed to create room");
  }
}

async function testJoinRoom(roomId, sessionId, nickname) {
  console.log(`\n2️⃣  Testing: Join Room (${nickname})`);

  // Check if room is joinable
  const room = await queryOne(`SELECT * FROM game_rooms WHERE id = $1`, [
    roomId,
  ]);

  if (!room) {
    throw new Error("Room not found");
  }

  const isHost = room.host_session_id === sessionId;

  const player = await queryOne(
    `INSERT INTO room_players (room_id, session_id, nickname, is_host)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [roomId, sessionId, nickname, isHost]
  );

  if (player) {
    console.log(
      `   ✅ Player joined: ${nickname} (ID: ${player.id}, Host: ${isHost})`
    );
    return player;
  } else {
    throw new Error("Failed to join room");
  }
}

async function testStartGame(roomId) {
  console.log(`\n3️⃣  Testing: Start Game`);

  // Get players
  const players = await query(
    `SELECT * FROM room_players WHERE room_id = $1 ORDER BY joined_at ASC`,
    [roomId]
  );

  if (players.length < 2) {
    throw new Error(`Need at least 2 players (found ${players.length})`);
  }

  // Get random questions from Free Pack (set_id = 1)
  const questions = await query(
    `SELECT id FROM questions WHERE set_id = 1 AND is_active = true ORDER BY RANDOM() LIMIT 4`
  );

  if (questions.length < 3) {
    throw new Error(`Need at least 3 questions (found ${questions.length})`);
  }

  const questionIds = questions.map((q) => q.id);
  const firstQuestionId = questionIds[0];
  const firstPlayerId = players[0].id;

  const session = await queryOne(
    `INSERT INTO multiplayer_sessions 
     (room_id, current_question_id, current_question_index, current_turn_player_id, 
      round_number, question_ids, total_questions)
     VALUES ($1, $2, 0, $3, 1, $4, $5)
     RETURNING *`,
    [roomId, firstQuestionId, firstPlayerId, questionIds, questions.length]
  );

  await execute(
    `UPDATE game_rooms SET state = 'playing', state_version = state_version + 1 WHERE id = $1`,
    [roomId]
  );

  console.log(
    `   ✅ Game started: ${questions.length} questions, first player: ${firstPlayerId}`
  );
  return session;
}

async function testSubmitAnswer(sessionId, playerId, roomId, answer) {
  console.log(`\n4️⃣  Testing: Submit Answer ("${answer}")`);

  // Get game session with answers
  const session = await queryOne(
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
    [roomId]
  );

  if (!session) {
    throw new Error("Game not started");
  }

  // Check turn
  if (session.current_turn_player_id !== playerId) {
    throw new Error(
      `Not player's turn (current: ${session.current_turn_player_id}, trying: ${playerId})`
    );
  }

  // Check answer
  const allowedAnswers = [
    ...(session.answers_en || []),
    ...(session.answers_hu || []),
  ].filter(Boolean);

  const normalizedAnswer = answer.toLowerCase().trim();
  const isCorrect = allowedAnswers.some(
    (allowed) => allowed.toLowerCase().trim() === normalizedAnswer
  );

  const pointsEarned = isCorrect ? 10 : 0;

  // Record answer (revealed = FALSE for HUMBUG)
  const answerRecord = await queryOne(
    `INSERT INTO player_answers 
     (session_id, player_id, question_id, answer_text, is_correct, points_earned, round_number, revealed)
     VALUES ($1::INTEGER, $2::INTEGER, $3::INTEGER, $4::TEXT, $5::BOOLEAN, $6::INTEGER, $7::INTEGER, FALSE)
     RETURNING *`,
    [
      session.id,
      playerId,
      session.current_question_id,
      answer,
      isCorrect,
      pointsEarned,
      session.round_number,
    ]
  );

  // Set HUMBUG deadline (30 seconds from now)
  const humbugDeadline = new Date(Date.now() + 30000);
  await execute(
    `UPDATE multiplayer_sessions 
     SET last_answer_at = NOW(), humbug_deadline = $1
     WHERE id = $2`,
    [humbugDeadline, session.id]
  );

  // Update player stats ONLY if correct (wrong answers wait for HUMBUG)
  if (isCorrect) {
    await execute(
      `UPDATE room_players SET score = score + $1::INTEGER WHERE id = $2`,
      [pointsEarned, playerId]
    );
  }
  // Wrong answers: life will be deducted by HUMBUG or timeout

  // Bump state version
  await execute(
    `UPDATE game_rooms SET state_version = state_version + 1 WHERE id = $1`,
    [roomId]
  );

  console.log(
    `   ${
      isCorrect ? "✅ CORRECT" : "❌ WRONG"
    }: +${pointsEarned} points (revealed=FALSE, awaiting HUMBUG)`
  );
  console.log(`   Allowed answers: ${allowedAnswers.join(", ")}`);
  console.log(`   Answer ID: ${answerRecord.id}`);

  return { isCorrect, pointsEarned, allowedAnswers, answerId: answerRecord.id };
}

async function testNextQuestion(roomId, sessionId) {
  console.log(`\n5️⃣  Testing: Next Question`);

  const session = await queryOne(
    `SELECT * FROM multiplayer_sessions WHERE room_id = $1`,
    [roomId]
  );

  if (!session) {
    throw new Error("Game not started");
  }

  const nextIndex =
    (session.current_question_index + 1) % session.total_questions;
  const nextQuestionId = session.question_ids[nextIndex];

  // Get next player
  const players = await query(
    `SELECT * FROM room_players WHERE room_id = $1 ORDER BY joined_at ASC`,
    [roomId]
  );

  const currentPlayerIndex = players.findIndex(
    (p) => p.id === session.current_turn_player_id
  );
  const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
  const nextPlayerId = players[nextPlayerIndex].id;

  await execute(
    `UPDATE multiplayer_sessions 
     SET current_question_index = $1,
         current_question_id = $2,
         current_turn_player_id = $3,
         last_updated = NOW()
     WHERE room_id = $4`,
    [nextIndex, nextQuestionId, nextPlayerId, roomId]
  );

  await execute(
    `UPDATE game_rooms SET state_version = state_version + 1 WHERE id = $1`,
    [roomId]
  );

  console.log(
    `   ✅ Advanced to question ${nextIndex + 1}/${
      session.total_questions
    }, next player: ${nextPlayerId}`
  );

  return { nextIndex, nextPlayerId };
}

async function testGetState(roomId) {
  console.log(`\n6️⃣  Testing: Get State`);

  const room = await queryOne(`SELECT * FROM game_rooms WHERE id = $1`, [
    roomId,
  ]);

  const players = await query(
    `SELECT * FROM room_players WHERE room_id = $1 ORDER BY joined_at ASC`,
    [roomId]
  );

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
    [roomId]
  );

  console.log(
    `   ✅ Room: ${room.code} | State: ${room.state} | Version: ${room.state_version}`
  );
  console.log(
    `   Players: ${players.length} (${players
      .map((p) => p.nickname)
      .join(", ")})`
  );

  if (session) {
    console.log(
      `   Question: ${session.current_question_index + 1}/${
        session.total_questions
      }`
    );
    console.log(`   Current turn: ${session.current_player_nickname}`);
    console.log(`   Q: ${session.question_en || session.question_hu || "N/A"}`);
  }

  return { room, players, session };
}

async function testHumbug(roomId, challengerPlayerId, answerId) {
  console.log(`\n6️⃣  Testing: HUMBUG Challenge`);

  // Get answer being challenged
  const answer = await queryOne(
    `SELECT pa.*, rp.nickname as answerer_nickname
     FROM player_answers pa
     INNER JOIN room_players rp ON pa.player_id = rp.id
     WHERE pa.id = $1`,
    [answerId]
  );

  if (!answer) {
    throw new Error("Answer not found");
  }

  console.log(`   Challenger: Player ${challengerPlayerId}`);
  console.log(`   Answerer: ${answer.answerer_nickname}`);
  console.log(`   Answer: "${answer.answer_text}"`);
  console.log(`   Is Correct: ${answer.is_correct ? "✅" : "❌"}`);

  // Get session to check timer
  const session = await queryOne(
    `SELECT * FROM multiplayer_sessions WHERE room_id = $1`,
    [roomId]
  );

  if (!session) {
    throw new Error("Game session not found");
  }

  // Check timer
  const now = new Date();
  const deadline = session.humbug_deadline
    ? new Date(session.humbug_deadline)
    : null;

  if (!deadline) {
    throw new Error("No HUMBUG deadline set");
  }

  const timeLeft = deadline - now;
  console.log(`   Time left: ${Math.max(0, Math.round(timeLeft / 1000))}s`);

  if (now > deadline) {
    throw new Error("HUMBUG timer expired");
  }

  // Get challenger
  const challenger = await queryOne(
    `SELECT * FROM room_players WHERE id = $1`,
    [challengerPlayerId]
  );

  if (!challenger) {
    throw new Error("Challenger not found");
  }

  // Check if already revealed
  if (answer.revealed) {
    throw new Error("Answer already revealed");
  }

  // Check if challenger is the answerer
  if (challenger.id === answer.player_id) {
    throw new Error("Cannot HUMBUG your own answer");
  }

  // Reveal answer
  await execute(
    `UPDATE player_answers 
     SET revealed = TRUE, humbug_called_by = $1
     WHERE id = $2`,
    [challenger.id, answerId]
  );

  // Apply penalty
  let penaltyTarget;
  let penaltyPlayerId;

  if (answer.is_correct) {
    // Challenger was wrong
    penaltyTarget = "challenger";
    penaltyPlayerId = challenger.id;
    await execute(`UPDATE room_players SET lives = lives - 1 WHERE id = $1`, [
      challenger.id,
    ]);
    console.log(`   ❌ CHALLENGER WRONG! ${challenger.nickname} loses 1 life`);
  } else {
    // Answerer was wrong
    penaltyTarget = "answerer";
    penaltyPlayerId = answer.player_id;
    await execute(`UPDATE room_players SET lives = lives - 1 WHERE id = $1`, [
      answer.player_id,
    ]);
    console.log(
      `   ✅ CHALLENGER CORRECT! ${answer.answerer_nickname} loses 1 life`
    );
  }

  // Check elimination
  const penalizedPlayer = await queryOne(
    `SELECT * FROM room_players WHERE id = $1`,
    [penaltyPlayerId]
  );

  const eliminated = penalizedPlayer && penalizedPlayer.lives <= 0;

  if (eliminated) {
    console.log(`   💀 ${penalizedPlayer.nickname} ELIMINATED!`);
  } else {
    console.log(`   Lives remaining: ${penalizedPlayer?.lives || 0}`);
  }

  // Bump state version
  await execute(
    `UPDATE game_rooms SET state_version = state_version + 1 WHERE id = $1`,
    [roomId]
  );

  console.log(`   ✅ HUMBUG successful`);

  return {
    answerWasCorrect: answer.is_correct,
    penaltyTarget,
    eliminated,
    livesRemaining: penalizedPlayer?.lives || 0,
  };
}

// Run all tests
async function runTests() {
  try {
    // 1. Create room
    const { room, sessionId: host } = await testCreateRoom();

    // 2. Join as host
    const player1 = await testJoinRoom(room.id, host, "Host");

    // 3. Join as second player
    const guest = "guest-session-" + Date.now();
    const player2 = await testJoinRoom(room.id, guest, "Player2");

    // 4. Get initial state
    await testGetState(room.id);

    // 5. Start game
    await testStartGame(room.id);

    // 6. Get game state
    const state1 = await testGetState(room.id);

    // 7. Submit answer (wrong answer first - will be challenged)
    const wrongAnswer = await testSubmitAnswer(
      state1.session.id,
      player1.id,
      room.id,
      "intentionally wrong answer"
    );

    // 8. HUMBUG! Player 2 challenges Player 1's wrong answer
    await testHumbug(room.id, player2.id, wrongAnswer.answerId);

    // 9. Next question
    await testNextQuestion(room.id, state1.session.id);

    // 10. Get updated state
    await testGetState(room.id);

    // 11. Try correct answer (get first allowed answer)
    const correctAnswerData = await queryOne(
      `SELECT a.answer_en FROM answers a
       JOIN multiplayer_sessions ms ON a.question_id = ms.current_question_id
       WHERE ms.room_id = $1
       LIMIT 1`,
      [room.id]
    );

    if (correctAnswerData?.answer_en) {
      await testSubmitAnswer(
        state1.session.id,
        player2.id,
        room.id,
        correctAnswerData.answer_en
      );
    }

    console.log("\n\n🎉 All tests passed!\n");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runTests();
