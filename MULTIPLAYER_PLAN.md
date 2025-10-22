# 🎮 HUMBUG! Multiplayer Gaming Lobby - Design & Implementation Plan

## 📋 Project Overview

Transform HUMBUG! from a solo quiz experience into a real-time multiplayer party game with Kahoot/Slido-style room-based gameplay featuring QR codes, room IDs, live scoring, and strategic "HUMBUG!" calls.

---

## 🎯 Core Features

### 1. **Room Management**

- Create game rooms with unique 6-character room codes (e.g., "ABC123")
- Host controls: start game, question pack selection, round settings
- Join via room code or QR code scan
- Waiting lobby with player list
- Maximum 8 players per room (as per game rules)

### 2. **Live Gameplay**

- Real-time synchronization across all players
- **Rotating Game Master**: Randomly suggested before each round, can pass role to another player
- Individual answer submission **with text input**
- **Fuzzy answer matching**: Auto-validates against question's valid answers (e.g., "Rosvvelt" → "Roosevelt")
- **Game Master override**: Can manually mark answers as correct/incorrect
- Strategic "HUMBUG!" button to challenge previous player
- Lives tracking (configurable 1-5 lives per game)
- Pass options (configurable 0-3 starting passes)
- Round counter (auto-suggested based on question count, manually adjustable)

### 3. **Scoring & Lives System**

- Each player starts with configurable lives (1-5) and passes (0-3)
- Lose a life when:
  - Your answer is challenged and wrong
  - You call "HUMBUG!" but the answer was correct
- Gain a pass option when correctly calling "HUMBUG!"
- **Answer tracking**: Correct answers shown in green, wrong answers in red (stored for history)
- Last player standing wins

---

## 🎨 UI/UX Design Plan

### **A. Lobby Flow**

#### 1. **Home Screen Enhancement**

