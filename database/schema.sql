-- ============================================================================
-- HUMBUG! Quiz Game - Database Schema
-- ============================================================================
-- Database: PostgreSQL (Vercel Postgres / Neon)
-- Version: 1.0
-- Date: 2025-10-16
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID generation (optional, using TEXT for Google IDs instead)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable case-insensitive text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- User roles enum
CREATE TYPE user_role AS ENUM ('free', 'premium', 'admin', 'creator');

-- Question set access level
CREATE TYPE access_level AS ENUM ('free', 'premium', 'admin_only');

-- Access grant source
CREATE TYPE grant_source AS ENUM ('signup', 'purchase', 'admin', 'promotion', 'creator');

-- Question difficulty (for future use)
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard', 'expert');

-- Pack type enum (content type classification)
CREATE TYPE pack_type AS ENUM (
  'quiz',              -- Standard trivia quiz (default)
  'challenge',         -- Timed challenges or competitive mode
  'learning',          -- Educational content with explanations
  'party',             -- Party game mode with special rules
  'kids',              -- Kid-friendly content
  'expert',            -- Advanced/expert level content
  'seasonal',          -- Holiday or seasonal content
  'custom'             -- User-created or special packs
);

-- Game session status
CREATE TYPE session_status AS ENUM ('in_progress', 'completed', 'abandoned');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Users Table
-- ----------------------------------------------------------------------------
-- Stores user account information, extending Google OAuth data
-- Primary user record linked to Google authentication
-- ----------------------------------------------------------------------------

CREATE TABLE users (
  -- Identity
  id TEXT PRIMARY KEY,                    -- Google user ID (from OAuth)
  email TEXT UNIQUE NOT NULL,             -- User email (from Google)
  name TEXT NOT NULL,                     -- Display name (from Google)
  picture TEXT,                           -- Profile picture URL (from Google)
  
  -- Account status
  role user_role DEFAULT 'free' NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  is_email_verified BOOLEAN DEFAULT true, -- From Google OAuth
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- User preferences (JSONB for flexibility)
  preferences JSONB DEFAULT '{
    "language": "en",
    "autoPlayMusic": false,
    "visibleCategories": ["entertainment", "travel", "sports", "technology", "gastronomy", "culture"],
    "theme": "dark",
    "soundEffects": true,
    "notifications": true
  }'::jsonb NOT NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,     -- Additional data (referral source, etc.)
  
  -- Constraints
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_preferences ON users USING gin(preferences);

-- Comments
COMMENT ON TABLE users IS 'Core user accounts linked to Google OAuth';
COMMENT ON COLUMN users.id IS 'Google user ID (sub claim from JWT)';
COMMENT ON COLUMN users.preferences IS 'User settings: language, music, categories, theme';
COMMENT ON COLUMN users.metadata IS 'Extensible field for future data';

-- ----------------------------------------------------------------------------
-- Question Sets Table
-- ----------------------------------------------------------------------------
-- Collections/packs of questions (e.g., "Original", "Sports Pack")
-- Supports multiple languages and access control
-- ----------------------------------------------------------------------------

CREATE TABLE question_sets (
  -- Identity
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,              -- URL-friendly identifier (e.g., 'original', 'sports-pack')
  
  -- Multilingual content
  name_en TEXT NOT NULL,                  -- English name
  name_hu TEXT NOT NULL,                  -- Hungarian name
  description_en TEXT,                    -- English description
  description_hu TEXT,                    -- Hungarian description
  
  -- Access control
  access_level access_level DEFAULT 'free' NOT NULL,
  pack_type pack_type DEFAULT 'quiz' NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  is_published BOOLEAN DEFAULT false NOT NULL,
  
  -- Display
  cover_image_url TEXT,                   -- Set cover/thumbnail
  icon_url TEXT,                          -- Small icon
  display_order INTEGER DEFAULT 0,        -- Sort order in UI
  
  -- Ownership
  creator_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Statistics (denormalized for performance)
  question_count INTEGER DEFAULT 0,
  total_plays INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{
    "tags": [],
    "estimatedPlayTime": "30-45 min",
    "minPlayers": 3,
    "maxPlayers": 8,
    "ageRating": "12+"
  }'::jsonb,
  
  -- Constraints
  CONSTRAINT slug_format CHECK (slug ~* '^[a-z0-9-]+$'),
  CONSTRAINT valid_display_order CHECK (display_order >= 0)
);

