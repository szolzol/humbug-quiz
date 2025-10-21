-- ============================================================================
-- Add Question Feedback & Progress Tracking System + Player Profile
-- ============================================================================
-- Purpose: Track user feedback (thumbs up/down), completion status, answer progress,
--          and player profile data (nickname)
-- Date: 2025-01-20 (Updated: 2025-10-21)
-- ============================================================================

-- ============================================================================
-- Player Profile Enhancement
-- ============================================================================
-- Add nickname column to users table for player profiles
-- ============================================================================

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS nickname VARCHAR(50);

-- Add index for nickname lookups (optional, for future features)
CREATE INDEX IF NOT EXISTS idx_users_nickname ON users(nickname);

-- Comment explaining the column
COMMENT ON COLUMN users.nickname IS 'Player chosen display name (3-50 chars, alphanumeric + spaces/underscores)';

-- ============================================================================
-- Question Feedback System
-- ============================================================================

-- Add feedback columns to questions table
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS thumbs_up_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS thumbs_down_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS feedback_score INTEGER DEFAULT 0 NOT NULL; -- Net score (ups - downs)

-- Add indexes for sorting by feedback
CREATE INDEX IF NOT EXISTS idx_questions_thumbs_up ON questions(thumbs_up_count DESC);
CREATE INDEX IF NOT EXISTS idx_questions_thumbs_down ON questions(thumbs_down_count DESC);
CREATE INDEX IF NOT EXISTS idx_questions_feedback_score ON questions(feedback_score DESC);

-- Comments
COMMENT ON COLUMN questions.thumbs_up_count IS 'Total number of positive feedback votes';
COMMENT ON COLUMN questions.thumbs_down_count IS 'Total number of negative feedback votes';
COMMENT ON COLUMN questions.feedback_score IS 'Net feedback score: thumbs_up - thumbs_down';

-- ============================================================================
-- Question Feedback Table
-- ============================================================================
-- Tracks individual user feedback on questions
-- Prevents duplicate votes from same user
-- Supports future comment functionality
-- ============================================================================

CREATE TABLE IF NOT EXISTS question_feedback (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Feedback
  vote SMALLINT NOT NULL CHECK (vote IN (-1, 1)), -- -1 = thumbs down, 1 = thumbs up
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  UNIQUE(question_id, user_id) -- One vote per user per question
);

