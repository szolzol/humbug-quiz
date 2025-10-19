-- Activity Log Table for Admin Panel
-- Tracks all admin and creator actions for audit trail

CREATE TABLE IF NOT EXISTS admin_activity_log (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'view', 'export', 'login'
  entity_type VARCHAR(50), -- 'user', 'question', 'pack', 'settings', null for general actions
  entity_id VARCHAR(255), -- ID of the affected entity (can be string or number)
  details JSONB, -- Additional context about the action
  ip_address VARCHAR(45), -- IPv4 or IPv6 address
  user_agent TEXT, -- Browser/client information
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_activity_log_user_id ON admin_activity_log(user_id);
CREATE INDEX idx_activity_log_action_type ON admin_activity_log(action_type);
CREATE INDEX idx_activity_log_entity_type ON admin_activity_log(entity_type);
CREATE INDEX idx_activity_log_created_at ON admin_activity_log(created_at DESC);

-- Composite index for common query patterns
CREATE INDEX idx_activity_log_user_action_date ON admin_activity_log(user_id, action_type, created_at DESC);

COMMENT ON TABLE admin_activity_log IS 'Audit trail of all administrative actions';
COMMENT ON COLUMN admin_activity_log.action_type IS 'Type of action performed (create, update, delete, view, export, login)';
COMMENT ON COLUMN admin_activity_log.entity_type IS 'Type of entity affected (user, question, pack, settings)';
COMMENT ON COLUMN admin_activity_log.entity_id IS 'Identifier of the affected entity';
COMMENT ON COLUMN admin_activity_log.details IS 'JSON object with additional context (e.g., changed fields, old values)';