```
┌─────────────────────────────────────────┐
│  HUMBUG! LOGO                     [👤] │
│                                          │
│  ┌──────────────────────────────────┐  │
│  │  🎮 PLAY MODES                   │  │
│  │                                  │  │
│  │  [📱 Solo Mode]                  │  │
│  │  Play alone at your own pace    │  │
│  │                                  │  │
│  │  [🎯 Create Game Room]          │  │
│  │  Host a multiplayer game        │  │
│  │                                  │  │
│  │  [🔗 Join Game Room]            │  │
│  │  Enter room code: [______]      │  │
│  │                                  │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

#### 2. **Create Room Screen (Host)**

```
┌─────────────────────────────────────────┐
│  ← Back          CREATE GAME ROOM       │
│                                          │
│  Room Settings:                          │
│  ┌────────────────────────────────────┐ │
│  │ Question Pack: [Free Pack ▼]      │ │
│  │ ℹ️ Contains ~50 questions          │ │
│  │                                    │ │
│  │ Number of Rounds: [8 ▼]           │ │
│  │ (Suggested: 8 based on pack)      │ │
│  │                                    │ │
│  │ Starting Lives: [2 ▼] (1-5)       │ │
│  │                                    │ │
│  │ Starting Pass Options: [1 ▼] (0-3)│ │
│  │                                    │ │
│  │ Answer Time Limit: [30 ▼] seconds │ │
│  │ (10, 20, 30, 45, 60, 90, No Limit)│ │
│  │                                    │ │
│  │ Game Master Mode:                  │ │
│  │ ○ Rotating (random each round)    │ │
│  │ ● Fixed (same throughout)         │ │
│  └────────────────────────────────────┘ │
│                                          │
│  [Create Room & Get Code]                │
└─────────────────────────────────────────┘
```

#### 3. **Waiting Lobby (Host View)**

```
┌─────────────────────────────────────────┐
│  ← Cancel                    Room: ABC123│
│                                          │
│  ┌────────────────────────────────────┐ │
│  │         [QR CODE]                  │ │
│  │                                    │ │
│  │      Room Code: ABC123             │ │
│  │   humbug-quiz.app/join/ABC123      │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Players (3/8):                          │
│  ┌────────────────────────────────────┐ │
│  │ 👑 You (Host) - Ready         [❌] │ │
│  │ 👤 Alice - Ready              [❌] │ │
│  │ 👤 Bob - Waiting...           [❌] │ │
│  └────────────────────────────────────┘ │
│                                          │
│  [Start Game] (min 3 players)            │
│                                          │
│  Settings: Free Pack | 2 Lives | 5 Rnds │
└─────────────────────────────────────────┘
```

#### 4. **Waiting Lobby (Player View)**

```
┌─────────────────────────────────────────┐
│  ← Leave Room                Room: ABC123│
│                                          │
│  Waiting for host to start...            │
│                                          │
│  Players (3/8):                          │
│  ┌────────────────────────────────────┐ │
│  │ 👑 John (Host) - Ready             │ │
│  │ 👤 You - Ready                     │ │
│  │ 👤 Bob - Waiting...                │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Settings: Free Pack | 2 Lives | 5 Rnds │
└─────────────────────────────────────────┘
```

---

### **B. Gameplay Interface**

#### 0. **Game Master Selection (Start of Each Round)**

```
┌─────────────────────────────────────────┐
│  🎲 ROUND 3/8 - GAME MASTER SELECTION   │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │                                    │ │
│  │    Randomly Selected:              │ │
│  │                                    │ │
│  │    👤 Alice                        │ │
│  │                                    │ │
│  │    Will be Game Master this round  │ │
│  │                                    │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Alice's options:                        │
│  [Accept Role]   [Pass to Someone Else]  │
│                                          │
│  If you pass, select who:                │
│  • Bob                                   │
│  • Carol                                 │
│  • David                                 │
│                                          │
└─────────────────────────────────────────┘
```

#### 1. **Question Display (All Players)**

**When it's YOUR turn:**

```
┌─────────────────────────────────────────┐
│  Room: ABC123          Round: 2/8        │
│  🎲 Game Master: David                   │
│  ─────────────────────────────────────── │
│  Question #12:                           │
│  Name first names that have been held by │
│  US presidents throughout history!       │
│                                          │
│  Possible answers: 25+ | Category: People│
│  ─────────────────────────────────────── │
│  Answers Given:                          │
│  ┌────────────────────────────────────┐ │
│  │ ✅ "George" (Alice)                 │ │
│  │ ✅ "Thomas" (Bob)                   │ │
│  │ ❌ "Winston" (Carol) - Wrong!       │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Turn Order:                             │
│  ┌────────────────────────────────────┐ │
│  │ 1. Alice (❤️❤️ | 🎫1)               │ │
│  │ 2. Bob (❤️)                         │ │
│  │ 3. Carol (❤️❤️ | 🎫1)               │ │
│  │ ➤ 4. You (❤️❤️ | 🎫2) [YOUR TURN]   │ │
│  │ 5. David (❤️❤️❤️) 🎲 Game Master    │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Your Answer:                            │
│  ┌────────────────────────────────────┐ │
│  │ Franklin                           │ │
│  └────────────────────────────────────┘ │
│                                          │
│  [Submit Answer] ✓      [Use Pass (2)]   │
│  ⬆️ ACTIVE                               │
│                                          │
│  ⏱️ Time left: 22s                       │
└─────────────────────────────────────────┘
```

**When it's ANOTHER player's turn (you can type, but not submit yet):**

```
┌─────────────────────────────────────────┐
│  Room: ABC123          Round: 2/8        │
│  🎲 Game Master: David                   │
│  ─────────────────────────────────────── │
│  Question #12:                           │
│  Name first names that have been held by │
│  US presidents throughout history!       │
│                                          │
│  Possible answers: 25+ | Category: People│
│  ─────────────────────────────────────── │
│  Answers Given:                          │
│  ┌────────────────────────────────────┐ │
│  │ ✅ "George" (Alice)                 │ │
│  │ ✅ "Thomas" (Bob)                   │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Turn Order:                             │
│  ┌────────────────────────────────────┐ │
│  │ 1. Alice (❤️❤️ | 🎫1)               │ │
│  │ 2. Bob (❤️)                         │ │
│  │ ➤ 3. Carol (❤️❤️ | 🎫1) [Thinking...]│ │
│  │ 4. You (❤️❤️ | 🎫2) - Waiting       │ │
│  │ 5. David (❤️❤️❤️) 🎲 Game Master    │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Prepare Your Answer:                    │
│  ┌────────────────────────────────────┐ │
│  │ James                              │ │
│  └────────────────────────────────────┘ │
│  💡 Type now, submit when it's your turn │
│                                          │
│  [Submit Answer] 🔒      [Use Pass (2)] 🔒│
│  ⬆️ DISABLED - Wait for your turn        │
│                                          │
│  ⏱️ Carol's time left: 18s               │
└─────────────────────────────────────────┘
```

**When someone submits an answer (real-time update for ALL players):**

```
┌─────────────────────────────────────────┐
│  🔔 NEW ANSWER SUBMITTED!                │
│                                          │
│  Carol answered: "Abraham"               │
│                                          │
│  🎲 Game Master is reviewing...          │
│                                          │
│  Answers Given:                          │
│  ┌────────────────────────────────────┐ │
│  │ ✅ "George" (Alice)                 │ │
│  │ ✅ "Thomas" (Bob)                   │ │
│  │ ⏳ "Abraham" (Carol) - Pending...   │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### 2. **Game Master Review Panel** (After Player Submits Answer)