-- Indexes
CREATE INDEX idx_question_sets_slug ON question_sets(slug);
CREATE INDEX idx_question_sets_access_level ON question_sets(access_level);
CREATE INDEX idx_question_sets_pack_type ON question_sets(pack_type);
CREATE INDEX idx_question_sets_is_active ON question_sets(is_active, is_published);
CREATE INDEX idx_question_sets_creator ON question_sets(creator_id);
CREATE INDEX idx_question_sets_display_order ON question_sets(display_order);
CREATE INDEX idx_question_sets_metadata ON question_sets USING gin(metadata);

-- Comments
COMMENT ON TABLE question_sets IS 'Collections of questions (e.g., Original HUMBUG!, Sports Pack)';
COMMENT ON COLUMN question_sets.slug IS 'URL-safe identifier for routing';
COMMENT ON COLUMN question_sets.is_published IS 'Only published sets are visible to users';
COMMENT ON COLUMN question_sets.question_count IS 'Cached count, updated via trigger';

-- ----------------------------------------------------------------------------
-- Questions Table
-- ----------------------------------------------------------------------------
-- Individual quiz questions with multilingual support
-- Belongs to a question set
-- ----------------------------------------------------------------------------

CREATE TABLE questions (
  -- Identity
  id SERIAL PRIMARY KEY,
  set_id INTEGER NOT NULL REFERENCES question_sets(id) ON DELETE CASCADE,
  
  -- Multilingual content
  question_en TEXT NOT NULL,              -- English question text
  question_hu TEXT NOT NULL,              -- Hungarian question text
  
  -- Categorization
  category TEXT NOT NULL,                 -- 'entertainment', 'sports', 'technology', etc.
  difficulty difficulty_level,            -- Optional difficulty rating
  
  -- Source attribution
  source_name TEXT,                       -- e.g., "Wikipedia", "IMDb"
  source_url TEXT,                        -- Full URL to source
  
  -- Display
  order_index INTEGER NOT NULL,           -- Display order within set
  is_active BOOLEAN DEFAULT true NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Statistics (denormalized)
  times_played INTEGER DEFAULT 0,
  times_completed INTEGER DEFAULT 0,      -- How many times all answers were found
  
  -- Metadata
  metadata JSONB DEFAULT '{
    "estimatedAnswers": 0,
    "averageAnswersGiven": 0,
    "difficultyRating": null
  }'::jsonb,
  
  -- Constraints
  CONSTRAINT valid_order_index CHECK (order_index >= 0),
  CONSTRAINT valid_category CHECK (category IN (
    'entertainment', 'travel', 'sports', 
    'technology', 'gastronomy', 'culture'
  )),
  CONSTRAINT valid_source_url CHECK (
    source_url IS NULL OR 
    source_url ~* '^https?://'
  )
);

-- Indexes
CREATE INDEX idx_questions_set_id ON questions(set_id, order_index);
CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_is_active ON questions(is_active);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_metadata ON questions USING gin(metadata);

-- Full-text search indexes
CREATE INDEX idx_questions_en_fulltext ON questions USING gin(to_tsvector('english', question_en));
CREATE INDEX idx_questions_hu_fulltext ON questions USING gin(to_tsvector('hungarian', question_hu));

-- Comments
COMMENT ON TABLE questions IS 'Individual quiz questions belonging to question sets';
COMMENT ON COLUMN questions.category IS 'Must match predefined categories';
COMMENT ON COLUMN questions.order_index IS 'Display order within the question set';
COMMENT ON COLUMN questions.times_completed IS 'Tracks how often all correct answers were identified';

-- ----------------------------------------------------------------------------
-- Answers Table
-- ----------------------------------------------------------------------------
-- Possible correct answers for each question
-- Supports multiple valid answers per question
-- ----------------------------------------------------------------------------

