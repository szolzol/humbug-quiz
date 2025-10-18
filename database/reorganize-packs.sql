-- ===================================================
-- REORGANIZE QUESTION PACKS
-- ===================================================
-- 1. Rename US pack to International
-- 2. Redistribute questions between FREE, HUN, and INT packs
-- 3. Remove duplicates: Free pack questions should not appear in HUN or INT
-- ===================================================

-- Step 1: Rename us-starter-pack to international
-- ===================================================
UPDATE question_sets 
SET 
  slug = 'international',
  name_en = 'International Pack',
  name_hu = 'Nemzetközi csomag',
  description_en = 'International questions including US and general knowledge',
  description_hu = 'Nemzetközi kérdések beleértve az USA és általános tudást'
WHERE slug = 'us-starter-pack';

-- Step 2: Identify questions in each pack
-- ===================================================
-- FREE pack questions (4 questions) - these should be EXCLUSIVE to free
-- We need to identify which 4 questions are in the free pack first

-- Let's check current free pack questions
-- SELECT q.id, q.question_en, q.question_hu 
-- FROM questions q
-- JOIN question_set_questions qsq ON q.id = qsq.question_id
-- JOIN question_sets qs ON qsq.question_set_id = qs.id
-- WHERE qs.slug = 'free'
-- ORDER BY qsq.display_order;

-- Step 3: Remove free pack questions from HUN and INT packs
-- ===================================================
-- First, we need to get the question IDs from free pack
-- Then delete them from hun-starter-pack and international (formerly us-starter-pack)

DELETE FROM question_set_questions
WHERE question_set_id = (SELECT id FROM question_sets WHERE slug = 'hun-starter-pack')
  AND question_id IN (
    SELECT question_id 
    FROM question_set_questions 
    WHERE question_set_id = (SELECT id FROM question_sets WHERE slug = 'free')
  );

DELETE FROM question_set_questions
WHERE question_set_id = (SELECT id FROM question_sets WHERE slug = 'international')
  AND question_id IN (
    SELECT question_id 
    FROM question_set_questions 
    WHERE question_set_id = (SELECT id FROM question_sets WHERE slug = 'free')
  );

-- Step 4: Assign Hungarian-specific questions to HUN pack
-- ===================================================
-- Questions ID: 1, 3, 5, 10, 11, 15 (6 questions)
-- First, remove these from international if they exist

DELETE FROM question_set_questions
WHERE question_set_id = (SELECT id FROM question_sets WHERE slug = 'international')
  AND question_id IN (1, 3, 5, 10, 11, 15);

-- Ensure they are in HUN pack
INSERT INTO question_set_questions (question_set_id, question_id, display_order)
SELECT 
  (SELECT id FROM question_sets WHERE slug = 'hun-starter-pack'),
  q.id,
  ROW_NUMBER() OVER (ORDER BY q.id) as display_order
FROM questions q
WHERE q.id IN (1, 3, 5, 10, 11, 15)
ON CONFLICT (question_set_id, question_id) DO NOTHING;

-- Step 5: Assign remaining questions to INT pack
-- ===================================================
-- INT pack should have: US-specific + all other questions (not HUN, not FREE)
-- We'll keep all existing questions in INT except HUN-specific and FREE questions

-- No additional action needed here as we've already removed conflicts above

-- Step 6: Update question counts
-- ===================================================
UPDATE question_sets 
SET question_count = (
  SELECT COUNT(*) 
  FROM question_set_questions 
  WHERE question_set_id = question_sets.id
);

-- Step 7: Verify the changes
-- ===================================================
-- Check question distribution
SELECT 
  qs.slug,
  qs.name_en,
  COUNT(qsq.question_id) as question_count
FROM question_sets qs
LEFT JOIN question_set_questions qsq ON qs.id = qsq.question_set_id
GROUP BY qs.id, qs.slug, qs.name_en
ORDER BY qs.slug;

-- Check for duplicates across packs
SELECT 
  q.id,
  q.question_en,
  STRING_AGG(qs.slug, ', ') as packs
FROM questions q
JOIN question_set_questions qsq ON q.id = qsq.question_id
JOIN question_sets qs ON qsq.question_set_id = qs.id
GROUP BY q.id, q.question_en
HAVING COUNT(DISTINCT qs.id) > 1;
