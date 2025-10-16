# HUMBUG! Persistence Layer Implementation Plan

**Date:** October 16, 2025  
**Status:** Planning Phase  
**Goal:** Migrate questions and user data from frontend JSON files to a serverless backend with database persistence

---

## 📋 Current State Analysis

### Authentication (✅ Already Implemented)

- **Google OAuth** implemented via Vercel serverless functions (`/api/auth/*`)
- **JWT tokens** stored in HTTP-only cookies (7-day expiry)
- **User data** stored in JWT: `userId`, `email`, `name`, `picture`
- **Session management** functional

### Questions Data (❌ Needs Migration)

- **Current location:** Frontend JSON files (`src/locales/en.json`, `src/locales/hu.json`)
- **Structure:** Embedded in locale files under `allQuestions` array
- **Limitations:**
  - No version control for question sets
  - No user-specific access control
  - No ability to create multiple question packs
  - All questions loaded on frontend (security concern)
  - No analytics on question usage

### User Progress (❌ Needs Implementation)

- **Current state:** Not tracked persistently
- **Needed features:**
  - Track which question sets users have unlocked
  - Save game state/progress
  - Track correct answers marked during gameplay
  - User preferences and settings

---

## 🎯 Proposed Architecture

### Database Solution: **Vercel Postgres** (Recommended)

**Why Vercel Postgres?**

- ✅ Native integration with Vercel (same platform)
- ✅ Serverless-friendly with connection pooling
- ✅ Free tier: 256MB storage, 60 hours compute/month
- ✅ Automatic scaling
- ✅ Built on Neon (modern serverless Postgres)
- ✅ Easy setup via Vercel dashboard
- ✅ SQL-based (familiar, powerful, flexible)

**Alternative Considered:**

- **Vercel KV (Redis)**: Good for caching, but less suitable for complex relational data
- **MongoDB Atlas**: Requires separate service, more complex setup
- **Supabase**: Good option but adds another service dependency

---

## 🗄️ Database Schema Design

```sql
-- Users Table (extends Google OAuth data)
CREATE TABLE users (
  id TEXT PRIMARY KEY,              -- Google user ID
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  picture TEXT,
  role TEXT DEFAULT 'free',         -- 'free', 'premium', 'admin'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP DEFAULT NOW(),
  preferences JSONB DEFAULT '{}'    -- User settings (language, music, etc.)
);

-- Question Sets (Collections/Packs of questions)
CREATE TABLE question_sets (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,        -- 'original', 'sports-pack', 'tech-pack'
  name_en TEXT NOT NULL,            -- "Original HUMBUG! Questions"
  name_hu TEXT NOT NULL,            -- "Eredeti HUMBUG! Kérdések"
  description_en TEXT,
  description_hu TEXT,
  access_level TEXT DEFAULT 'free', -- 'free', 'premium', 'admin'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  creator_id TEXT REFERENCES users(id),
  metadata JSONB DEFAULT '{}'       -- Tags, difficulty, etc.
);

-- Questions Table
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  set_id INTEGER REFERENCES question_sets(id) ON DELETE CASCADE,
  question_en TEXT NOT NULL,
  question_hu TEXT NOT NULL,
  category TEXT NOT NULL,           -- 'entertainment', 'sports', etc.
  source_name TEXT,
  source_url TEXT,
  order_index INTEGER,              -- Display order within set
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Answers Table (for each question)
CREATE TABLE answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  answer_en TEXT NOT NULL,
  answer_hu TEXT NOT NULL,
  order_index INTEGER,              -- Display order
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Access to Question Sets
CREATE TABLE user_question_set_access (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  set_id INTEGER REFERENCES question_sets(id) ON DELETE CASCADE,
  granted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,             -- NULL for permanent access
  granted_by TEXT,                  -- 'purchase', 'admin', 'promotion'
  UNIQUE(user_id, set_id)
);

-- Game Sessions (track gameplay)
CREATE TABLE game_sessions (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  set_id INTEGER REFERENCES question_sets(id),
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  players_count INTEGER,
  metadata JSONB DEFAULT '{}'       -- Game settings, participants
);

-- Question Usage in Games (analytics)
CREATE TABLE question_usage (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES game_sessions(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(id),
  marked_answers INTEGER[],         -- Array of answer IDs marked as given
  marked_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_questions_set_id ON questions(set_id);
CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_user_access_user_id ON user_question_set_access(user_id);
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_question_usage_session_id ON question_usage(session_id);
```

---

## 🛠️ Implementation Phases

### **Phase 1: Database Setup & Migration** (Week 1)

**Priority:** HIGH

**Tasks:**

1. ✅ Enable Vercel Postgres in Vercel dashboard
2. ✅ Create database schema (run SQL above)
3. ✅ Create migration script to import existing questions from JSON
4. ✅ Create seed script for initial "Original" question set
5. ✅ Set up environment variables (`POSTGRES_URL`, etc.)

