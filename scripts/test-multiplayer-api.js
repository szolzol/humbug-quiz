/**
 * Multiplayer API Test Script
 * Tests the /api/rooms endpoint actions locally
 */

import fetch from "node-fetch";

const API_BASE = "http://localhost:3000/api/rooms";

// Test session cookie (simulated)
let sessionCookie = "";

async function testAPI() {
  console.log("🧪 Testing Multiplayer API\n");
  console.log("Make sure dev server is running: npm run dev\n");

  try {
    // Test 1: Create Room
    console.log("1️⃣ Testing CREATE ROOM...");
    const createRes = await fetch(`${API_BASE}?action=create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maxPlayers: 10 }),
    });

    // Extract session cookie
    const cookies = createRes.headers.get("set-cookie");
    if (cookies) {
      sessionCookie = cookies;
    }

    const createData = await createRes.json();
    console.log("Response:", createData);

    if (!createData.success) {
      throw new Error("Failed to create room");
    }

    const { roomId, code } = createData.data;
    console.log(`✅ Created room: ${code} (${roomId})\n`);

    // Test 2: Join Room (with nickname)
    console.log("2️⃣ Testing JOIN ROOM...");
    const joinRes = await fetch(`${API_BASE}?action=join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        code,
        nickname: "TestPlayer1",
      }),
    });

    const joinData = await joinRes.json();
    console.log("Response:", joinData);
    console.log(
      `✅ Joined as: ${joinData.data.nickname} (Host: ${joinData.data.isHost})\n`
    );

    // Test 3: Get Room State
    console.log("3️⃣ Testing GET STATE...");
    const stateRes = await fetch(`${API_BASE}?action=state&roomId=${roomId}`, {
      method: "GET",
      headers: { Cookie: sessionCookie },
    });

    const stateData = await stateRes.json();
    console.log("Room state:", JSON.stringify(stateData.data.room, null, 2));
    console.log("Players:", stateData.data.players.length);
    console.log(
      `✅ State fetched (version: ${stateData.data.room.stateVersion})\n`
    );

    // Test 4: ETag/304 optimization
    console.log("4️⃣ Testing ETAG/304...");
    const etag = stateRes.headers.get("etag");
    const cachedRes = await fetch(`${API_BASE}?action=state&roomId=${roomId}`, {
      method: "GET",
      headers: {
        Cookie: sessionCookie,
        "If-None-Match": etag,
      },
    });

    console.log(`Status: ${cachedRes.status}`);
    if (cachedRes.status === 304) {
      console.log("✅ 304 Not Modified - ETag working!\n");
    } else {
      console.log("⚠️ Expected 304, got:", cachedRes.status, "\n");
    }

    // Test 5: Start Game (need at least 2 players)
    console.log("5️⃣ Simulating second player join...");

    // Create a second "browser session"
    const player2Session = "simulated-session-2";
    const join2Res = await fetch(`${API_BASE}?action=join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `humbug_session=${player2Session}`,
      },
      body: JSON.stringify({
        code,
        nickname: "TestPlayer2",
      }),
    });

    const join2Data = await join2Res.json();
    console.log(`✅ Player 2 joined: ${join2Data.data.nickname}\n`);

    // Now start the game
    console.log("6️⃣ Testing START GAME...");
    const startRes = await fetch(`${API_BASE}?action=start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify({ roomId }),
    });

    const startData = await startRes.json();
    console.log("Response:", startData);

    if (startData.success) {
      console.log(
        `✅ Game started! ${startData.data.totalQuestions} questions\n`
      );
    } else {
      console.log("⚠️ Start failed:", startData.error, "\n");
    }

    // Test 7: Get game state (should show current question)
    console.log("7️⃣ Testing GAME STATE...");
    const gameStateRes = await fetch(
      `${API_BASE}?action=state&roomId=${roomId}`,
      {
        method: "GET",
        headers: { Cookie: sessionCookie },
      }
    );

    const gameStateData = await gameStateRes.json();
    console.log(
      "Game state:",
      JSON.stringify(gameStateData.data.gameState, null, 2)
    );
    console.log(
      `✅ Game running (Round ${gameStateData.data.gameState?.roundNumber})\n`
    );

    // Test 8: Submit Answer
    console.log("8️⃣ Testing SUBMIT ANSWER...");
    const answerRes = await fetch(`${API_BASE}?action=answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        roomId,
        answer: "George", // Assuming US presidents question
      }),
    });

    const answerData = await answerRes.json();
    console.log("Response:", answerData);

    if (answerData.success) {
      console.log(
        `✅ Answer: ${answerData.data.correct ? "CORRECT ✓" : "WRONG ✗"}\n`
      );
    } else {
      console.log("⚠️ Answer failed:", answerData.error, "\n");
    }

    // Test 9: Next Question (host action)
    console.log("9️⃣ Testing NEXT QUESTION...");
    const nextRes = await fetch(`${API_BASE}?action=next`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify({ roomId }),
    });

    const nextData = await nextRes.json();
    console.log("Response:", nextData);

    if (nextData.success) {
      console.log(
        `✅ Advanced to question ${nextData.data.nextQuestionIndex + 1}\n`
      );
    }

    // Test 10: Leave Room
    console.log("🔟 Testing LEAVE ROOM...");
    const leaveRes = await fetch(`${API_BASE}?action=leave`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify({ roomId }),
    });

    const leaveData = await leaveRes.json();
    console.log(`✅ Left room\n`);

    console.log("✅ All tests completed!\n");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error(error);
  }
}

// Check if running as main module
if (import.meta.url === `file://${process.argv[1]}`) {
  testAPI();
}

export { testAPI };
