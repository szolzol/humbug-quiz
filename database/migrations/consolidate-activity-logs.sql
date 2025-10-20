-- ============================================================================
-- Migration: Consolidate Activity Log Tables
-- Date: 2025-10-20
-- Description: Handle potential dual activity log tables
-- ============================================================================

-- OPTION 1: If you want to keep old data and merge tables
-- ========================================================

-- Step 1: Check if old table exists and has data
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_activity_log') THEN
    RAISE NOTICE 'Old admin_activity_log table exists';
    
    -- Copy old data to new table if new table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'activity_logs') THEN
      RAISE NOTICE 'Migrating data from admin_activity_log to activity_logs';
      
      -- Insert old records into new table
      -- Note: This assumes similar structure, adjust if needed
      INSERT INTO activity_logs (
        user_id, 
        action_type, 
        entity_type, 
        entity_id, 
        details, 
        ip_address, 
        user_agent, 
        created_at
      )
      SELECT 
        user_id, 
        action_type, 
        entity_type, 
        entity_id, 
        details, 
        ip_address, 
        user_agent, 
        created_at
      FROM admin_activity_log
      WHERE id NOT IN (
        -- Avoid duplicates if some data was already copied
        SELECT CAST(details->>'old_id' AS INTEGER) 
        FROM activity_logs 
        WHERE details ? 'old_id'
      );
      
      RAISE NOTICE 'Migration complete';
    END IF;
  END IF;
END $$;

-- OPTION 2: If you want to just rename the table
-- ================================================
-- Uncomment if you want to rename instead of merge:

-- DROP TABLE IF EXISTS activity_logs CASCADE;
-- ALTER TABLE admin_activity_log RENAME TO activity_logs;

-- OPTION 3: If you want to drop old table and keep new one
-- =========================================================
-- Uncomment if you want to start fresh with new structure:

-- DROP TABLE IF EXISTS admin_activity_log CASCADE;

-- Verify the result
SELECT 
  table_name,
  (SELECT COUNT(*) FROM activity_logs) as row_count
FROM information_schema.tables 
WHERE table_name = 'activity_logs';