**Deliverables:**

- Database provisioned and schema created
- All 22 existing questions migrated to database
- "Original HUMBUG!" question set created with `access_level: 'free'`

---

### **Phase 2: API Endpoints** (Week 1-2)

**Priority:** HIGH

**New Serverless Functions:**

```
/api/questions/sets                 GET    - List all question sets (with access check)
/api/questions/sets/[slug]          GET    - Get specific question set details
/api/questions/sets/[slug]/questions GET   - Get all questions in a set (if user has access)
/api/questions/[id]                 GET    - Get single question with answers
/api/users/me                       GET    - Get current user profile + preferences
/api/users/me                       PATCH  - Update user preferences
/api/users/me/access                GET    - Get user's accessible question sets
/api/game/session                   POST   - Create new game session
/api/game/session/[id]/mark-answer  POST   - Mark answer as used in game
/api/game/session/[id]/complete     POST   - Complete game session
```

**Admin Endpoints (Phase 3):**

```
/api/admin/questions                POST   - Create new question
/api/admin/questions/[id]           PATCH  - Update question
/api/admin/questions/[id]           DELETE - Delete question
/api/admin/sets                     POST   - Create new question set
/api/admin/sets/[id]/publish        POST   - Publish question set
/api/admin/users/[id]/grant-access  POST   - Grant user access to set
```

**Deliverables:**

- Core API endpoints implemented
- Authentication middleware for protected routes
- Access control logic (free vs premium sets)
- Error handling and validation

---

### **Phase 3: Frontend Integration** (Week 2)

**Priority:** HIGH

**Tasks:**

1. ✅ Create API client utilities (`src/lib/api.ts`)
2. ✅ Add React Query or SWR for data fetching
3. ✅ Update `App.tsx` to fetch questions from API
4. ✅ Update `QuestionCard.tsx` to work with new data structure
5. ✅ Add loading states and error handling
6. ✅ Update category filtering to work with API data
7. ✅ Remove questions from locale JSON files (keep only translations)

**New Hooks:**

```typescript
// src/hooks/useQuestionSets.ts
useQuestionSets(); // Get all accessible sets

// src/hooks/useQuestions.ts
useQuestions(setSlug); // Get questions for a set

// src/hooks/useGameSession.ts
useGameSession(); // Manage game state
```

**Deliverables:**

- Questions loaded from API instead of JSON
- Seamless user experience (same UI, better data)
- Proper loading/error states

---

### **Phase 4: User Profile & Preferences** (Week 3)

**Priority:** MEDIUM

**Features:**

1. User profile page (`/profile`)
2. Preferences management:
   - Preferred language
   - Music auto-play
   - Visible categories
3. Question set access management UI
4. Game history view

**Deliverables:**

- User profile component
- Preferences form with persistence
- Access management UI

---

### **Phase 5: Question Set Management** (Week 3-4)

**Priority:** MEDIUM

**Features:**

1. Question set browser/marketplace
2. "Premium" question sets with unlock mechanism
3. Set preview (see questions before unlocking)
4. Access control UI

**UI Components:**

```tsx
<QuestionSetCard />         // Display set info, preview
<QuestionSetBrowser />      // Browse all available sets
<UnlockPrompt />           // Prompt to unlock premium sets
```

**Deliverables:**

- Question set browsing interface
- Access control working (free vs premium)
- Unlock flow (ready for payment integration)

---

### **Phase 6: Admin Panel** (Week 4)

**Priority:** LOW (initially)

**Features:**

1. Admin dashboard (`/admin`)
2. Question CRUD interface
3. Question set management
4. User management (grant access)
5. Analytics dashboard

**Components:**

```tsx
<AdminQuestionEditor />     // Create/edit questions
<AdminSetManager />        // Manage question sets
<AdminUserManager />       // User access management
<AdminAnalytics />         // Usage statistics
```

**Deliverables:**

- Admin-only routes protected by role check
- Question management interface
- User access management tools

---

### **Phase 7: Advanced Features** (Future)

**Priority:** LOW

**Possible Features:**

1. **Community Questions:** Users submit questions for review
2. **AI Question Generation:** Generate questions with LLM
3. **Difficulty Ratings:** Track question difficulty based on usage
4. **Multiplayer Sync:** Real-time game state sharing
5. **Leaderboards:** Track top players
6. **Question Packs Marketplace:** Paid premium packs
7. **Custom Sets:** Users create private question sets

---

## 📦 Required Dependencies

**Backend:**

```json
{
  "@vercel/postgres": "^0.10.0", // Vercel Postgres client
  "zod": "^3.23.0", // Schema validation
  "drizzle-orm": "^0.36.0", // Optional: ORM for type safety
  "drizzle-kit": "^0.28.0" // Optional: Migration tool
}
```

**Frontend:**

