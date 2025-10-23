# 🏗️ HUMBUG Multiplayer Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (React + TypeScript)               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐│
│  │ Room Lobby   │  │ Game Screen  │  │ Question Card│  │ Scoreboard  ││
│  │              │  │              │  │              │  │             ││
│  │ - Create     │  │ - Answer     │  │ - Timer      │  │ - Lives     ││
│  │ - Join       │  │ - HUMBUG     │  │ - Reveal     │  │ - Passes    ││
│  │ - Pack List  │  │ - Turn Order │  │ - Fuzzy Hint │  │ - Eliminated││
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘│
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │              Polling Loop (Every 3 seconds)                        │ │
│  │  GET /api/rooms?action=state&roomId={uuid}                        │ │
│  │  Headers: If-None-Match: "version-123"                            │ │
│  │  → 304 Not Modified (no changes) OR 200 OK (full state)          │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │
                                 │ HTTP/HTTPS
                                 │
┌────────────────────────────────▼─────────────────────────────────────────┐
│                    API LAYER (Vercel Serverless Functions)              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  /api/rooms.ts (Unified Multiplayer Endpoint)                          │
│  ┌────────────────────────────────────────────────────────────────────┐│
│  │                                                                    ││
│  │  Query Parameter: ?action={action}                               ││
│  │                                                                    ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           ││
│  │  │   create     │  │     join     │  │    leave     │           ││
│  │  │ Generate code│  │ Check auth   │  │ Remove player│           ││
│  │  │ Create room  │  │ Add player   │  │ Reassign host│           ││
│  │  └──────────────┘  └──────────────┘  └──────────────┘           ││
│  │                                                                    ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           ││
│  │  │    start     │  │    state     │  │   answer     │           ││
│  │  │ Verify access│  │ ETag check   │  │ Fuzzy match  │           ││
│  │  │ Sample Qs    │  │ Return state │  │ Set pending  │           ││
│  │  └──────────────┘  └──────────────┘  └──────────────┘           ││
│  │                                                                    ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           ││
│  │  │   humbug     │  │     next     │  │available-sets│           ││
│  │  │ Challenge ans│  │ Advance Q    │  │ Role-based   │           ││
│  │  │ Update lives │  │ Next turn    │  │ Pack list    │           ││
│  │  └──────────────┘  └──────────────┘  └──────────────┘           ││
│  │                                                                    ││
│  └────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  Session Management:                                                    │
│  ┌────────────────────────────────────────────────────────────────────┐│
│  │ Cookie: humbug_session (64-char hex)                              ││
│  │ HttpOnly: true, Secure: true, SameSite: lax                       ││
│  │ MaxAge: 7 days                                                     ││
│  └────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  JWT Authentication (Optional):                                         │
│  ┌────────────────────────────────────────────────────────────────────┐│
│  │ Cookie: auth_token (JWT)                                           ││
│  │ Contains: userId, email, name, nickname, role                      ││
│  │ Used for: Profile nickname, Question pack access                   ││
│  └────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  Rate Limiting (In-memory):                                             │
│  ┌────────────────────────────────────────────────────────────────────┐│
│  │ Per IP: 120 requests/minute                                        ││
│  │ Window: 60 seconds                                                 ││
│  │ Headers: X-RateLimit-Limit, X-RateLimit-Remaining                 ││
│  └────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │
                                 │ SQL Queries
                                 │
┌────────────────────────────────▼─────────────────────────────────────────┐
│                DATABASE LAYER (Neon PostgreSQL Serverless)              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────┐  ┌────────────────────┐  ┌──────────────────┐ │
│  │   game_rooms       │  │   room_players     │  │ game_sessions    │ │
│  ├────────────────────┤  ├────────────────────┤  ├──────────────────┤ │
│  │ id (UUID)          │  │ id (UUID)          │  │ id (UUID)        │ │
│  │ code (CHAR(6))     │  │ room_id (FK)       │  │ room_id (FK)     │ │
│  │ host_player_id     │  │ session_id         │  │ question_set_id  │ │
│  │ max_players        │  │ nickname           │  │ questions_ids[]  │ │
│  │ state              │  │ lives (INT)        │  │ current_index    │ │
│  │ state_version ✨   │  │ passes (INT)       │  │ current_turn_id  │ │
│  │ question_set_id    │  │ is_eliminated      │  │ pending_answer   │ │
│  │ created_at         │  │ join_order         │  │ started_at       │ │
│  │ expires_at         │  │ joined_at          │  └──────────────────┘ │
│  └────────────────────┘  └────────────────────┘                        │
│                                                                          │
│  ┌────────────────────┐  ┌────────────────────┐                        │
│  │  player_answers    │  │   humbug_events    │                        │
│  ├────────────────────┤  ├────────────────────┤                        │
│  │ id (UUID)          │  │ id (SERIAL)        │                        │
│  │ session_id (FK)    │  │ room_id (FK)       │                        │
│  │ player_id (FK)     │  │ event_type         │                        │
│  │ question_id        │  │ player_id          │                        │
│  │ answer_text        │  │ data (JSONB)       │                        │
│  │ is_correct         │  │ created_at         │                        │
│  │ was_challenged     │  └────────────────────┘                        │
│  │ challenger_id      │                                                 │
│  │ challenge_success  │                                                 │
│  │ submitted_at       │                                                 │
│  └────────────────────┘                                                 │
│                                                                          │
│  Existing Tables (Reused):                                              │
│  ┌────────────────────┐  ┌────────────────────┐                        │
│  │     questions      │  │  question_sets     │                        │
│  ├────────────────────┤  ├────────────────────┤                        │
│  │ id                 │  │ id                 │                        │
│  │ question_text_en   │  │ slug               │                        │
│  │ question_text_hu   │  │ name_en, name_hu   │                        │
│  │ category           │  │ access_level 🔒    │                        │
│  │ question_set_id    │  │ question_count     │                        │
│  │ allowed_answers[]  │  │ display_order      │                        │
│  └────────────────────┘  └────────────────────┘                        │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘


DATA FLOW EXAMPLES:
═══════════════════

1. CREATE ROOM FLOW:
────────────────────
Client                     API                        Database
  │                         │                            │
  ├─POST /api/rooms?action=create                       │
  │  { maxPlayers: 10 }    │                            │
  │                         ├─generateUniqueRoomCode()  │
  │                         │                            │
  │                         ├─INSERT game_rooms─────────>│
  │                         │  code: "INFOLE"           │
  │                         │  state: "waiting"          │
  │                         │  state_version: 0          │
  │                         │                            │
  │                         ├─INSERT room_players───────>│
  │                         │  nickname: "Host"          │
  │                         │  lives: 3, passes: 0       │
  │                         │  join_order: 0             │
  │                         │                            │
  │<────{ roomId, code }───┤                            │
  │                         │                            │


2. JOIN ROOM FLOW:
──────────────────
Client                     API                        Database
  │                         │                            │
  ├─POST /api/rooms?action=join                         │
  │  { code: "INFOLE",     │                            │
  │    nickname: "Player2" }│                            │
  │                         │                            │
  │                         ├─getAuthenticatedUser()    │
  │                         │  (check JWT cookie)        │
  │                         │                            │
  │                         ├─SELECT FROM game_rooms────>│
  │                         │  WHERE code='INFOLE'       │
  │                         │<───(room exists, joinable)─┤
  │                         │                            │
  │                         ├─INSERT room_players───────>│
  │                         │  session_id: "abc123..."   │
  │                         │  nickname: "Player2"       │
  │                         │  join_order: 1             │
  │                         │                            │
  │                         ├─UPDATE game_rooms─────────>│
  │                         │  state_version: 1          │
  │                         │                            │
  │<────{ playerId,        ┤                            │
  │       nickname,        │                            │
  │       authenticated }──┤                            │


3. START GAME FLOW:
───────────────────
Client                     API                        Database
  │                         │                            │
  ├─POST /api/rooms?action=start                        │
  │  { roomId, questionSetId: 2 }                       │
  │                         │                            │
  │                         ├─getAuthenticatedUser()    │
  │                         │  role: "premium"           │
  │                         │                            │
  │                         ├─getAvailableQuestionSets("premium")
  │                         │<───SELECT WHERE access_level──┤
  │                         │     IN ('free', 'premium')    │
  │                         │                            │
  │                         ├─(verify access: ✅)         │
  │                         │                            │
  │                         ├─SELECT questions──────────>│
  │                         │  FROM question_sets        │
  │                         │  WHERE id=2 LIMIT 10       │
  │                         │<───[Q1, Q2, Q3... Q10]────┤
  │                         │                            │
  │                         ├─INSERT game_sessions──────>│
  │                         │  questions_ids: [1,5,9...] │
  │                         │  current_turn_player: P1   │
  │                         │                            │
  │                         ├─UPDATE game_rooms─────────>│
  │                         │  state: "in_progress"      │
  │                         │  state_version: 2          │
  │                         │                            │
  │<────{ sessionId,       ┤                            │
  │       questionCount }──┤                            │


4. POLLING STATE FLOW (ETag Optimization):
───────────────────────────────────────────
Client                     API                        Database
  │                         │                            │
  ├─GET /api/rooms?action=state&roomId=...              │
  │  If-None-Match: "2"    │                            │
  │                         │                            │
  │                         ├─SELECT state_version──────>│
  │                         │<───current: 2 ─────────────┤
  │                         │                            │
  │                         ├─(version match: 304)      │
  │<────HTTP 304───────────┤                            │
  │  (No body, ~10 bytes)  │                            │
  │                         │                            │
  │ [3 seconds later...]   │                            │
  │                         │                            │
  ├─GET /api/rooms?action=state&roomId=...              │
  │  If-None-Match: "2"    │                            │
  │                         │                            │
  │                         ├─SELECT state_version──────>│
  │                         │<───current: 5 ─────────────┤
  │                         │                            │
  │                         ├─(version changed!)        │
  │                         │                            │
  │                         ├─SELECT room, players──────>│
  │                         ├─SELECT session, question──>│
  │                         ├─SELECT events─────────────>│
  │                         │<───full state data────────┤
  │                         │                            │
  │<────HTTP 200───────────┤                            │
  │  { stateVersion: 5,    │                            │
  │    data: {...} }       │                            │
  │  (~5KB)                │                            │