```
┌─────────────────────────────────────────┐
│  🎲 GAME MASTER PANEL - David           │
│  Room: ABC123          Round: 2/8        │
│  ─────────────────────────────────────── │
│  Bob just submitted: "Franklyn"          │
│                                          │
│  Auto-Match Analysis:                    │
│  ┌────────────────────────────────────┐ │
│  │ ✅ FUZZY MATCH FOUND (87%)          │ │
│  │                                    │ │
│  │ Submitted: "Franklyn"              │ │
│  │ Matched:   "Franklin"              │ │
│  │                                    │ │
│  │ Automatically marked as CORRECT    │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Game Master Actions:                    │
│  ┌────────────────────────────────────┐ │
│  │ [✅ Keep as Correct]               │ │
│  │                                    │ │
│  │ [❌ Override as Wrong]             │ │
│  │                                    │ │
│  │ [➡️ Continue to Next Player]       │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Valid answers for reference:            │
│  George, John, Thomas, James, William,   │
│  Franklin, Theodore, Franklin...         │
└─────────────────────────────────────────┘
```

#### 3. **Challenge Interface (After Someone Answers)**

```
┌─────────────────────────────────────────┐
│  Room: ABC123          Round: 2/8        │
│  🎲 Game Master: David                   │
│  ─────────────────────────────────────── │
│  Last Answer:                            │
│  ┌────────────────────────────────────┐ │
│  │  Bob answered: "Franklyn"           │ │
│  │  ✅ Validated by Game Master        │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Answers Given:                          │
│  ┌────────────────────────────────────┐ │
│  │ ✅ "George" (Alice)                 │ │
│  │ ✅ "Franklyn" (Bob)                 │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Turn Order:                             │
│  ┌────────────────────────────────────┐ │
│  │ 1. Alice (❤️❤️ | 🎫1)               │ │
│  │ 2. Bob (❤️)                         │ │
│  │ ➤ 3. You (❤️❤️ | 🎫2) [YOUR TURN]   │ │
│  │ 4. David (❤️❤️❤️) 🎲                │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Do you think "Franklyn" is a bluff?     │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │                                    │ │
│  │    🚨 CALL HUMBUG! 🚨              │ │
│  │    Challenge Bob's answer          │ │
│  │                                    │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Or submit your own answer:              │
│  [Type your answer...] [Submit]          │
│                                          │
│  ⏱️ Time left: 30s                       │
└─────────────────────────────────────────┘
```

#### 4. **Challenge Result Screen**

```
┌─────────────────────────────────────────┐
│  🎯 HUMBUG! CALLED!                     │
│                                          │
│  You challenged Bob's answer:            │
│  "Franklin"                              │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │                                    │ │
│  │    ✅ CORRECT!                     │ │
│  │    Franklin WAS a valid answer     │ │
│  │                                    │ │
│  │    😔 You lose a life              │ │
│  │    ❤️❤️ → ❤️                        │ │
│  │                                    │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Continuing in 3 seconds...              │
└─────────────────────────────────────────┘
```

#### 5. **Spectator Mode (Eliminated Players)**

```
┌─────────────────────────────────────────┐
│  👻 SPECTATING          Round: 4/5       │
│  ─────────────────────────────────────── │
│  You're out, but watch the action!       │
│                                          │
│  Current Question: Name US Presidents... │
│                                          │
│  Active Players:                         │
│  ┌────────────────────────────────────┐ │
│  │ ➤ Alice (❤️) - Thinking...          │ │
│  │   David (❤️❤️) - Waiting             │ │
│  └────────────────────────────────────┘ │
│                                          │
│  [Leave Room]                            │
└─────────────────────────────────────────┘
```

#### 6. **Game Over Screen**

```
┌─────────────────────────────────────────┐
│  🏆 GAME OVER!                          │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │     👑 WINNER: ALICE! 👑           │ │
│  │                                    │ │
│  │     Last Player Standing           │ │
│  │     Lives Remaining: ❤️             │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Final Standings:                        │
│  ┌────────────────────────────────────┐ │
│  │ 🥇 Alice - 1❤️ remaining            │ │
│  │ 🥈 You - Eliminated Round 4         │ │
│  │ 🥉 David - Eliminated Round 3       │ │
│  │ 4️⃣ Bob - Eliminated Round 2          │ │
│  └────────────────────────────────────┘ │
│                                          │
│  [Play Again]  [Back to Lobby]           │
└─────────────────────────────────────────┘
```