CREATE TABLE answers (
  -- Identity
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  
  -- Multilingual content
  answer_en TEXT NOT NULL,                -- English answer text
  answer_hu TEXT NOT NULL,                -- Hungarian answer text
  
  -- Display
  order_index INTEGER NOT NULL,           -- Display order (e.g., ranked by popularity)
  
  -- Metadata
  is_alternative BOOLEAN DEFAULT false,   -- Is this an alternative spelling/version?
  parent_answer_id INTEGER REFERENCES answers(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Statistics
  times_given INTEGER DEFAULT 0,          -- How often this answer was given in games
  
  -- Constraints
  CONSTRAINT valid_order_index CHECK (order_index >= 0)
);

-- Indexes
CREATE INDEX idx_answers_question_id ON answers(question_id, order_index);
CREATE INDEX idx_answers_parent ON answers(parent_answer_id);

-- Full-text search
CREATE INDEX idx_answers_en_fulltext ON answers USING gin(to_tsvector('english', answer_en));
CREATE INDEX idx_answers_hu_fulltext ON answers USING gin(to_tsvector('hungarian', answer_hu));

-- Comments
COMMENT ON TABLE answers IS 'Correct answers for quiz questions';
COMMENT ON COLUMN answers.order_index IS 'Ranked order (e.g., 1. Most popular, 2. Second most)';
COMMENT ON COLUMN answers.is_alternative IS 'True for alternative spellings of same answer';
COMMENT ON COLUMN answers.parent_answer_id IS 'Links to main answer if this is an alternative';

-- ============================================================================
-- ACCESS CONTROL & PERMISSIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- User Question Set Access Table
-- ----------------------------------------------------------------------------
-- Tracks which users have access to which question sets
-- Supports time-limited access and different grant sources
-- ----------------------------------------------------------------------------

CREATE TABLE user_question_set_access (
  -- Identity
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  set_id INTEGER NOT NULL REFERENCES question_sets(id) ON DELETE CASCADE,
  
  -- Access details
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,    -- NULL = permanent access
  granted_by grant_source NOT NULL,
  granted_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT true NOT NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,     -- Purchase info, promo code, etc.
  
  -- Constraints
  CONSTRAINT unique_user_set_access UNIQUE(user_id, set_id),
  CONSTRAINT valid_expiry CHECK (
    expires_at IS NULL OR 
    expires_at > granted_at
  )
);

-- Indexes
CREATE INDEX idx_user_set_access_user_id ON user_question_set_access(user_id);
CREATE INDEX idx_user_set_access_set_id ON user_question_set_access(set_id);
CREATE INDEX idx_user_set_access_expires ON user_question_set_access(expires_at) 
  WHERE expires_at IS NOT NULL;
CREATE INDEX idx_user_set_access_active ON user_question_set_access(user_id, is_active) 
  WHERE is_active = true;

-- Comments
COMMENT ON TABLE user_question_set_access IS 'User permissions for question sets';
COMMENT ON COLUMN user_question_set_access.expires_at IS 'NULL for permanent access';
COMMENT ON COLUMN user_question_set_access.granted_by IS 'How access was obtained';

-- ============================================================================
-- GAME TRACKING & ANALYTICS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Game Sessions Table
-- ----------------------------------------------------------------------------
-- Tracks individual game sessions for analytics and progress
-- One session = one game round with a group
-- ----------------------------------------------------------------------------

CREATE TABLE game_sessions (
  -- Identity
  id SERIAL PRIMARY KEY,
  
  -- References
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,  -- Game master
  set_id INTEGER NOT NULL REFERENCES question_sets(id) ON DELETE CASCADE,
  
  -- Session info
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  status session_status DEFAULT 'in_progress' NOT NULL,
  
  -- Game configuration
  players_count INTEGER,
  initial_lives INTEGER DEFAULT 3,
  
  -- Session metadata
  metadata JSONB DEFAULT '{
    "playerNames": [],
    "gameMode": "classic",
    "difficulty": null,
    "location": null
  }'::jsonb,
  
  -- Statistics
  questions_played INTEGER DEFAULT 0,
  total_answers_marked INTEGER DEFAULT 0,
  duration_seconds INTEGER,               -- Calculated on completion
  
  -- Constraints
  CONSTRAINT valid_players_count CHECK (
    players_count IS NULL OR 
    (players_count >= 2 AND players_count <= 20)
  ),
  CONSTRAINT valid_initial_lives CHECK (
    initial_lives >= 1 AND initial_lives <= 10
  ),
  CONSTRAINT valid_completion CHECK (
    (status = 'in_progress' AND completed_at IS NULL) OR
    (status IN ('completed', 'abandoned') AND completed_at IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_set_id ON game_sessions(set_id);
CREATE INDEX idx_game_sessions_started_at ON game_sessions(started_at DESC);
CREATE INDEX idx_game_sessions_status ON game_sessions(status);
CREATE INDEX idx_game_sessions_metadata ON game_sessions USING gin(metadata);

-- Comments
COMMENT ON TABLE game_sessions IS 'Individual game rounds for tracking and analytics';
COMMENT ON COLUMN game_sessions.user_id IS 'Game master who started the session';
COMMENT ON COLUMN game_sessions.duration_seconds IS 'Total game duration in seconds';

-- ----------------------------------------------------------------------------
-- Question Usage Table
-- ----------------------------------------------------------------------------
-- Tracks which questions were used in which game sessions
-- Records answers that were marked as given during gameplay
-- ----------------------------------------------------------------------------

CREATE TABLE question_usage (
  -- Identity
  id SERIAL PRIMARY KEY,
  
  -- References
  session_id INTEGER NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  
  -- Usage details
  marked_answer_ids INTEGER[] DEFAULT ARRAY[]::INTEGER[],  -- Array of answer IDs
  marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,  -- When all answers were found
  
  -- Statistics
  answers_marked_count INTEGER DEFAULT 0,
  bluff_calls_count INTEGER DEFAULT 0,    -- How many "Humbug!" calls
  
  -- Metadata
  metadata JSONB DEFAULT '{
    "skipped": false,
    "difficulty": null,
    "notes": null
  }'::jsonb,
  
  -- Constraints
  CONSTRAINT unique_session_question UNIQUE(session_id, question_id),
  CONSTRAINT valid_marked_count CHECK (answers_marked_count >= 0)
);

-- Indexes
CREATE INDEX idx_question_usage_session_id ON question_usage(session_id);
CREATE INDEX idx_question_usage_question_id ON question_usage(question_id);
CREATE INDEX idx_question_usage_marked_at ON question_usage(marked_at);
CREATE INDEX idx_question_usage_completed ON question_usage(completed_at) 
  WHERE completed_at IS NOT NULL;

-- Comments
COMMENT ON TABLE question_usage IS 'Tracks questions used in game sessions with marked answers';
COMMENT ON COLUMN question_usage.marked_answer_ids IS 'Array of answer IDs that were correctly given';
COMMENT ON COLUMN question_usage.completed_at IS 'When all possible answers were found';

-- ============================================================================
-- ADMIN & MODERATION
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Audit Log Table
-- ----------------------------------------------------------------------------
-- Tracks important actions for security and debugging
-- Records user actions, admin changes, system events
-- ----------------------------------------------------------------------------

CREATE TABLE audit_log (
  -- Identity
  id SERIAL PRIMARY KEY,
  
  -- Who
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  user_email TEXT,                        -- Cached for deleted users
  
  -- What
  action TEXT NOT NULL,                   -- 'user.created', 'question.updated', etc.
  entity_type TEXT NOT NULL,              -- 'user', 'question', 'question_set', etc.
  entity_id TEXT,                         -- ID of affected entity
  
  -- When
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Details
  old_values JSONB,                       -- Before state
  new_values JSONB,                       -- After state
  metadata JSONB DEFAULT '{}'::jsonb,     -- Additional context
  
  -- Request context
  ip_address INET,
  user_agent TEXT,
  request_id TEXT                         -- For correlating requests
);

-- Indexes
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

-- Comments
COMMENT ON TABLE audit_log IS 'Audit trail for security and compliance';
COMMENT ON COLUMN audit_log.action IS 'Dot-notation action name (e.g., user.created)';
COMMENT ON COLUMN audit_log.entity_type IS 'Type of entity affected';

-- ----------------------------------------------------------------------------
-- User Reports Table
-- ----------------------------------------------------------------------------
-- Allows users to report issues with questions or content
-- For moderation and quality control
-- ----------------------------------------------------------------------------

CREATE TABLE user_reports (
  -- Identity
  id SERIAL PRIMARY KEY,
  
  -- Reporter
  reporter_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  
  -- What's being reported
  entity_type TEXT NOT NULL,              -- 'question', 'answer', 'question_set'
  entity_id INTEGER NOT NULL,
  
  -- Report details
  reason TEXT NOT NULL,                   -- 'incorrect', 'offensive', 'duplicate', etc.
  description TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'reviewed', 'resolved', 'dismissed'
  reviewed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_status CHECK (
    status IN ('pending', 'reviewed', 'resolved', 'dismissed')
  ),
  CONSTRAINT valid_reason CHECK (
    reason IN ('incorrect', 'offensive', 'duplicate', 'outdated', 'other')
  )
);

-- Indexes
CREATE INDEX idx_user_reports_reporter ON user_reports(reporter_id);
CREATE INDEX idx_user_reports_entity ON user_reports(entity_type, entity_id);
CREATE INDEX idx_user_reports_status ON user_reports(status);
CREATE INDEX idx_user_reports_created_at ON user_reports(created_at DESC);

-- Comments
COMMENT ON TABLE user_reports IS 'User-submitted reports for content moderation';

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Updated At Trigger Function
-- ----------------------------------------------------------------------------
-- Automatically updates updated_at timestamp on row modification
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_sets_updated_at BEFORE UPDATE ON question_sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_reports_updated_at BEFORE UPDATE ON user_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- Question Count Update Trigger
-- ----------------------------------------------------------------------------
-- Maintains question_count in question_sets table
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_question_set_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    UPDATE question_sets 
    SET question_count = question_count - 1
    WHERE id = OLD.set_id;
    RETURN OLD;
  ELSIF (TG_OP = 'INSERT') THEN
    UPDATE question_sets 
    SET question_count = question_count + 1
    WHERE id = NEW.set_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_question_count_on_insert 
  AFTER INSERT ON questions
  FOR EACH ROW EXECUTE FUNCTION update_question_set_count();

CREATE TRIGGER update_question_count_on_delete 
  AFTER DELETE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_question_set_count();

-- ----------------------------------------------------------------------------
-- Answer Count Update Trigger
-- ----------------------------------------------------------------------------
-- Updates metadata.estimatedAnswers in questions table
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_answer_count()
RETURNS TRIGGER AS $$
DECLARE
  answer_count INTEGER;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    SELECT COUNT(*) INTO answer_count
    FROM answers WHERE question_id = OLD.question_id;
    
    UPDATE questions
    SET metadata = jsonb_set(
      metadata,
      '{estimatedAnswers}',
      to_jsonb(answer_count)
    )
    WHERE id = OLD.question_id;
    RETURN OLD;
    
  ELSIF (TG_OP = 'INSERT') THEN
    SELECT COUNT(*) INTO answer_count
    FROM answers WHERE question_id = NEW.question_id;
    
    UPDATE questions
    SET metadata = jsonb_set(
      metadata,
      '{estimatedAnswers}',
      to_jsonb(answer_count)
    )
    WHERE id = NEW.question_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_answer_count_on_insert 
  AFTER INSERT ON answers
  FOR EACH ROW EXECUTE FUNCTION update_answer_count();

CREATE TRIGGER update_answer_count_on_delete 
  AFTER DELETE ON answers
  FOR EACH ROW EXECUTE FUNCTION update_answer_count();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Check User Access to Question Set
-- ----------------------------------------------------------------------------
-- Returns true if user has access to the question set
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION user_has_set_access(
  p_user_id TEXT,
  p_set_id INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  set_access_level access_level;
  user_role_level user_role;
  has_explicit_access BOOLEAN;
BEGIN
  -- Get question set access level
  SELECT access_level INTO set_access_level
  FROM question_sets
  WHERE id = p_set_id AND is_active = true AND is_published = true;
  
  -- If set doesn't exist or is inactive, no access
  IF set_access_level IS NULL THEN
    RETURN false;
  END IF;
  
  -- If set is free, everyone has access
  IF set_access_level = 'free' THEN
    RETURN true;
  END IF;
  
  -- If user is not logged in, no access to non-free sets
  IF p_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get user role
  SELECT role INTO user_role_level
  FROM users
  WHERE id = p_user_id AND is_active = true;
  
  -- Admins have access to everything
  IF user_role_level = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Check if set is admin-only
  IF set_access_level = 'admin_only' THEN
    RETURN false;
  END IF;
  
  -- Check for explicit access grant
  SELECT EXISTS(
    SELECT 1
    FROM user_question_set_access
    WHERE user_id = p_user_id
      AND set_id = p_set_id
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO has_explicit_access;
  
  RETURN has_explicit_access;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION user_has_set_access IS 'Check if user has access to a question set';

-- ----------------------------------------------------------------------------
-- Get Accessible Question Sets for User
-- ----------------------------------------------------------------------------
-- Returns all question sets the user can access
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_user_accessible_sets(p_user_id TEXT)
RETURNS TABLE(set_id INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT qs.id
  FROM question_sets qs
  WHERE qs.is_active = true 
    AND qs.is_published = true
    AND (
      -- Free sets
      qs.access_level = 'free'
      -- Or user has explicit access
      OR EXISTS(
        SELECT 1
        FROM user_question_set_access uqsa
        WHERE uqsa.set_id = qs.id
          AND uqsa.user_id = p_user_id
          AND uqsa.is_active = true
          AND (uqsa.expires_at IS NULL OR uqsa.expires_at > NOW())
      )
      -- Or user is admin
      OR EXISTS(
        SELECT 1
        FROM users u
        WHERE u.id = p_user_id
          AND u.role = 'admin'
          AND u.is_active = true
      )
    )
  ORDER BY qs.display_order, qs.id;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_user_accessible_sets IS 'Get all question sets accessible to a user';

-- ============================================================================
-- VIEWS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Active Questions View
-- ----------------------------------------------------------------------------
-- Convenient view for active questions with answer count
-- ----------------------------------------------------------------------------

CREATE OR REPLACE VIEW active_questions AS
SELECT 
  q.*,
  qs.slug as set_slug,
  qs.name_en as set_name_en,
  qs.name_hu as set_name_hu,
  (q.metadata->>'estimatedAnswers')::INTEGER as answer_count
FROM questions q
JOIN question_sets qs ON q.set_id = qs.id
WHERE q.is_active = true
  AND qs.is_active = true
  AND qs.is_published = true;

COMMENT ON VIEW active_questions IS 'Active questions with set information';

-- ----------------------------------------------------------------------------
-- User Access Summary View
-- ----------------------------------------------------------------------------
-- Summary of user access permissions
-- ----------------------------------------------------------------------------

CREATE OR REPLACE VIEW user_access_summary AS
SELECT 
  u.id as user_id,
  u.email,
  u.name,
  u.role,
  COUNT(DISTINCT uqsa.set_id) as accessible_sets_count,
  array_agg(DISTINCT qs.slug ORDER BY qs.slug) FILTER (WHERE qs.slug IS NOT NULL) as accessible_set_slugs
FROM users u
LEFT JOIN user_question_set_access uqsa ON u.id = uqsa.user_id 
  AND uqsa.is_active = true
  AND (uqsa.expires_at IS NULL OR uqsa.expires_at > NOW())
LEFT JOIN question_sets qs ON uqsa.set_id = qs.id
WHERE u.is_active = true
GROUP BY u.id, u.email, u.name, u.role;

COMMENT ON VIEW user_access_summary IS 'User access permissions summary';

-- ============================================================================
-- INITIAL DATA / SEEDS
-- ============================================================================

-- Create default admin user (replace with actual Google ID after first login)
-- This is a placeholder - update after first admin login
INSERT INTO users (id, email, name, role, preferences)
VALUES (
  'REPLACE_WITH_GOOGLE_ID',
  'humbugquiz@gmail.hu',
  'HUMBUG Admin',
  'admin',
  '{
    "language": "en",
    "autoPlayMusic": false,
    "visibleCategories": ["entertainment", "travel", "sports", "technology", "gastronomy", "culture"],
    "theme": "dark",
    "soundEffects": true,
    "notifications": true
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Create the "Original HUMBUG!" question set
INSERT INTO question_sets (
  slug,
  name_en,
  name_hu,
  description_en,
  description_hu,
  access_level,
  is_active,
  is_published,
  display_order,
  metadata
)
VALUES (
  'original',
  'Original HUMBUG!',
  'Eredeti HUMBUG!',
  'The original collection of HUMBUG! questions covering entertainment, sports, travel, technology, gastronomy, and culture.',
  'Az eredeti HUMBUG! kérdésgyűjtemény szórakozás, sport, utazás, technológia, gasztronómia és kultúra témákban.',
  'free',
  true,
  true,
  1,
  '{
    "tags": ["original", "classic", "general"],
    "estimatedPlayTime": "30-45 min",
    "minPlayers": 3,
    "maxPlayers": 8,
    "ageRating": "12+"
  }'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- GRANTS & PERMISSIONS
-- ============================================================================

-- Note: Adjust these based on your Vercel Postgres setup
-- Vercel typically handles this automatically

-- Grant read access to application role
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_user;

-- Grant write access for specific tables
-- GRANT INSERT, UPDATE, DELETE ON users, game_sessions, question_usage, user_reports TO app_user;

-- Grant sequence usage
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- ============================================================================
-- SCHEMA VERSION
-- ============================================================================

CREATE TABLE schema_version (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  description TEXT
);

INSERT INTO schema_version (version, description)
VALUES ('1.0.0', 'Initial schema with users, questions, game tracking, and access control');

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
