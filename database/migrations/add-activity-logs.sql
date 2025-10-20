-- ============================================================================
-- Migration: Add Activity Logs Table
-- Date: 2025-10-20
-- Description: Adds activity_logs table for admin audit trail
-- ============================================================================

-- Add activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  -- Identity
  id SERIAL PRIMARY KEY,
  
  -- Who performed the action
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- What action was performed
  action_type TEXT NOT NULL CHECK (action_type IN ('create', 'update', 'delete')),
  
  -- What entity was affected
  entity_type TEXT NOT NULL CHECK (entity_type IN ('user', 'question', 'pack', 'answer')),
  entity_id TEXT NOT NULL,
  
  -- Additional details (JSON format)
  details JSONB DEFAULT '{}'::jsonb,
  
  -- Request metadata
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_action_type CHECK (action_type IN ('create', 'update', 'delete')),
  CONSTRAINT valid_entity_type CHECK (entity_type IN ('user', 'question', 'pack', 'answer'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_id ON activity_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_details ON activity_logs USING gin(details);

-- Comments
COMMENT ON TABLE activity_logs IS 'Audit trail of all admin actions';
COMMENT ON COLUMN activity_logs.details IS 'JSON object with action-specific details (old values, new values, etc.)';
