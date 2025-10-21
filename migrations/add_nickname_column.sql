-- Migration: Add nickname column to users table
-- Date: 2025-01-XX
-- Description: Adds optional nickname field for player profiles

-- Add nickname column (nullable, 3-50 characters)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS nickname VARCHAR(50);

-- Add index for nickname lookups (optional, for future features)
CREATE INDEX IF NOT EXISTS idx_users_nickname ON users(nickname);

-- Comment explaining the column
COMMENT ON COLUMN users.nickname IS 'Player chosen display name (3-50 chars, alphanumeric + spaces/underscores)';

-- Note: This migration is idempotent (safe to run multiple times)
