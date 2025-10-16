# HUMBUG! Database Schema Documentation

## 📊 Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CORE ENTITIES                              │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────────┐         ┌──────────────┐
│    USERS     │────┐    │  QUESTION_SETS   │────┐    │  QUESTIONS   │
│              │    │    │                  │    │    │              │
│ id (PK)      │    └───→│ creator_id (FK)  │←───┘    │ set_id (FK)  │
│ email        │         │ slug (UNIQUE)    │         │              │
│ name         │         │ name_en/name_hu  │         │ question_en  │
│ role         │         │ access_level     │         │ question_hu  │
│ preferences  │         │ is_published     │         │ category     │
└──────────────┘         └──────────────────┘         │ source_url   │
      │                           │                   └──────────────┘
      │                           │                          │
      │                           │                          │
      ▼                           ▼                          ▼
┌──────────────────────┐   ┌────────────────────────┐  ┌──────────────┐
│ USER_QUESTION_SET_   │   │   GAME_SESSIONS        │  │   ANSWERS    │
│      ACCESS          │   │                        │  │              │
│                      │   │ id (PK)                │  │ question_id  │
│ user_id (FK)         │   │ user_id (FK)           │  │ answer_en    │
│ set_id (FK)          │   │ set_id (FK)            │  │ answer_hu    │
│ granted_by           │   │ status                 │  │ order_index  │
│ expires_at           │   │ players_count          │  └──────────────┘
└──────────────────────┘   └────────────────────────┘         │
                                      │                        │
                                      │                        │
                                      ▼                        │
                           ┌────────────────────────┐          │
                           │  QUESTION_USAGE        │          │
                           │                        │          │
                           │ session_id (FK)        │          │
                           │ question_id (FK)       │◄─────────┘
                           │ marked_answer_ids[]    │
                           │ bluff_calls_count      │
                           └────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     ADMIN & MODERATION                              │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐              ┌──────────────────┐
