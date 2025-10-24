-- Add skin column to question_sets table for styling customization
-- Migration: 005_add_skin_column
-- Date: 2024-01-14

-- Add skin column with default 'standard'
ALTER TABLE question_sets
ADD COLUMN skin VARCHAR(20) DEFAULT 'standard' NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN question_sets.skin IS 'Visual theme for the question pack: standard (yellow), premium (purple-gold)';

-- Update existing Horror pack to use premium skin
UPDATE question_sets
SET skin = 'premium'
WHERE slug = 'horror-tagen-special';
