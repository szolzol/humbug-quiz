# HUMBUG! Database Schema - Visual Diagrams

## 📊 Entity Relationship Diagram (ERD)

### **Full Schema Overview**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 HUMBUG! DATABASE                                │
│                           PostgreSQL Schema v1.0.0                              │
└─────────────────────────────────────────────────────────────────────────────────┘


┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                            CORE DATA MODEL                                    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌────────────────────┐                    ┌───────────────────────┐
│       USERS        │                    │    QUESTION_SETS      │
├────────────────────┤                    ├───────────────────────┤
│ id (PK)            │◄───────────────────│ creator_id (FK)       │
│ email              │                    │ slug                  │
│ name               │                    │ name_en               │
│ picture            │                    │ name_hu               │
│ role (ENUM)        │                    │ description_en        │
│ is_active          │                    │ description_hu        │
│ created_at         │                    │ access_level (ENUM)   │
│ updated_at         │                    │ is_active             │
│ last_login         │                    │ is_published          │
│ preferences (JSON) │                    │ display_order         │
│ metadata (JSON)    │                    │ question_count        │
└────────────────────┘                    │ cover_image_url       │
         │                                │ created_at            │
         │                                │ updated_at            │
         │                                └───────────────────────┘
         │                                           │
         │                                           │
         │                                           │
         │                ┌──────────────────────────┘
         │                │
         │                ▼
         │        ┌───────────────────┐
         │        │    QUESTIONS      │
         │        ├───────────────────┤
         │        │ id (PK)           │
         │        │ set_id (FK)       │───────┐
         │        │ question_en       │       │
         │        │ question_hu       │       │
         │        │ category          │       │
         │        │ difficulty (ENUM) │       │
         │        │ source_name       │       │
         │        │ source_url        │       │
         │        │ order_index       │       │
         │        │ is_active         │       │
         │        │ times_played      │       │
         │        │ metadata (JSON)   │       │
         │        └───────────────────┘       │
         │                 │                  │
         │                 │                  │
         │                 ▼                  │
         │        ┌───────────────────┐       │
         │        │     ANSWERS       │       │
         │        ├───────────────────┤       │
         │        │ id (PK)           │       │
         │        │ question_id (FK)  │◄──────┘
         │        │ answer_en         │
         │        │ answer_hu         │
         │        │ order_index       │
         │        │ is_alternative    │
         │        │ parent_answer_id  │
         │        │ times_given       │
         │        └───────────────────┘
         │
         │
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                          ACCESS CONTROL                                       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

         │
         │
         ├──────────────┐
         │              │
         ▼              ▼
┌────────────────────────────┐         ┌───────────────────────┐
│ USER_QUESTION_SET_ACCESS   │         │    QUESTION_SETS      │
├────────────────────────────┤         │    (from above)       │
│ id (PK)                    │         └───────────────────────┘
│ user_id (FK) ──────────────┼──────────────┐
│ set_id (FK) ───────────────┼──────────────┼─────────┐
│ granted_at                 │              │         │
│ expires_at                 │              │         │
│ granted_by (ENUM)          │              │         │
│ granted_by_user_id (FK) ───┼──────────────┘         │
│ is_active                  │                        │
│ metadata (JSON)            │                        │
└────────────────────────────┘                        │
                                                      │
                                                      │
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                          GAME TRACKING                                        ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                                                      │
         ┌────────────────────────────────────────────┤
         │                                            │
         │                                            │
         ▼                                            ▼
┌─────────────────────┐                    ┌────────────────────┐
│   GAME_SESSIONS     │                    │   QUESTION_SETS    │
├─────────────────────┤                    │   (from above)     │
│ id (PK)             │                    └────────────────────┘
│ user_id (FK) ───────┼──┐
│ set_id (FK) ────────┼──┼──────────────────────────┐
│ started_at          │  │                          │
│ completed_at        │  │                          │
│ status (ENUM)       │  │                          │
│ players_count       │  │                          │
│ initial_lives       │  │                          │
│ questions_played    │  │                          │
│ metadata (JSON)     │  │                          │
└─────────────────────┘  │                          │
         │               │                          │
         │               └──────────────────────────┼────┐
         ▼                                          │    │
