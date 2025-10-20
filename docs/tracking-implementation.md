# Database Tracking Implementation Summary

## Overview

Implemented proper tracking for question plays and completions with **once-per-user** logic to prevent duplicate counts.

## Changes Made

### 1. API Endpoint: `/api/user-actions?action=track-play`

**Purpose**: Track when a user flips a card to see answers (plays the question)

**Logic**:

- Checks if user already has a `user_question_progress` record for this question
- If **first time playing**: Increments `times_played` counter in `questions` table
- If **already played**: Just updates `last_viewed_at` timestamp
- ✅ **Result**: Each user can only increase `times_played` once per question

**Database Updates**:

```sql
-- First time: Creates progress record + increments times_played
INSERT INTO user_question_progress (user_id, question_id, last_viewed_at)
VALUES ($1, $2, NOW())
ON CONFLICT DO UPDATE SET last_viewed_at = NOW()

UPDATE questions SET times_played = times_played + 1 WHERE id = $1
```

### 2. API Endpoint: `/api/user-actions?action=mark-completed` (Updated)

**Purpose**: Track when user marks a question as completed

**Logic**:

- Checks if user already completed this question (`is_completed = true`)
- If **first time completing**: Increments `times_completed` counter in `questions` table
- If **already completed**: Just updates timestamp, no counter increment
- ✅ **Result**: Each user can only increase `times_completed` once per question

**Database Updates**:

```sql
-- Check existing completion status
SELECT is_completed FROM user_question_progress
WHERE user_id = $1 AND question_id = $2

-- Mark as completed
INSERT INTO user_question_progress (user_id, question_id, is_completed, completed_at)
VALUES ($1, $2, true, NOW())
ON CONFLICT DO UPDATE SET is_completed = true, completed_at = NOW()

-- Only increment if not already completed
UPDATE questions SET times_completed = times_completed + 1 WHERE id = $1
```

### 3. Frontend: QuestionCard Component

#### Tracking Play on Card Flip

```tsx
// Track when card is flipped (ONCE per user)
useEffect(() => {
  if (isFlipped && !hasTrackedPlay) {
    fetch("/api/user-actions?action=track-play", {
      method: "POST",
      body: JSON.stringify({ questionId: question.id }),
      credentials: "include",
    });
    setHasTrackedPlay(true);
  }
}, [isFlipped, question.id, hasTrackedPlay]);
```

#### Load Completion Status on Mount