---

## 🏗️ Technical Architecture

### **Database Schema**

```sql
-- Game Rooms Table
CREATE TABLE game_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(6) UNIQUE NOT NULL,
  host_user_id TEXT REFERENCES users(id),

  -- Settings
  question_set_id INTEGER REFERENCES question_sets(id),
  starting_lives INTEGER DEFAULT 2 CHECK (starting_lives BETWEEN 1 AND 5),
  starting_passes INTEGER DEFAULT 1 CHECK (starting_passes BETWEEN 0 AND 3),
  max_rounds INTEGER DEFAULT 8,
  max_players INTEGER DEFAULT 8,
  answer_time_limit INTEGER DEFAULT 30, -- seconds (null = no limit)
  game_master_mode VARCHAR(20) DEFAULT 'rotating', -- rotating, fixed

  -- State
  status VARCHAR(20) DEFAULT 'waiting', -- waiting, playing, finished
  current_round INTEGER DEFAULT 0,
  current_question_id INTEGER,
  current_turn_player_id TEXT,
  current_game_master_id TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '2 hours'
);

-- Room Players Table
CREATE TABLE room_players (
  id SERIAL PRIMARY KEY,
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id),
  nickname VARCHAR(50),

  -- Game State
  lives_remaining INTEGER,
  pass_count INTEGER DEFAULT 0,
  is_eliminated BOOLEAN DEFAULT false,
  turn_order INTEGER,
  prepared_answer TEXT, -- Pre-typed answer before their turn

  -- Status
  is_ready BOOLEAN DEFAULT false,
  is_connected BOOLEAN DEFAULT true,
  last_heartbeat TIMESTAMP DEFAULT NOW(),

  joined_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(room_id, user_id)
);

-- Game Turns Table
CREATE TABLE game_turns (
  id SERIAL PRIMARY KEY,
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
  round_number INTEGER,
  question_id INTEGER REFERENCES questions(id),
  player_id TEXT REFERENCES users(id),

  -- Turn Data
  answer_text TEXT,
  used_pass BOOLEAN DEFAULT false,
  is_challenged BOOLEAN DEFAULT false,
  challenger_id TEXT REFERENCES users(id),

  -- Validation
  is_correct BOOLEAN,
  auto_validated BOOLEAN DEFAULT false,
  fuzzy_match_score DECIMAL(3,2), -- 0.00 to 1.00
  matched_answer TEXT, -- The valid answer it matched against
  game_master_override BOOLEAN DEFAULT false,
  game_master_decision VARCHAR(20), -- correct, incorrect, null

  -- Result
  life_lost BOOLEAN DEFAULT false,
  pass_gained BOOLEAN DEFAULT false,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Answer History (for tracking all submissions)
CREATE TABLE answer_submissions (
  id SERIAL PRIMARY KEY,
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
  round_number INTEGER,
  question_id INTEGER REFERENCES questions(id),
  player_id TEXT REFERENCES users(id),
  answer_text TEXT,
  is_correct BOOLEAN,
  display_color VARCHAR(10), -- 'green' or 'red'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Room Chat/Events (Optional)
CREATE TABLE room_events (
  id SERIAL PRIMARY KEY,
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
  event_type VARCHAR(50), -- player_joined, player_left, game_started, etc.
  event_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **API Endpoints**

```typescript
// Room Management
POST   /api/rooms/create          // Create new room (lives, passes, rounds, time limit)
POST   /api/rooms/join             // Join existing room
DELETE /api/rooms/leave            // Leave room
GET    /api/rooms/:roomCode        // Get room details
POST   /api/rooms/:roomCode/start  // Start game (host only)

// Game Master
POST   /api/rooms/:roomCode/select-gm      // Select game master for round
POST   /api/rooms/:roomCode/pass-gm        // Pass GM role to another player
POST   /api/rooms/:roomCode/validate       // GM validates/overrides answer

// Gameplay
POST   /api/rooms/:roomCode/prepare        // Save prepared answer (while waiting)
POST   /api/rooms/:roomCode/answer         // Submit answer (only when your turn)
POST   /api/rooms/:roomCode/humbug         // Call HUMBUG!
POST   /api/rooms/:roomCode/pass           // Use pass option
GET    /api/rooms/:roomCode/state          // Get current game state
GET    /api/rooms/:roomCode/answers        // Get all answers for current question