5. ANSWER + HUMBUG FLOW:
────────────────────────
Player1                    API                        Database
  │                         │                            │
  ├─POST /api/rooms?action=answer                       │
  │  { answer: "Wrong Answer" }                         │
  │                         │                            │
  │                         ├─SELECT allowed_answers────>│
  │                         │<───["Correct", "Answer"]──┤
  │                         │                            │
  │                         ├─fuzzyMatchAnswer()        │
  │                         │  (normalize, Levenshtein)  │
  │                         │  Result: ❌ Not a match    │
  │                         │                            │
  │                         ├─INSERT player_answers─────>│
  │                         │  is_correct: false         │
  │                         │                            │
  │                         ├─UPDATE game_sessions──────>│
  │                         │  pending_answer_id: A123   │
  │                         │                            │
  │                         ├─UPDATE game_rooms─────────>│
  │                         │  state_version: 6          │
  │                         │                            │
  │<────{ answerId,        ┤                            │
  │       canBeChallenged }┤                            │
  │                         │                            │

Player2                    API                        Database
  │                         │                            │
  ├─POST /api/rooms?action=humbug                       │
  │  { answerId: A123 }    │                            │
  │                         │                            │
  │                         ├─SELECT player_answers─────>│
  │                         │<───answer_text, is_correct┤
  │                         │                            │
  │                         ├─(answer was WRONG!)       │
  │                         │                            │
  │                         ├─UPDATE room_players───────>│
  │                         │  Player1.lives: 3→2        │
  │                         │  Player2.passes: 0→1       │
  │                         │                            │
  │                         ├─UPDATE player_answers─────>│
  │                         │  was_challenged: true      │
  │                         │  challenger_id: Player2    │
  │                         │  challenge_successful: true│
  │                         │                            │
  │                         ├─UPDATE game_sessions──────>│
  │                         │  pending_answer_id: NULL   │
  │                         │                            │
  │                         ├─UPDATE game_rooms─────────>│
  │                         │  state_version: 7          │
  │                         │                            │
  │<────{ challengeSuccessful: true,                    │
  │       answererLostLife: true }                      │


6. FUZZY MATCHING ALGORITHM:
─────────────────────────────
User Answer: "Barcelone"
Correct Answers: ["Barcelona", "FC Barcelona"]

Step 1: Normalize
─────────────────
"Barcelone"          → "barcelone"
"Barcelona"          → "barcelona"
"FC Barcelona"       → "barcelona"  (remove "FC")

Step 2: Extract Key Words (>2 chars)
─────────────────────────────────────
"barcelone"          → ["barcelone"]
"barcelona"          → ["barcelona"]

Step 3: Match with Levenshtein Distance
────────────────────────────────────────
"barcelone" vs "barcelona"
  b a r c e l o n e
b 0 1 2 3 4 5 6 7 8
a 1 0 1 2 3 4 5 6 7
r 2 1 0 1 2 3 4 5 6
c 3 2 1 0 1 2 3 4 5
e 4 3 2 1 0 1 2 3 4
l 5 4 3 2 1 0 1 2 3
o 6 5 4 3 2 1 0 1 2
n 7 6 5 4 3 2 1 0 1
a 8 7 6 5 4 3 2 1 0

Distance: 1 (substitute 'e' → 'a')
Tolerance: ≤ 1 character difference
Result: ✅ MATCH!

Step 4: Calculate Overlap Ratio
────────────────────────────────
Matching words: 1
Total correct words: 1
Ratio: 1/1 = 100%
Threshold: ≥ 100% OR ≥ 75% for multi-word
Result: ✅ ACCEPT ANSWER!


KEY FEATURES HIGHLIGHTED:
═════════════════════════

✨ state_version: Incremented on every state change for ETag optimization
🔒 access_level: Role-based question pack access (free/premium/admin)
📊 lives, passes: HUMBUG game mechanics (3 lives, earn passes)
🎯 pending_answer_id: Temporary storage for challengeable answers
🔍 fuzzyMatchAnswer(): Tolerant matching with Levenshtein distance
🔐 JWT auth_token: Optional authentication for premium features
🍪 humbug_session: Guest play support without account
⏱️ expires_at: Auto-cleanup of old rooms (24h)
📝 humbug_events: Complete audit trail of all game actions
```

---

**Architecture Principles:**

1. **Stateless HTTP**: No WebSockets, pure REST API
2. **Serverless-First**: Optimized for Vercel's function model
3. **Bandwidth Efficient**: ETag 304 responses for unchanged state
4. **Action-Based Routing**: Single endpoint, 9 actions
5. **Role-Based Access**: Free/Premium/Admin tiers
6. **Guest-Friendly**: No authentication required
7. **Profile Integration**: Auto-populate from JWT when available
8. **Event Logging**: Full game history for debugging/analytics
9. **Security First**: HTTP-only cookies, rate limiting, input validation
10. **Performance Optimized**: Connection pooling, indexed queries, <50ms response
