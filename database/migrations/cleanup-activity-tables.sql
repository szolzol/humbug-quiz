-- ============================================================================
-- Migration: Clean Up Duplicate Activity Log Table
-- Date: 2025-10-20
-- Description: Remove the new empty activity_logs table, keep admin_activity_log
-- ============================================================================

-- Drop the new empty table that was created today
DROP TABLE IF EXISTS activity_logs CASCADE;

-- Verify admin_activity_log exists and has data
SELECT 
  'admin_activity_log' as table_name,
  COUNT(*) as record_count,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record
FROM admin_activity_log;

-- Show table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'admin_activity_log'
ORDER BY ordinal_position;

-- Confirm indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'admin_activity_log';