```tsx
// Check if user already completed this question
useEffect(() => {
  if (isAuthenticated) {
    fetch(`/api/user-actions?action=progress&questionId=${question.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.isCompleted) {
          setIsCompleted(true);
        }
      });
  }
}, [isAuthenticated, question.id]);
```

#### Completion Animation (3 seconds)

When user clicks **FINISHED** button:

1. **Animation Phase** (3 seconds):

   - Marks each answer one-by-one with green highlight
   - Spreads animation evenly: `3000ms / totalAnswers`
   - Button shows "Completing..." with pulse animation

2. **API Call**:

   - Calls `/api/user-actions?action=mark-completed`
   - Increments `times_completed` (only if first time)

3. **Flip Back** (1 second delay):
   - Shows all answers marked for 1 second
   - Automatically flips card back to question side
   - Shows success toast notification

```tsx
const handleMarkCompleted = async (e) => {
  setIsAnimatingCompletion(true);

  // Animate marking each answer
  for (let i = 0; i < totalAnswers; i++) {
    await new Promise(resolve => setTimeout(resolve, 3000 / totalAnswers));
    setSelectedAnswers(prev => new Set([...prev, i]));
  }

  // Wait to show all marked
  await new Promise(resolve => setTimeout(resolve, 500));

  // Call API to mark completed
  await fetch("/api/user-actions?action=mark-completed", { ... });

  // Flip back to question side
  await new Promise(resolve => setTimeout(resolve, 1000));
  setIsFlipped(false);
};
```

### 4. Translations Added

**English** (`en.json`):

- `questions.completing`: "Completing..."

**Hungarian** (`hu.json`):

- `questions.completing`: "Befejezés..."

## Database Schema Updates

### Required Tables (from previous migration)

#### `user_question_progress`

Tracks per-user interaction with each question:

```sql
CREATE TABLE user_question_progress (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  question_id INTEGER REFERENCES questions(id),
  used_answers INTEGER[],        -- Answer indexes marked by user
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  last_viewed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, question_id)  -- One record per user per question
);
```

#### `questions` Table (existing columns)

- `times_played INTEGER` - Total unique users who flipped this card
- `times_completed INTEGER` - Total unique users who completed this question

## Testing Checklist

### Track Play (times_played)

- [ ] Login with User A
- [ ] Flip a question card
- [ ] Verify `times_played` increments by 1
- [ ] Flip the same card again
- [ ] Verify `times_played` does NOT increment
- [ ] Login with User B
- [ ] Flip the same card
- [ ] Verify `times_played` increments by 1 (now = 2)

### Track Completion (times_completed)

- [ ] Login with User A
- [ ] Click FINISHED on a question
- [ ] Verify completion animation plays (3 seconds)
- [ ] Verify card flips back to question side
- [ ] Verify `times_completed` increments by 1
- [ ] Click FINISHED again (button should be disabled/green)
- [ ] Verify `times_completed` does NOT increment
- [ ] Login with User B
- [ ] Click FINISHED on same question
- [ ] Verify `times_completed` increments by 1 (now = 2)

### Animation Quality

- [ ] Animation spreads evenly over 3 seconds
- [ ] Each answer highlights in sequence
- [ ] Button shows "Completing..." with pulse
- [ ] Card stays on answer side during animation
- [ ] Card flips back smoothly after completion
- [ ] Success toast appears

## SQL Verification Queries

### Check Play Tracking

```sql
-- See which users played a specific question
SELECT u.name, uqp.last_viewed_at
FROM user_question_progress uqp
JOIN users u ON uqp.user_id = u.id
WHERE uqp.question_id = 1;

-- Verify times_played matches unique users
SELECT
  q.id,
  q.question_en,
  q.times_played as counter,
  COUNT(DISTINCT uqp.user_id) as unique_players
FROM questions q
LEFT JOIN user_question_progress uqp ON q.id = uqp.question_id
GROUP BY q.id
HAVING q.times_played != COUNT(DISTINCT uqp.user_id);
-- Should return 0 rows if tracking is correct
```

### Check Completion Tracking

```sql
-- See which users completed a specific question
SELECT u.name, uqp.completed_at
FROM user_question_progress uqp
JOIN users u ON uqp.user_id = u.id
WHERE uqp.question_id = 1 AND uqp.is_completed = true;

-- Verify times_completed matches unique completers
SELECT
  q.id,
  q.question_en,
  q.times_completed as counter,
  COUNT(*) as unique_completers
FROM questions q
LEFT JOIN user_question_progress uqp
  ON q.id = uqp.question_id AND uqp.is_completed = true
GROUP BY q.id
HAVING q.times_completed != COUNT(*);
-- Should return 0 rows if tracking is correct
```

## Key Features

✅ **Once-per-user tracking**: No duplicate counts  
✅ **Database integrity**: Uses UNIQUE constraint on (user_id, question_id)  
✅ **Smooth animation**: 3-second completion animation  
✅ **Auto flip-back**: Card returns to question side after completion  
✅ **Visual feedback**: Button states (normal → animating → completed)  
✅ **Persistent state**: Completed status loads on page refresh

## Notes

- **Authentication required**: All tracking endpoints require login
- **Progress persistence**: User's completion status persists across sessions
- **Animation timing**: Adjusts dynamically based on number of answers
- **No double-counting**: Backend prevents duplicate increments