```json
{
  "@tanstack/react-query": "^5.59.0", // Data fetching & caching
  "axios": "^1.7.9" // HTTP client (or fetch)
}
```

---

## 🔐 Security Considerations

1. **Authentication:**

   - All API endpoints verify JWT tokens
   - User ID extracted from verified token (never trusted from client)

2. **Authorization:**

   - Access control checks before returning questions
   - Role-based permissions (free, premium, admin)
   - Question set access verified on every request

3. **Data Validation:**

   - Zod schemas for all API inputs
   - SQL injection prevention (parameterized queries)
   - Rate limiting on API endpoints

4. **Sensitive Data:**
   - Never expose full database in frontend
   - Only return questions user has access to
   - Admin endpoints require `role: 'admin'`

---

## 🚀 Migration Strategy

### Step-by-Step Migration (Zero Downtime)

1. **Setup Phase:**

   - Provision Vercel Postgres
   - Create schema
   - Import existing questions

2. **Dual Mode Phase:**

   - API returns questions from database
   - Frontend still has JSON fallback
   - Test in production with feature flag

3. **Switch Phase:**

   - Remove JSON questions from locale files
   - Frontend exclusively uses API
   - Monitor for issues

4. **Cleanup Phase:**
   - Remove old JSON parsing code
   - Remove fallback logic
   - Update documentation

---

## 📊 Data Migration Script

```typescript
// scripts/migrate-questions-to-db.ts
import { sql } from "@vercel/postgres";
import enQuestions from "../src/locales/en.json" assert { type: "json" };
import huQuestions from "../src/locales/hu.json" assert { type: "json" };

async function migrateQuestions() {
  // 1. Create "Original HUMBUG!" question set
  const setResult = await sql`
    INSERT INTO question_sets (slug, name_en, name_hu, access_level)
    VALUES ('original', 'Original HUMBUG!', 'Eredeti HUMBUG!', 'free')
    RETURNING id
  `;
  const setId = setResult.rows[0].id;

  // 2. Insert each question
  for (let i = 0; i < enQuestions.allQuestions.length; i++) {
    const enQ = enQuestions.allQuestions[i];
    const huQ = huQuestions.allQuestions[i];

    const questionResult = await sql`
      INSERT INTO questions (
        set_id, question_en, question_hu, category,
        source_name, source_url, order_index
      )
      VALUES (
        ${setId}, ${enQ.question}, ${huQ.question}, ${enQ.category},
        ${enQ.sourceName}, ${enQ.sourceUrl}, ${i}
      )
      RETURNING id
    `;
    const questionId = questionResult.rows[0].id;

    // 3. Insert answers
    for (let j = 0; j < enQ.answers.length; j++) {
      await sql`
        INSERT INTO answers (question_id, answer_en, answer_hu, order_index)
        VALUES (${questionId}, ${enQ.answers[j]}, ${huQ.answers[j]}, ${j})
      `;
    }

    console.log(
      `Migrated question ${i + 1}/${enQuestions.allQuestions.length}`
    );
  }

  console.log("✅ Migration complete!");
}

migrateQuestions();
```

---

## 💰 Cost Estimation

### Vercel Postgres Free Tier

- **Storage:** 256 MB (sufficient for 1000+ questions)
- **Compute:** 60 hours/month
- **Connections:** Pooled (unlimited with Neon)

### Expected Usage (1000 monthly active users)

- **API calls:** ~50,000/month (well within free tier)
- **Database queries:** ~100,000/month (free tier handles easily)
- **Storage:** ~10 MB for 500 questions

**Recommendation:** Start with free tier, upgrade only if needed

---

## ✅ Success Metrics

1. **Performance:**

   - API response time < 200ms
   - Page load time unchanged
   - Zero downtime during migration

2. **Functionality:**

   - All 22 questions accessible after migration
   - User authentication working
   - Access control functioning correctly

3. **Scalability:**
   - Can add new question sets without code changes
   - Admin can manage questions via UI
   - Ready for premium features

---

## 📝 Next Steps

1. **Review this plan** - Confirm approach and scope
2. **Provision Vercel Postgres** - Enable in Vercel dashboard
3. **Create database schema** - Run SQL migration
4. **Implement Phase 1** - Database setup and data migration
5. **Build API endpoints** - Start with read-only endpoints
6. **Update frontend** - Integrate API calls

---

## 🤔 Questions to Decide

1. **Pricing Model:** How will premium question sets be unlocked?

   - One-time payment?
   - Subscription?
   - Free with ads?

2. **Admin Access:** Who should have admin rights initially?

   - Just you?
   - Multiple content creators?

3. **Question Visibility:** Should free users see locked questions?

   - Preview mode (see question, not answers)?
   - Completely hidden?
   - Show count only?

4. **ORM or Raw SQL:**
   - Use Drizzle ORM for type safety?
   - Or stick with raw SQL for simplicity?

---

**Ready to proceed? Let me know and I'll start with Phase 1!** 🚀
