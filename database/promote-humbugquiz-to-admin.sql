-- ============================================================================
-- Promote Humbugquiz user to admin role
-- ============================================================================
-- Date: 2025-10-19
-- Purpose: Set Humbugquiz user as admin while keeping Zoltan Szoleczki as free
-- ============================================================================

-- First, let's see what users we have (for verification)
SELECT id, email, name, role, is_active 
FROM users 
ORDER BY created_at DESC;

-- Option 1: Update by name (if name is exactly "Humbugquiz")
UPDATE users 
SET 
  role = 'admin',
  updated_at = NOW()
WHERE 
  name ILIKE '%Humbug%'
  AND name NOT ILIKE '%Szoleczki%'
RETURNING id, email, name, role;

-- Option 2: Update by email (replace with actual email if known)
-- UPDATE users 
-- SET 
--   role = 'admin',
--   updated_at = NOW()
-- WHERE 
--   email = 'humbugquiz@gmail.com'
-- RETURNING id, email, name, role;

-- Verify the changes
SELECT id, email, name, role 
FROM users 
WHERE role = 'admin';

-- Ensure Zoltan Szoleczki remains as 'free'
UPDATE users
SET 
  role = 'free',
  updated_at = NOW()
WHERE 
  name ILIKE '%Szoleczki%'
RETURNING id, email, name, role;

-- Final verification
SELECT 
  name,
  email,
  role,
  is_active
FROM users
ORDER BY role DESC, name;
