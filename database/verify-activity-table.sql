-- ============================================================================
-- Verification Script: Check Activity Log Table Status
-- Purpose: Diagnose activity log table issues
-- ============================================================================

-- 1. Check if activity_logs table exists
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_name LIKE '%activity%';

-- 2. If activity_logs exists, check its structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'activity_logs'
ORDER BY ordinal_position;

-- 3. Check if there are any rows in activity_logs
SELECT COUNT(*) as total_rows FROM activity_logs;

-- 4. Sample the first few rows
SELECT 
  id,
  user_id,
  action_type,
  entity_type,
  entity_id,
  details,
  created_at
FROM activity_logs 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Check if there's an old admin_activity_log table
SELECT 
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'admin_activity_log'
ORDER BY ordinal_position;

-- 6. If old table exists, count its rows
SELECT COUNT(*) as old_table_rows FROM admin_activity_log;