// Real-time (WebSocket/SSE)
WS     /api/rooms/:roomCode/live           // Real-time updates
// Events: player_joined, answer_submitted, gm_validated, turn_changed, timer_tick
```

### **Real-Time Communication**

**Option 1: Server-Sent Events (SSE)** - Simpler, good for one-way updates

```typescript
// Client subscribes to room updates
const eventSource = new EventSource(`/api/rooms/${roomCode}/live`);

eventSource.onmessage = (event) => {
  const update = JSON.parse(event.data);
  // Update UI based on game state
};
```

**Option 2: WebSockets** - Better for two-way real-time communication

```typescript
// Full duplex communication
const ws = new WebSocket(`wss://humbug-quiz.app/api/rooms/${roomCode}/live`);

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  // Handle: player_joined, answer_submitted, humbug_called, etc.
};

ws.send(JSON.stringify({ type: "submit_answer", answer: "George" }));
```

**Recommendation:** Start with **Pusher** or **Ably** for managed real-time infrastructure, then migrate to custom WebSockets if needed.

---

## 🔄 Game Flow Logic

### **State Machine**

```
WAITING_LOBBY
  ↓ (Host clicks Start, min 3 players)
GAME_STARTED
  ↓
GAME_MASTER_SELECTION
  ├→ Random selection (if rotating mode)
  ├→ Selected player can accept or pass role
  └→ If passed, choose another player
  ↓
ROUND_START (Select question, set turn order)
  ↓
PLAYER_TURN (Timer starts - default 30 seconds)
  ├→ All players can TYPE answers (saved as prepared_answer)
  ├→ Only current player can SUBMIT answer → AUTO_VALIDATION
  ├→ Or Call HUMBUG (if previous answer exists) → CHALLENGE_RESOLUTION
  └→ Or Use Pass → NEXT_PLAYER_TURN
  ↓
ANSWER_SUBMITTED (Broadcast to ALL players in real-time)
  ↓
AUTO_VALIDATION (Fuzzy match against valid answers)
  ├→ Match found (>80%) → Mark GREEN, store in history
  └→ No match → Send to GAME_MASTER_REVIEW
  ↓
GAME_MASTER_REVIEW
  ├→ GM accepts auto-validation → Continue
  ├→ GM overrides as correct → Mark GREEN
  ├→ GM overrides as incorrect → Mark RED
  └→ Store decision in answer_submissions
  ↓