┌──────────────────────┐                            │    │
│   QUESTION_USAGE     │                            │    │
├──────────────────────┤                            │    │
│ id (PK)              │                            │    │
│ session_id (FK) ─────┤                            │    │
│ question_id (FK) ────┼────────────────────────────┘    │
│ marked_answer_ids[]  │                                 │
│ marked_at            │                                 │
│ completed_at         │                                 │
│ answers_marked_count │                                 │
│ bluff_calls_count    │                                 │
│ metadata (JSON)      │                                 │
└──────────────────────┘                                 │
                                                         │
                                                         │
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                       ADMIN & MODERATION                                      ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                                                         │
         ┌───────────────────────────────────────────────┘
         │
         │
         ▼
┌───────────────────┐              ┌────────────────────┐
│    AUDIT_LOG      │              │   USER_REPORTS     │
├───────────────────┤              ├────────────────────┤
│ id (PK)           │              │ id (PK)            │
│ user_id (FK) ─────┼──┐           │ reporter_id (FK) ──┼──┐
│ user_email        │  │           │ entity_type        │  │
│ action            │  │           │ entity_id          │  │
│ entity_type       │  │           │ reason             │  │
│ entity_id         │  │           │ description        │  │
│ created_at        │  │           │ status             │  │
│ old_values (JSON) │  │           │ reviewed_by (FK) ──┼──┤
│ new_values (JSON) │  │           │ reviewed_at        │  │
│ metadata (JSON)   │  │           │ resolution_notes   │  │
│ ip_address        │  │           │ created_at         │  │
│ user_agent        │  │           │ updated_at         │  │
│ request_id        │  │           └────────────────────┘  │
└───────────────────┘  │                      │            │
                       └──────────────────────┴────────────┘
```

---

## 🔄 Data Flow Diagrams

### **1. User Authentication & Access Flow**

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. Click "Sign in with Google"
       ▼
┌─────────────────────┐
│  /api/auth/google   │
└──────┬──────────────┘
       │
       │ 2. Redirect to Google OAuth
       ▼
┌──────────────────────┐
│  Google OAuth Screen │
└──────┬───────────────┘
       │
       │ 3. User consents
       ▼
┌────────────────────────┐
│  /api/auth/callback    │  4. Verify Google token
└──────┬─────────────────┘
       │
       │ 5. Query/Create user
       ▼
┌────────────────────────┐
│    users table         │
│  ┌──────────────────┐  │
│  │ INSERT/UPDATE    │  │
│  │ user record      │  │
│  └──────────────────┘  │
└──────┬─────────────────┘
       │
       │ 6. Generate JWT
       ▼
┌────────────────────────┐
│  Set HTTP-only cookie  │
└──────┬─────────────────┘
       │
       │ 7. Redirect to app
       ▼
┌────────────────────────┐
│   App with session     │
└────────────────────────┘
```

---

### **2. Question Set Access Check Flow**

```
User Request: GET /api/questions/sets/original/questions
       │
       ▼
┌──────────────────────────────┐
│  Extract JWT from cookie     │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Verify JWT signature        │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Extract user_id from JWT    │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  Call: user_has_set_access(user_id, 1)  │
└──────┬───────────────────────────────────┘
       │
       ├─────► Check question_sets.access_level
       │       └─── "free" ? ──► ✅ ALLOW
       │
       ├─────► Check users.role
       │       └─── "admin" ? ──► ✅ ALLOW
       │
       └─────► Query user_question_set_access
               ├─── Found active record?
               │    └─── Not expired? ──► ✅ ALLOW
               │
               └─── Otherwise ──► ❌ DENY (403)
```

---

### **3. Game Session Flow**

```
┌─────────────────────────────────────────────────────────┐
│                    START GAME                           │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
              POST /api/game/session
                   {set_id: 1, players_count: 4}
                        │
                        ▼
              ┌─────────────────────┐
              │  game_sessions      │
              │  INSERT new session │
              │  status: in_progress│
              └──────┬──────────────┘
                     │ session_id = 123
                     │
┌────────────────────┼────────────────────────────────────┐
│              PLAY GAME                                  │
└────────────────────┼────────────────────────────────────┘
                     │
                     ▼
         User selects Question #1
                     │
                     ▼
     POST /api/game/session/123/mark-answer
          {question_id: 5, answer_id: 12}
                     │
                     ▼
        ┌────────────────────────────┐
        │  question_usage            │
        │  INSERT or UPDATE          │
        │  marked_answer_ids += [12] │
        │  bluff_calls_count++       │
        └────────┬───────────────────┘
                 │
                 ▼
        All answers marked?
                 │
         ┌───────┴───────┐
        YES             NO
         │               │
         ▼               ▼
    UPDATE           Continue
    completed_at      playing
         │
         └───────┐
                 │
┌────────────────┼───────────────────────────────────────┐
│          END GAME                                      │
└────────────────┼───────────────────────────────────────┘
                 │
                 ▼
     POST /api/game/session/123/complete
                 │
                 ▼
        ┌────────────────────────┐
        │  game_sessions         │
        │  UPDATE session        │
        │  status: completed     │
        │  completed_at: NOW()   │
        │  duration_seconds: 1234│
        └────────┬───────────────┘
                 │
                 ▼
        ┌────────────────────────┐
        │  Update statistics     │
        │  - question_sets       │
        │    total_plays++       │
        │  - questions           │
        │    times_played++      │
        └────────────────────────┘
```