│   AUDIT_LOG      │              │  USER_REPORTS    │
│                  │              │                  │
│ user_id (FK)     │              │ reporter_id (FK) │
│ action           │              │ entity_type      │
│ entity_type      │              │ entity_id        │
│ old_values       │              │ reason           │
│ new_values       │              │ status           │
└──────────────────┘              └──────────────────┘
```

---

## 📋 Table Descriptions

### **Core Tables**

#### **1. users**

**Purpose:** Store user accounts linked to Google OAuth

| Column        | Type          | Description                                      |
| ------------- | ------------- | ------------------------------------------------ |
| `id`          | TEXT (PK)     | Google user ID from OAuth                        |
| `email`       | TEXT (UNIQUE) | User email address                               |
| `name`        | TEXT          | Display name                                     |
| `picture`     | TEXT          | Profile picture URL                              |
| `role`        | ENUM          | User role: `free`, `premium`, `admin`, `creator` |
| `is_active`   | BOOLEAN       | Account active status                            |
| `created_at`  | TIMESTAMP     | Account creation time                            |
| `updated_at`  | TIMESTAMP     | Last update time                                 |
| `last_login`  | TIMESTAMP     | Last login time                                  |
| `preferences` | JSONB         | User settings (language, music, theme, etc.)     |
| `metadata`    | JSONB         | Extensible field for future data                 |

**Key Features:**

- ✅ Stores Google OAuth data
- ✅ Role-based access control (RBAC)
- ✅ Flexible preferences in JSONB
- ✅ Audit timestamps

**Indexes:**

- `idx_users_email` - Fast email lookup
- `idx_users_role` - Role-based queries
- `idx_users_preferences` - GIN index for JSONB queries

---

#### **2. question_sets**

**Purpose:** Collections/packs of questions

| Column                              | Type          | Description                                   |
| ----------------------------------- | ------------- | --------------------------------------------- |
| `id`                                | SERIAL (PK)   | Auto-incrementing ID                          |
| `slug`                              | TEXT (UNIQUE) | URL-friendly identifier                       |
| `name_en` / `name_hu`               | TEXT          | Multilingual names                            |
| `description_en` / `description_hu` | TEXT          | Multilingual descriptions                     |
| `access_level`                      | ENUM          | Access level: `free`, `premium`, `admin_only` |
| `is_active`                         | BOOLEAN       | Active status                                 |
| `is_published`                      | BOOLEAN       | Published status                              |
| `cover_image_url`                   | TEXT          | Cover image                                   |
| `display_order`                     | INTEGER       | Sort order in UI                              |
| `creator_id`                        | TEXT (FK)     | User who created the set                      |
| `question_count`                    | INTEGER       | Cached count (updated by trigger)             |
| `total_plays`                       | INTEGER       | Number of times played                        |
| `metadata`                          | JSONB         | Tags, play time, player count                 |

**Key Features:**

- ✅ Multilingual support (EN/HU)
- ✅ Access control (free/premium/admin)
- ✅ Publish workflow (draft → published)
- ✅ Denormalized counts for performance

**Indexes:**

- `idx_question_sets_slug` - Routing by slug
- `idx_question_sets_access_level` - Access filtering
- `idx_question_sets_display_order` - Sorted listing

---

#### **3. questions**

**Purpose:** Individual quiz questions

| Column                        | Type         | Description                |
| ----------------------------- | ------------ | -------------------------- |
| `id`                          | SERIAL (PK)  | Auto-incrementing ID       |
| `set_id`                      | INTEGER (FK) | Parent question set        |
| `question_en` / `question_hu` | TEXT         | Multilingual question text |
| `category`                    | TEXT         | Category enum              |
| `difficulty`                  | ENUM         | Optional difficulty level  |
| `source_name`                 | TEXT         | Attribution source         |
| `source_url`                  | TEXT         | Source URL                 |
| `order_index`                 | INTEGER      | Display order within set   |
| `is_active`                   | BOOLEAN      | Active status              |
| `times_played`                | INTEGER      | Usage count                |
| `times_completed`             | INTEGER      | Completion count           |
| `metadata`                    | JSONB        | Stats and analytics        |

**Categories:**

- `entertainment`
- `travel`
- `sports`
- `technology`
- `gastronomy`
- `culture`

**Key Features:**

- ✅ Multilingual questions
- ✅ Source attribution
- ✅ Full-text search indexes
- ✅ Usage analytics

**Indexes:**

- `idx_questions_set_id` - Composite with order_index
- `idx_questions_category` - Category filtering
- `idx_questions_en_fulltext` - Full-text search (English)
- `idx_questions_hu_fulltext` - Full-text search (Hungarian)

---

#### **4. answers**

**Purpose:** Correct answers for questions

| Column                    | Type         | Description               |
| ------------------------- | ------------ | ------------------------- |
| `id`                      | SERIAL (PK)  | Auto-incrementing ID      |
| `question_id`             | INTEGER (FK) | Parent question           |
| `answer_en` / `answer_hu` | TEXT         | Multilingual answer text  |
| `order_index`             | INTEGER      | Ranked order (popularity) |
| `is_alternative`          | BOOLEAN      | Alternative spelling flag |
| `parent_answer_id`        | INTEGER (FK) | Link to main answer       |
| `times_given`             | INTEGER      | Usage count               |

**Key Features:**

- ✅ Multiple correct answers per question
- ✅ Alternative spellings support
- ✅ Ranked ordering (e.g., "1. Most popular")
- ✅ Usage tracking

**Indexes:**

- `idx_answers_question_id` - Fast question lookup
- `idx_answers_en_fulltext` - Full-text search
- `idx_answers_hu_fulltext` - Full-text search

---

### **Access Control Tables**

#### **5. user_question_set_access**

**Purpose:** Track which users can access which question sets

| Column               | Type         | Description                   |
| -------------------- | ------------ | ----------------------------- |
| `id`                 | SERIAL (PK)  | Auto-incrementing ID          |
| `user_id`            | TEXT (FK)    | User who has access           |
| `set_id`             | INTEGER (FK) | Question set                  |
| `granted_at`         | TIMESTAMP    | When access was granted       |
| `expires_at`         | TIMESTAMP    | Expiration (NULL = permanent) |
| `granted_by`         | ENUM         | How access was obtained       |
| `granted_by_user_id` | TEXT (FK)    | Admin who granted access      |
| `is_active`          | BOOLEAN      | Active status                 |
| `metadata`           | JSONB        | Purchase info, promo codes    |

**Grant Sources:**

- `signup` - Free set access on signup
- `purchase` - Paid purchase
- `admin` - Admin grant
- `promotion` - Promotional access
- `creator` - Creator access

**Key Features:**

- ✅ Time-limited access support
- ✅ Track grant source
- ✅ Unique constraint per user+set
- ✅ Expiration handling

**Indexes:**

- `idx_user_set_access_user_id` - User's sets
- `idx_user_set_access_expires` - Expiration queries
- `idx_user_set_access_active` - Active access only

---

### **Game Tracking Tables**

#### **6. game_sessions**

**Purpose:** Track individual game rounds

| Column                 | Type         | Description                             |
| ---------------------- | ------------ | --------------------------------------- |
| `id`                   | SERIAL (PK)  | Auto-incrementing ID                    |
| `user_id`              | TEXT (FK)    | Game master                             |
| `set_id`               | INTEGER (FK) | Question set used                       |
| `started_at`           | TIMESTAMP    | Session start time                      |
| `completed_at`         | TIMESTAMP    | Session end time                        |
| `status`               | ENUM         | `in_progress`, `completed`, `abandoned` |
| `players_count`        | INTEGER      | Number of players                       |
| `initial_lives`        | INTEGER      | Starting lives per player               |
| `questions_played`     | INTEGER      | Questions used                          |
| `total_answers_marked` | INTEGER      | Total correct answers                   |
| `duration_seconds`     | INTEGER      | Game duration                           |
| `metadata`             | JSONB        | Player names, game mode                 |

**Key Features:**

- ✅ Session lifecycle tracking
- ✅ Game configuration stored
- ✅ Analytics data collection
- ✅ Duration calculation

**Indexes:**

- `idx_game_sessions_user_id` - User's games
- `idx_game_sessions_started_at` - Recent games
- `idx_game_sessions_status` - Filter by status

---

#### **7. question_usage**

**Purpose:** Track questions used in game sessions

| Column                 | Type         | Description               |
| ---------------------- | ------------ | ------------------------- |
| `id`                   | SERIAL (PK)  | Auto-incrementing ID      |
| `session_id`           | INTEGER (FK) | Game session              |
| `question_id`          | INTEGER (FK) | Question used             |
| `marked_answer_ids`    | INTEGER[]    | Array of given answer IDs |
| `marked_at`            | TIMESTAMP    | When question was used    |
| `completed_at`         | TIMESTAMP    | When all answers found    |
| `answers_marked_count` | INTEGER      | Number of answers given   |
| `bluff_calls_count`    | INTEGER      | "Humbug!" calls           |
| `metadata`             | JSONB        | Notes, difficulty rating  |

**Key Features:**

- ✅ Detailed answer tracking
- ✅ Bluff call analytics
- ✅ Completion tracking
- ✅ PostgreSQL array for answer IDs

**Indexes:**

- `idx_question_usage_session_id` - Session's questions
- `idx_question_usage_question_id` - Question analytics

---

### **Admin & Moderation Tables**

#### **8. audit_log**

**Purpose:** Security and compliance audit trail

| Column        | Type        | Description                      |
| ------------- | ----------- | -------------------------------- |
| `id`          | SERIAL (PK) | Auto-incrementing ID             |
| `user_id`     | TEXT (FK)   | User who performed action        |
| `user_email`  | TEXT        | Cached email (for deleted users) |
| `action`      | TEXT        | Action identifier (dot notation) |
| `entity_type` | TEXT        | Type of entity affected          |
| `entity_id`   | TEXT        | ID of entity                     |
| `created_at`  | TIMESTAMP   | When action occurred             |
| `old_values`  | JSONB       | Before state                     |
| `new_values`  | JSONB       | After state                      |
| `metadata`    | JSONB       | Additional context               |
| `ip_address`  | INET        | Request IP                       |
| `user_agent`  | TEXT        | Browser/client info              |
| `request_id`  | TEXT        | Request correlation ID           |

**Action Examples:**

- `user.created`
- `user.login`
- `question.created`
- `question.updated`
- `question.deleted`
- `access.granted`
- `session.completed`

**Key Features:**

- ✅ Complete audit trail
- ✅ Before/after state tracking
- ✅ Request correlation
- ✅ IP and user agent logging

---

#### **9. user_reports**

**Purpose:** User-submitted content reports

| Column             | Type        | Description           |
| ------------------ | ----------- | --------------------- |
| `id`               | SERIAL (PK) | Auto-incrementing ID  |
| `reporter_id`      | TEXT (FK)   | User who reported     |
| `entity_type`      | TEXT        | What was reported     |
| `entity_id`        | INTEGER     | ID of reported entity |
| `reason`           | TEXT        | Report reason         |
| `description`      | TEXT        | Detailed description  |
| `status`           | TEXT        | Report status         |
| `reviewed_by`      | TEXT (FK)   | Admin who reviewed    |
| `reviewed_at`      | TIMESTAMP   | Review time           |
| `resolution_notes` | TEXT        | Admin notes           |

**Reasons:**

- `incorrect` - Factually wrong
- `offensive` - Inappropriate content
- `duplicate` - Duplicate question
- `outdated` - Outdated information
- `other` - Other issues

**Statuses:**

- `pending` - Awaiting review
- `reviewed` - Under review
- `resolved` - Fixed
- `dismissed` - Not an issue

---

## 🔧 Triggers & Functions

### **Automatic Triggers**

#### **1. update_updated_at_column()**

**Applied to:** `users`, `question_sets`, `questions`, `user_reports`

Automatically updates `updated_at` timestamp on row modification.

```sql
-- Example usage
UPDATE users SET name = 'New Name' WHERE id = '123';
-- updated_at is automatically set to NOW()
```

---

#### **2. update_question_set_count()**

**Applied to:** `questions` (INSERT/DELETE)

Maintains `question_count` in `question_sets` table.

```sql
-- When question is inserted
INSERT INTO questions (set_id, ...) VALUES (1, ...);
-- question_sets.question_count is incremented