CHALLENGE_OPPORTUNITY (Next player's turn)
  ├→ Submit Answer → AUTO_VALIDATION
  └→ Call HUMBUG → CHALLENGE_RESOLUTION
  ↓
CHALLENGE_RESOLUTION
  ├→ Correct Answer → Challenger loses life
  └→ Wrong Answer → Original player loses life + Challenger gains pass
  ↓
CHECK_ELIMINATIONS
  ↓
NEXT_PLAYER_TURN / ROUND_END
  ↓
ROUND_END
  ├→ More rounds? → GAME_MASTER_SELECTION
  └→ All rounds done? → GAME_OVER
  ↓
GAME_OVER (Show winner, final standings)
```

### **Turn Logic**

```typescript
// Pseudo-code for turn management
function handleTurn(roomId: string, playerId: string, action: Action) {
  const room = getRoom(roomId);
  const currentPlayer = room.getCurrentPlayer();

  if (currentPlayer.id !== playerId) {
    throw new Error("Not your turn");
  }

  switch (action.type) {
    case "PREPARE_ANSWER":
      // Allow any player (except GM) to type and save answer
      if (playerId === room.currentGameMasterId) {
        throw new Error("Game master cannot submit answers");
      }

      await updatePlayer(playerId, {
        preparedAnswer: action.payload.answerText,
      });

      // No broadcast needed - local state only
      break;

    case "SUBMIT_ANSWER":
      // Only allow submission if it's the player's turn
      if (currentPlayer.id !== playerId) {
        throw new Error("Not your turn to submit");
      }

      const { answerText } = action.payload;

      // Broadcast immediately to all players
      broadcastToAll("answer_submitted", {
        playerId,
        playerName: currentPlayer.nickname,
        answerText,
        status: "pending",
      });

      // Fuzzy match against valid answers
      const validAnswers = getQuestionAnswers(room.currentQuestionId);
      const matchResult = fuzzyMatch(answerText, validAnswers);

      if (matchResult.score >= 0.8) {
        // Auto-validate as correct
        const answerId = await storeAnswer({
          playerId,
          answerText,
          isCorrect: true,
          autoValidated: true,
          fuzzyMatchScore: matchResult.score,
          matchedAnswer: matchResult.match,
          displayColor: "green",
        });

        // Update all players with validated answer
        broadcastToAll("answer_validated", {
          answerId,
          playerId,
          playerName: currentPlayer.nickname,
          answerText,
          isCorrect: true,
          matchedAnswer: matchResult.match,
          status: "validated",
        });

        // Notify game master (can still override)
        broadcastToGameMaster("answer_auto_validated", matchResult);
      } else {
        // Send to game master for manual review
        broadcastToGameMaster("answer_needs_review", {
          playerId,
          answerText,
        });

        await waitForGameMasterDecision(answerText);
      }

      // Clear prepared answer
      await updatePlayer(playerId, { preparedAnswer: null });

      // Move to next player OR end round if last player
      advanceTurn();
      broadcastRoomState();
      break;

    case "CALL_HUMBUG":
      // Get previous player's answer
      const prevAnswer = getPreviousAnswer();

      // Check if answer was actually correct
      if (prevAnswer.isCorrect) {
        // Challenger loses life
        currentPlayer.lives--;
        await storeHumbugCall(playerId, prevAnswer.playerId, false);
      } else {
        // Original player loses life, challenger gains pass
        prevAnswer.player.lives--;
        currentPlayer.passes++;
        await storeHumbugCall(playerId, prevAnswer.playerId, true);
      }

      checkEliminations();
      advanceTurn();
      broadcastRoomState();
      break;

    case "USE_PASS":
      // Decrement pass count
      currentPlayer.passes--;

      // Skip to next player
      advanceTurn();
      broadcastRoomState();
      break;

    case "GAME_MASTER_OVERRIDE":
      // Game master manually validates answer
      const { turnId, isCorrect } = action.payload;
      const turn = await getTurn(turnId);

      await updateAnswer(turnId, {
        isCorrect,
        gameMasterOverride: true,
        gameMasterDecision: isCorrect ? "correct" : "incorrect",
        displayColor: isCorrect ? "green" : "red",
      });

      // Broadcast validation result to all players in real-time
      broadcastToAll("answer_validated", {
        turnId,
        playerId: turn.playerId,
        playerName: turn.playerName,
        answerText: turn.answerText,
        isCorrect,
        overriddenByGM: true,
        status: "validated",
      });

      broadcastRoomState();
      break;
  }
}

// Fuzzy matching helper
function fuzzyMatch(input: string, validAnswers: string[]): MatchResult {
  const normalized = input.toLowerCase().trim();

  let bestMatch = { answer: "", score: 0 };

  for (const validAnswer of validAnswers) {
    const score = calculateLevenshteinScore(
      normalized,
      validAnswer.toLowerCase()
    );
    if (score > bestMatch.score) {
      bestMatch = { answer: validAnswer, score };
    }
  }

  return bestMatch;
}
```

---

## 📱 Mobile Considerations

### **QR Code Integration**

- Generate QR with room URL: `https://humbug-quiz.app/join/ABC123`
- Use `qrcode.react` library for generation
- Display prominently in waiting lobby
- Mobile scan redirects directly to join page with room code pre-filled

### **Mobile-Optimized UI**

- Large touch targets for buttons (min 44x44px)
- Bottom-sheet style modals for mobile
- Sticky "HUMBUG!" button always visible
- Swipe gestures for navigation
- Portrait-first design
- Vibration feedback on challenge/elimination

### **Offline Handling**

- Show reconnection UI if connection drops
- Resume from last known state
- Auto-mark as disconnected after 30s
- Allow reconnection within 2 minutes

---

## 🎨 Component Structure

```
src/
├── components/
│   ├── multiplayer/
│   │   ├── RoomModeSelector.tsx       // Solo vs Multiplayer choice
│   │   ├── CreateRoomDialog.tsx       // Room creation form (lives, passes, rounds)
│   │   ├── JoinRoomDialog.tsx         // Join by code
│   │   ├── WaitingLobby.tsx           // Pre-game lobby
│   │   │   ├── HostControls.tsx       // Start button, settings
│   │   │   ├── PlayerList.tsx         // Connected players
│   │   │   └── RoomQRCode.tsx         // QR code display
│   │   ├── GameMasterSelection.tsx    // GM selection/passing interface
│   │   ├── GameRoom.tsx               // Main gameplay container
│   │   │   ├── QuestionDisplay.tsx    // Current question
│   │   │   ├── AnswerHistory.tsx      // List of green/red answers (real-time)
│   │   │   ├── TurnTracker.tsx        // Player order, lives, passes
│   │   │   ├── AnswerInput.tsx        // Text input (always enabled for typing)
│   │   │   ├── SubmitButton.tsx       // Submit (enabled only on your turn)
│   │   │   ├── TurnTimer.tsx          // Countdown timer (configurable)
│   │   │   ├── HumbugButton.tsx       // Challenge button
│   │   │   ├── PassButton.tsx         // Pass option
│   │   │   └── ChallengeResult.tsx    // Challenge outcome
│   │   ├── GameMasterPanel.tsx        // GM review interface
│   │   │   ├── FuzzyMatchDisplay.tsx  // Show auto-match result
│   │   │   ├── ValidAnswersList.tsx   // Reference list
│   │   │   └── OverrideControls.tsx   // Accept/reject buttons
│   │   ├── SpectatorView.tsx          // For eliminated players
│   │   └── GameOverScreen.tsx         // Final results
│   └── ui/
│       └── (existing components)
├── hooks/
│   ├── useGameRoom.ts                 // Room state management
│   ├── useRealtimeUpdates.ts          // WebSocket/SSE connection
│   ├── useGameLogic.ts                // Turn logic, validations
│   ├── useFuzzyMatch.ts               // Answer matching logic
│   ├── useTurnTimer.ts                // Timer management
│   └── useAnswerInput.ts              // Answer input state (typing before turn)
├── context/
│   └── GameRoomContext.tsx            // Global room state
├── lib/
│   └── fuzzyMatch.ts                  // Levenshtein distance algorithm
└── pages/
    └── GameRoomPage.tsx               // /room/:roomCode route
```

---

## 🚀 Implementation Phases

### **Phase 1: Foundation (Week 1)**

✅ Database schema setup (with lives, passes, rounds, time limit config)
✅ Basic room creation/join API
✅ Room code generation logic
✅ Waiting lobby UI
✅ Player list management
✅ Host configuration UI (lives, passes, rounds, time limit)

### **Phase 2: Game Master & Turn System (Week 2)**

✅ Game master selection logic (rotating/fixed)
✅ GM role passing mechanism
✅ Turn order system
✅ Turn timer (configurable, default 30s)
✅ Text input for answers (always enabled for typing)
✅ Submit button (enabled only on current player's turn)
✅ Prepared answer storage (type before your turn)
✅ Answer submission with text
✅ Lives & passes tracking

### **Phase 3: Answer Validation System (Week 3)**

✅ Real-time answer broadcast (all players see submissions instantly)
✅ Fuzzy matching algorithm (Levenshtein distance)
✅ Auto-validation (>80% match)
✅ Game master review panel
✅ Manual override functionality
✅ Answer history display (green/red) - real-time updates
✅ Store all submissions in database
✅ Pending status while GM reviews

### **Phase 4: HUMBUG! & Real-time (Week 4)**

✅ HUMBUG! challenge logic
✅ Challenge resolution
✅ WebSocket/SSE integration
✅ Live player updates
✅ Real-time turn synchronization
✅ Connection status handling

### **Phase 5: Polish & Launch (Week 5)**

✅ QR code generation
✅ Game over screen
✅ Spectator mode
✅ Mobile optimization
✅ Animations & sound effects
✅ Multi-device testing
✅ Deployment

---

## 🎯 Key Features Summary

| Feature                    | Description                                          | Priority    |
| -------------------------- | ---------------------------------------------------- | ----------- |
| Room Creation              | Generate unique room codes                           | 🔴 Critical |
| Host Configuration         | Set lives (1-5), passes (0-3), rounds, time limit    | 🔴 Critical |
| Auto-Suggest Rounds        | Based on question pack size                          | 🟡 High     |
| Turn Timer                 | Configurable (10-90s or no limit), default 30s       | 🔴 Critical |
| Game Master Selection      | Random selection, role passing                       | 🔴 Critical |
| Text Answer Input          | Always enabled for typing (prepare answer)           | 🔴 Critical |
| Submit Button Logic        | Enabled ONLY on current player's turn                | 🔴 Critical |
| Prepared Answers           | Save typed answer before your turn                   | 🟡 High     |
| Real-time Answer Broadcast | All players see submissions instantly                | 🔴 Critical |
| Fuzzy Matching             | Auto-validate similar spellings (>80%)               | 🔴 Critical |
| GM Review Panel            | Override auto-validation                             | 🔴 Critical |
| Answer History             | Green (correct) / Red (wrong) display - live updates | 🔴 Critical |
| QR Code                    | Join via QR scan                                     | 🟡 High     |
| Waiting Lobby              | Pre-game player list                                 | 🔴 Critical |
| Turn Management            | Sequential player turns                              | 🔴 Critical |
| HUMBUG! Button             | Challenge mechanism                                  | 🔴 Critical |
| Lives System               | Track lives per player                               | 🔴 Critical |
| Pass System                | Track & use pass options                             | 🟡 High     |
| Real-time Sync             | Live updates across clients                          | 🔴 Critical |
| Spectator Mode             | Eliminated player view                               | 🟢 Medium   |
| Game Over                  | Winner + final standings                             | 🔴 Critical |
| Mobile Optimized           | Touch-friendly UI                                    | 🟡 High     |
| Reconnection               | Handle disconnects                                   | 🟢 Medium   |

---

## 🎨 Design Tokens & Styling

### **Color Palette**

```css
/* Game Room States */
--waiting: #3b82f6; /* Blue */
--active: #10b981; /* Green */
--challenge: #ef4444; /* Red */
--eliminated: #6b7280; /* Gray */

/* Player Status */
--alive: #10b981; /* Green */
--danger: #f59e0b; /* Amber - 1 life left */
--dead: #dc2626; /* Red */

/* Turn Indicator */
--your-turn: #8b5cf6; /* Purple */
--waiting-turn: #6b7280; /* Gray */
```

### **Animations**

- Pulse effect on "Your Turn"
- Shake animation when life lost
- Confetti on game win
- Slide-in for new players joining
- Fade-out for eliminated players

---

## 🔐 Security Considerations

1. **Room Code Security**

   - 6-character alphanumeric codes (36^6 = 2B combinations)
   - Auto-expire after 2 hours
   - Rate limit room creation (5 per hour per user)

2. **Cheating Prevention**

   - Server-side answer validation
   - Turn order enforced server-side
   - Timestamp all actions
   - Detect rapid-fire requests

3. **Access Control**
   - Only host can start game
   - Only host can kick players
   - JWT authentication required
   - Room access token for guests

---

## 📊 Analytics & Monitoring

Track:

- Rooms created per day
- Average players per room
- Game completion rate
- Average game duration
- HUMBUG! call success rate
- Most popular question packs
- Player retention (return to play again)

---

## 🎉 Next Steps

1. **Review & Approve Plan** ✅ (Updated with your requirements!)
2. **Set up real-time infrastructure** (Pusher/Ably vs custom)
3. **Create database migrations** (with fuzzy match fields)
4. **Implement fuzzy matching library** (Levenshtein distance)
5. **Build API endpoints** (including GM validation)
6. **Develop core UI components** (text input, answer history, GM panel)
7. **Implement game logic** (GM selection, auto-validation)
8. **Test & iterate**
9. **Launch! 🚀**

---

## ✨ Key Updates Based on Your Feedback

### 1️⃣ **Game Master System**

- ✅ Random GM selection before each round
- ✅ Selected player can pass role to anyone else
- ✅ GM reviews all answers and can override auto-validation

### 2️⃣ **Configuration Flexibility** ⚙️

- ✅ Starting lives: 1-5 (configurable by host)
- ✅ Starting passes: 0-3 (configurable by host)
- ✅ Number of rounds: Auto-suggested based on question pack size, manually adjustable
- ✅ **Answer time limit: 10-90 seconds or unlimited (default: 30 seconds)**

### 3️⃣ **Text Answer Input & Fuzzy Matching** ✍️

- ✅ Players type their answers (no multiple choice during game)
- ✅ **All players can type at any time** (prepare answers before their turn)
- ✅ **Submit button enabled ONLY on current player's turn**
- ✅ Prepared answers saved to `prepared_answer` field in database
- ✅ **Fuzzy matching algorithm** compares input to valid answers
- ✅ >80% similarity = auto-marked GREEN
- ✅ Game master can still override any decision
- ✅ Wrong answers marked RED separately for tracking

### 4️⃣ **Real-time Answer Broadcasting** 📡

- ✅ **When player submits answer, ALL players see it instantly**
- ✅ Answer shows as "Pending..." while GM reviews
- ✅ Updates to ✅ Green or ❌ Red when validated
- ✅ Real-time WebSocket events for answer submissions
- ✅ Separate UI states for: Your Turn, Waiting, and Viewing Submissions

### 5️⃣ **Answer Tracking & Display** 📊

- ✅ All answers displayed in real-time
- ✅ Green checkmarks for correct answers
- ✅ Red X marks for wrong answers
- ✅ Stored in `answer_submissions` table for history

---

**Ready to start building?** Let me know if you want to:

- Start implementing Phase 1 (Database & Room Creation)
- Prototype the fuzzy matching algorithm
- Design the Game Master review panel UI
- Adjust any other game mechanics

This is going to be an **amazing** multiplayer party game! 🎮✨