-- Indexes for question_feedback
CREATE INDEX IF NOT EXISTS idx_feedback_question ON question_feedback(question_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON question_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_vote ON question_feedback(vote);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON question_feedback(created_at DESC);

-- Comments
COMMENT ON TABLE question_feedback IS 'User feedback (thumbs up/down) on questions';
COMMENT ON COLUMN question_feedback.vote IS '-1 for thumbs down, 1 for thumbs up';

-- ============================================================================
-- User Question Progress Table
-- ============================================================================
-- Tracks per-user progress on each question
-- Stores which answers have been marked, completion status
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_question_progress (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  
  -- Progress tracking
  used_answers INTEGER[] DEFAULT ARRAY[]::INTEGER[], -- Array of answer indexes (1-4) already marked
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  UNIQUE(user_id, question_id) -- One progress record per user per question
);

-- Indexes for user_question_progress
CREATE INDEX IF NOT EXISTS idx_progress_user ON user_question_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_question ON user_question_progress(question_id);
CREATE INDEX IF NOT EXISTS idx_progress_completed ON user_question_progress(is_completed, user_id);
CREATE INDEX IF NOT EXISTS idx_progress_last_viewed ON user_question_progress(last_viewed_at DESC);

-- Comments
COMMENT ON TABLE user_question_progress IS 'Per-user progress tracking for each question';
COMMENT ON COLUMN user_question_progress.used_answers IS 'Array of answer indexes (1-4) that user has already marked';
COMMENT ON COLUMN user_question_progress.is_completed IS 'Whether user marked this question as finished/solved';
COMMENT ON COLUMN user_question_progress.last_viewed_at IS 'Last time user viewed this question';

-- ============================================================================
-- Trigger: Update Question Feedback Counts
-- ============================================================================
-- Automatically updates thumbs_up_count, thumbs_down_count, and feedback_score
-- when feedback is added, updated, or deleted
-- ============================================================================

CREATE OR REPLACE FUNCTION update_question_feedback_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate counts for the affected question
  UPDATE questions
  SET 
    thumbs_up_count = (
      SELECT COUNT(*) 
      FROM question_feedback 
      WHERE question_id = COALESCE(NEW.question_id, OLD.question_id) 
        AND vote = 1
    ),
    thumbs_down_count = (
      SELECT COUNT(*) 
      FROM question_feedback 
      WHERE question_id = COALESCE(NEW.question_id, OLD.question_id) 
        AND vote = -1
    ),
    feedback_score = (
      CASE 
        WHEN (
          SELECT COUNT(*) 
          FROM question_feedback 
          WHERE question_id = COALESCE(NEW.question_id, OLD.question_id)
        ) = 0 THEN 0
        ELSE (
          SELECT 
            ROUND(
              (SUM(CASE WHEN vote = 1 THEN 1 ELSE 0 END)::DECIMAL - 
               SUM(CASE WHEN vote = -1 THEN 1 ELSE 0 END)::DECIMAL) / 
              NULLIF(COUNT(*)::DECIMAL, 0) * 100,
              2
            )
          FROM question_feedback 
          WHERE question_id = COALESCE(NEW.question_id, OLD.question_id)
        )
      END
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.question_id, OLD.question_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_feedback_counts ON question_feedback;
CREATE TRIGGER trigger_update_feedback_counts
  AFTER INSERT OR UPDATE OR DELETE ON question_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_question_feedback_counts();

-- ============================================================================
-- User Question Progress Table
-- ============================================================================
-- Tracks user progress on individual questions
-- Stores completed state and used answers
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_question_progress (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  
  -- Progress tracking
  is_completed BOOLEAN DEFAULT false NOT NULL,
  used_answers INTEGER[] DEFAULT ARRAY[]::INTEGER[], -- Array of answer IDs marked as used
  
  -- Timestamps
  first_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  UNIQUE(user_id, question_id) -- One progress record per user per question
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_progress_user ON user_question_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_question ON user_question_progress(question_id);
CREATE INDEX IF NOT EXISTS idx_progress_completed ON user_question_progress(is_completed);
CREATE INDEX IF NOT EXISTS idx_progress_user_completed ON user_question_progress(user_id, is_completed);

-- Comments
COMMENT ON TABLE user_question_progress IS 'Tracks user progress (completed state, used answers) per question';
COMMENT ON COLUMN user_question_progress.used_answers IS 'Array of answer IDs that user marked as used';
COMMENT ON COLUMN user_question_progress.is_completed IS 'Whether user marked question as finished';

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to get feedback statistics for a question
CREATE OR REPLACE FUNCTION get_question_feedback_stats(question_id_param INTEGER)
RETURNS TABLE(
  thumbs_up INTEGER,
  thumbs_down INTEGER,
  total_votes INTEGER,
  score DECIMAL(4,2),
  percentage DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.thumbs_up_count,
    q.thumbs_down_count,
    (q.thumbs_up_count + q.thumbs_down_count) AS total_votes,
    q.feedback_score,
    CASE 
      WHEN (q.thumbs_up_count + q.thumbs_down_count) = 0 THEN 0
      ELSE ROUND((q.thumbs_up_count::DECIMAL / (q.thumbs_up_count + q.thumbs_down_count)) * 100, 2)
    END AS percentage
  FROM questions q
  WHERE q.id = question_id_param;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Sample Queries
-- ============================================================================

-- Get top-rated questions
-- SELECT id, question_en, thumbs_up_count, thumbs_down_count, feedback_score
-- FROM questions
-- ORDER BY feedback_score DESC, thumbs_up_count DESC
-- LIMIT 10;

-- Get controversial questions (high engagement, mixed feedback)
-- SELECT id, question_en, thumbs_up_count, thumbs_down_count, 
--        (thumbs_up_count + thumbs_down_count) as total_votes
-- FROM questions
-- WHERE thumbs_up_count > 0 AND thumbs_down_count > 0
-- ORDER BY (thumbs_up_count + thumbs_down_count) DESC
-- LIMIT 10;

-- Get user's feedback history
-- SELECT q.question_en, qf.vote, qf.created_at
-- FROM question_feedback qf
-- JOIN questions q ON qf.question_id = q.id
-- WHERE qf.user_id = 'user_id_here'
-- ORDER BY qf.created_at DESC;

-- Get user's progress
-- SELECT q.question_en, uqp.is_completed, 
--        array_length(uqp.used_answers, 1) as answers_marked,
--        uqp.completed_at
-- FROM user_question_progress uqp
-- JOIN questions q ON uqp.question_id = q.id
-- WHERE uqp.user_id = 'user_id_here'
-- ORDER BY uqp.last_viewed_at DESC;

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Run verification:
-- SELECT 'questions' as table, 
--        EXISTS(SELECT 1 FROM information_schema.columns 
--               WHERE table_name='questions' AND column_name='thumbs_up_count') as has_thumbs_up,
--        EXISTS(SELECT 1 FROM information_schema.tables 
--               WHERE table_name='question_feedback') as has_feedback_table,
--        EXISTS(SELECT 1 FROM information_schema.tables 
--               WHERE table_name='user_question_progress') as has_progress_table;