---

### **4. Admin Content Management Flow**

```
┌──────────────────────────────────────────────────────┐
│          CREATE NEW QUESTION SET                     │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
       POST /api/admin/sets
       {
         slug: "sports-trivia",
         name_en: "Sports Trivia",
         access_level: "premium"
       }
                     │
                     ▼
       Check if user.role === "admin"
                     │
            ┌────────┴────────┐
           YES               NO
            │                 │
            ▼                 ▼
    ┌────────────────┐   ┌──────────┐
    │ question_sets  │   │ 403 Error│
    │ INSERT         │   └──────────┘
    └────┬───────────┘
         │ set_id = 42
         │
         ▼
┌────────────────────────────────────────────────────┐
│       ADD QUESTIONS TO SET                         │
└────────────────────┬───────────────────────────────┘
                     │
                     ▼
    POST /api/admin/questions
    {
      set_id: 42,
      question_en: "Name NBA champions...",
      category: "sports"
    }
                     │
                     ▼
       ┌─────────────────────┐
       │  questions          │
       │  INSERT             │
       └──────┬──────────────┘
              │ question_id = 101
              │
              ▼
       Trigger: update_question_set_count()
              │
              ▼
       ┌─────────────────────┐
       │  question_sets      │
       │  UPDATE             │
       │  question_count++   │
       └─────────────────────┘
```

---

## 📊 Table Relationships Matrix

```
┌────────────────┬─────┬──────┬─────┬────────┬────────┬──────┬──────┬──────┬───────┐
│                │users│q_sets│quest│answers │access  │session│usage │audit │reports│
├────────────────┼─────┼──────┼─────┼────────┼────────┼──────┼──────┼──────┼───────┤
│users           │  -  │ 1:M  │  -  │   -    │  1:M   │ 1:M  │  -   │ 1:M  │  1:M  │
│question_sets   │ M:1 │  -   │ 1:M │   -    │  1:M   │ 1:M  │  -   │  -   │   -   │
│questions       │  -  │ M:1  │  -  │  1:M   │   -    │  -   │ 1:M  │  -   │   -   │
│answers         │  -  │  -   │ M:1 │   -    │   -    │  -   │  -   │  -   │   -   │
│access          │ M:1 │ M:1  │  -  │   -    │   -    │  -   │  -   │  -   │   -   │
│game_sessions   │ M:1 │ M:1  │  -  │   -    │   -    │  -   │ 1:M  │  -   │   -   │
│question_usage  │  -  │  -   │ M:1 │   -    │   -    │ M:1  │  -   │  -   │   -   │
│audit_log       │ M:1 │  -   │  -  │   -    │   -    │  -   │  -   │  -   │   -   │
│user_reports    │ M:1 │  -   │  -  │   -    │   -    │  -   │  -   │  -   │   -   │
└────────────────┴─────┴──────┴─────┴────────┴────────┴──────┴──────┴──────┴───────┘

Legend:
  1:M  = One-to-Many
  M:1  = Many-to-One
  -    = No direct relationship
```

---

## 🔐 Access Control Decision Tree