-- When question is deleted
DELETE FROM questions WHERE id = 5;
-- question_sets.question_count is decremented
```

---

#### **3. update_answer_count()**

**Applied to:** `answers` (INSERT/DELETE)

Updates `metadata.estimatedAnswers` in `questions` table.

```sql
-- When answer is inserted
INSERT INTO answers (question_id, ...) VALUES (10, ...);
-- questions.metadata->>'estimatedAnswers' is updated
```

---

### **Helper Functions**

#### **1. user_has_set_access(user_id, set_id)**

**Returns:** BOOLEAN

Checks if a user has access to a question set.

**Logic:**

1. Free sets → Everyone has access
2. Admin users → Access to everything
3. Premium sets → Check `user_question_set_access` table
4. Admin-only sets → Only admins

```sql
-- Example usage
SELECT user_has_set_access('google_user_123', 5);
-- Returns: true/false
```

---

#### **2. get_user_accessible_sets(user_id)**

**Returns:** TABLE(set_id INTEGER)

Returns all question sets accessible to a user.

```sql
-- Example usage
SELECT * FROM get_user_accessible_sets('google_user_123');
-- Returns: list of set IDs
```

---

## 📊 Views

### **1. active_questions**

Convenient view for active questions with set information.

```sql
SELECT * FROM active_questions
WHERE category = 'sports'
ORDER BY order_index;
```

**Columns:**

- All question columns
- `set_slug`, `set_name_en`, `set_name_hu`
- `answer_count` (computed)

---

### **2. user_access_summary**

Summary of user access permissions.

```sql
SELECT * FROM user_access_summary
WHERE user_id = 'google_user_123';
```

**Columns:**

- `user_id`, `email`, `name`, `role`
- `accessible_sets_count`
- `accessible_set_slugs` (array)

---

## 🔐 Security Considerations

### **1. Access Control**

- ✅ Role-based permissions (`free`, `premium`, `admin`, `creator`)
- ✅ Question set access levels (`free`, `premium`, `admin_only`)
- ✅ Time-limited access support
- ✅ Helper functions for access checks

### **2. Data Protection**

- ✅ Cascade deletes configured
- ✅ Foreign key constraints
- ✅ CHECK constraints for data validation
- ✅ Unique constraints prevent duplicates

### **3. Audit & Compliance**

- ✅ Comprehensive audit log
- ✅ User action tracking
- ✅ IP address logging
- ✅ Before/after state tracking

### **4. Input Validation**

- ✅ Email format validation
- ✅ URL format validation
- ✅ Enum constraints
- ✅ Range checks (players_count, initial_lives)

---

## 📈 Performance Optimizations

### **Indexes**

- ✅ B-tree indexes on foreign keys
- ✅ GIN indexes on JSONB columns
- ✅ Full-text search indexes (EN/HU)
- ✅ Composite indexes for common queries
- ✅ Partial indexes for filtered queries

### **Denormalization**

- ✅ `question_count` in `question_sets`
- ✅ `estimatedAnswers` in `questions.metadata`
- ✅ `user_email` cached in `audit_log`
- ✅ Statistics counters updated by triggers

### **Query Optimization**

- ✅ Helper functions marked as `STABLE`
- ✅ Views for common query patterns
- ✅ Array columns for many-to-many relationships
- ✅ JSONB for flexible metadata

---

## 🚀 Scaling Considerations

### **Current Limits (Free Tier)**

- **Storage:** 256 MB (~500+ question sets, 10K+ questions)
- **Connections:** Unlimited (pooled via Neon)
- **Compute:** 60 hours/month

### **Expected Growth**

- **Users:** 10K users = ~50 MB
- **Questions:** 1K questions with 20 answers avg = ~5 MB
- **Game Sessions:** 100K sessions = ~20 MB
- **Audit Logs:** 1M entries = ~100 MB

### **Scalability Features**

- ✅ Serverless-friendly (Neon/Vercel Postgres)
- ✅ Connection pooling built-in
- ✅ Efficient indexes for large datasets
- ✅ Partitioning-ready schema (if needed)

---

## 📝 Migration Path

### **Phase 1: Setup**

1. Provision Vercel Postgres
2. Run `schema.sql`
3. Verify tables created
4. Update admin user with real Google ID

### **Phase 2: Data Migration**

1. Run migration script (import from JSON)
2. Verify question count matches
3. Test access functions
4. Verify triggers working

### **Phase 3: Integration**

1. Connect API endpoints
2. Test CRUD operations
3. Verify access control
4. Load testing

---

## 🎯 Next Steps

1. **Review schema** - Confirm all requirements met
2. **Provision database** - Enable Vercel Postgres
3. **Run schema.sql** - Create all tables
4. **Create migration script** - Import existing 22 questions
5. **Build API layer** - Serverless functions for CRUD
6. **Update frontend** - Connect to API

---

**Ready to implement! 🚀**
