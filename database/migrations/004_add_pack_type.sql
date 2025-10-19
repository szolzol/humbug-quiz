-- ============================================================================
-- Migration: Add pack_type to question_sets
-- Version: 004
-- Date: 2025-10-19
-- Description: Add pack_type enum to support different content types
-- ============================================================================

-- Create pack_type enum
CREATE TYPE pack_type AS ENUM (
  'quiz',              -- Standard trivia quiz (current default)
  'challenge',         -- Timed challenges or competitive mode
  'learning',          -- Educational content with explanations
  'party',             -- Party game mode with special rules
  'kids',              -- Kid-friendly content
  'expert',            -- Advanced/expert level content
  'seasonal',          -- Holiday or seasonal content
  'custom'             -- User-created or special packs
);

-- Add pack_type column to question_sets
ALTER TABLE question_sets 
ADD COLUMN pack_type pack_type DEFAULT 'quiz' NOT NULL;

-- Add index for pack_type filtering
CREATE INDEX idx_question_sets_pack_type ON question_sets(pack_type);

-- Add comment
COMMENT ON COLUMN question_sets.pack_type IS 'Type of content pack: quiz, challenge, learning, party, etc.';

-- Update existing records to 'quiz' (already default, but being explicit)
UPDATE question_sets SET pack_type = 'quiz' WHERE pack_type IS NULL;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check the new column
SELECT 
  id, 
  slug, 
  name_en, 
  pack_type, 
  access_level,
  is_active,
  is_published
FROM question_sets
ORDER BY display_order, created_at;

-- Count by pack type
SELECT 
  pack_type, 
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE is_published = true) as published_count
FROM question_sets
GROUP BY pack_type
ORDER BY pack_type;