```
                    User requests question set
                              │
                              ▼
                    ┌──────────────────┐
                    │ Is set published │
                    │   and active?    │
                    └────┬───────┬─────┘
                        YES     NO
                         │       │
                         │       └──► ❌ DENY (404)
                         │
                         ▼
                ┌─────────────────────┐
                │ What is access_level?│
                └──┬──────┬──────┬────┘
                  FREE  PREMIUM  ADMIN
                   │      │       │
                   │      │       └──────┐
                   │      │              │
                   ▼      ▼              ▼
              ✅ ALLOW   │      ┌──────────────┐
                         │      │ Is user      │
                         │      │ role=admin?  │
                         │      └──┬─────┬─────┘
                         │        YES    NO
                         │         │     │
                         │         │     └──► ❌ DENY (403)
                         │         │
                         │         ▼
                         │    ✅ ALLOW
                         │
                         ▼
              ┌──────────────────────┐
              │ User authenticated?  │
              └──────┬───────┬───────┘
                    YES     NO
                     │       │
                     │       └──► ❌ DENY (401)
                     │
                     ▼
        ┌─────────────────────────────┐
        │ Check user_question_set_     │
        │ access table                 │
        └──┬──────────────────────┬────┘
           │                      │
      FOUND                  NOT FOUND
           │                      │
           ▼                      │
    ┌──────────────┐              │
    │ Is active &  │              │
    │ not expired? │              │
    └──┬─────┬─────┘              │
      YES    NO                   │
       │      │                   │
       │      └───────────────────┴──► ❌ DENY (403)
       │
       ▼
  ✅ ALLOW
```

---

## 📈 Performance Index Strategy

### **Read-Heavy Operations (Queries)**

```
Operation: Get questions for a set
SQL: SELECT * FROM questions WHERE set_id = ? AND is_active = true

Index Used:
┌────────────────────────────────────┐
│ idx_questions_set_id               │
│ ├─ set_id (B-tree)                 │
│ └─ order_index (included)          │
└────────────────────────────────────┘
Performance: O(log n) → ~100µs for 10K questions


Operation: Search questions by text (English)
SQL: SELECT * FROM questions WHERE
     to_tsvector('english', question_en) @@ to_tsquery('president')

Index Used:
┌────────────────────────────────────┐
│ idx_questions_en_fulltext          │
│ └─ GIN index on tsvector           │
└────────────────────────────────────┘
Performance: O(log n) → ~50µs for 10K questions


Operation: Get user's accessible sets
SQL: SELECT * FROM get_user_accessible_sets('user_123')

Indexes Used:
┌────────────────────────────────────┐
│ idx_user_set_access_user_id        │
│ idx_question_sets_display_order    │
└────────────────────────────────────┘
Performance: O(log n) → ~200µs
```

### **Write Operations**

```
Operation: Insert new question
SQL: INSERT INTO questions (...) VALUES (...)

Triggers Fired:
┌────────────────────────────────────┐
│ 1. update_question_set_count()     │
│    → Updates question_sets         │
└────────────────────────────────────┘
Performance: ~500µs (includes trigger)


Operation: Insert new answer
SQL: INSERT INTO answers (...) VALUES (...)

Triggers Fired:
┌────────────────────────────────────┐
│ 1. update_answer_count()           │
│    → Updates questions.metadata    │
└────────────────────────────────────┘
Performance: ~300µs (includes trigger)
```

---

## 🎯 Data Size Projections

```
┌─────────────────────────────────────────────────────────┐
│                  STORAGE REQUIREMENTS                   │
├────────────────┬──────────┬─────────┬────────────────────┤
│ Entity         │ Count    │ Size/Row│ Total Size         │
├────────────────┼──────────┼─────────┼────────────────────┤
│ Users          │ 10,000   │ 2 KB    │ ~20 MB             │
│ Question Sets  │ 50       │ 5 KB    │ ~250 KB            │
│ Questions      │ 1,000    │ 3 KB    │ ~3 MB              │
│ Answers        │ 15,000   │ 500 B   │ ~7.5 MB            │
│ Access Records │ 50,000   │ 500 B   │ ~25 MB             │
│ Game Sessions  │ 100,000  │ 1 KB    │ ~100 MB            │
│ Question Usage │ 500,000  │ 500 B   │ ~250 MB            │
│ Audit Log      │ 1,000,000│ 1 KB    │ ~1 GB              │
│ User Reports   │ 1,000    │ 2 KB    │ ~2 MB              │
├────────────────┴──────────┴─────────┼────────────────────┤
│                          TOTAL      │ ~1.4 GB            │
└─────────────────────────────────────┴────────────────────┘

Vercel Postgres Free Tier: 256 MB
Recommendation: Start free, upgrade when audit_log grows large
Strategy: Archive or truncate old audit_log entries periodically
```

---

**Schema visualization complete! 📊**
