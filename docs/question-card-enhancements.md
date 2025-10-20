# Question Card Enhancements - Implementation Summary

## Overview

Added four new buttons to question cards for enhanced user interaction:

1. **RESET (ÚJRA)** - Clear all marked answers
2. **FINISHED (KÉSZ)** - Mark question as completed
3. **Thumbs Up (👍)** - Vote positively on question quality
4. **Thumbs Down (👎)** - Vote negatively on question quality

## Files Created/Modified

### 1. Database Migration

**File**: `database/migrations/add-question-feedback.sql`

Creates:

- `question_feedback` table - Tracks individual user votes (1 = up, -1 = down)
- `user_question_progress` table - Tracks per-user progress (marked answers, completion)
- New columns on `questions` table:
  - `thumbs_up_count` - Total positive votes
  - `thumbs_down_count` - Total negative votes
  - `feedback_score` - Net score (ups - downs)

### 2. API Endpoint

**File**: `api/user-actions.ts`

New serverless function with 4 actions:

- `feedback` - Submit thumbs up/down vote
- `progress` - Get/save which answers user has marked
- `reset-progress` - Clear all marked answers
- `mark-completed` - Mark question as finished

All actions require authentication (JWT session cookie).

### 3. Frontend Component

**File**: `src/components/QuestionCard.tsx`

Added:

- State management for votes, completion, feedback counts
- `handleReset()` - Clears marked answers from localStorage
- `handleMarkCompleted()` - Calls API to mark as finished
- `handleFeedback()` - Submits thumbs up/down vote
- Button UI section with responsive design

### 4. Translations

**Files**: `src/locales/en.json`, `src/locales/hu.json`

Added keys:

- `questions.reset` - "RESET" / "ÚJRA"
- `questions.finished` - "FINISHED" / "KÉSZ"
- `questions.resetSuccess` - Success message
- `questions.markedCompleted` - Completion message
- `questions.loginRequired` - Auth required message
- `questions.likedQuestion` - Like feedback
- `questions.dislikedQuestion` - Dislike feedback
- Error messages

### 5. Migration Runner

**File**: `database/run-migration.js`

Node script to execute SQL migrations:

```bash
npm run migrate add-question-feedback.sql
```

### 6. Package.json

Added `migrate` script for easy migration execution.

## How It Works

### RESET Button

- **Action**: Clears all marked answers for the current question
- **Storage**: Removes from localStorage only (no API call)
- **Effect**: User can start marking answers fresh

### FINISHED Button

- **Action**: Marks question as completed in database
- **Requires**: User must be logged in
- **Effect**:
  - Increments `times_completed` counter on question
  - Records completion in `user_question_progress` table
  - Button becomes disabled and shows "completed" state

### Thumbs Up/Down Buttons

- **Action**: Vote on question quality
- **Requires**: User must be logged in
- **Effect**:
  - Upserts vote in `question_feedback` table (one vote per user per question)
  - Updates aggregate counts on `questions` table
  - Highlights the button matching user's vote
  - Shows real-time vote counts

## Database Schema

### question_feedback

```sql
CREATE TABLE question_feedback (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id),
  user_id TEXT REFERENCES users(id),
  vote SMALLINT CHECK (vote IN (-1, 1)),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(question_id, user_id)
);
```

### user_question_progress

```sql
CREATE TABLE user_question_progress (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  question_id INTEGER REFERENCES questions(id),
  used_answers INTEGER[], -- Array of marked answer indexes
  is_completed BOOLEAN,
  completed_at TIMESTAMP,
  last_viewed_at TIMESTAMP,
  UNIQUE(user_id, question_id)
);
```

## API Usage

### Submit Feedback

```typescript
POST /api/user-actions?action=feedback
Body: { questionId: string, vote: 1 | -1 }
Response: { success: true, feedback: { thumbs_up_count, thumbs_down_count } }
```

### Mark as Completed

```typescript
POST /api/user-actions?action=mark-completed
Body: { questionId: string }
Response: { success: true }
```

### Reset Progress

```typescript
POST /api/user-actions?action=reset-progress
Body: { questionId: string }
Response: { success: true }
```

### Get Progress

```typescript
GET /api/user-actions?action=progress&questionId=123
Response: {
  usedAnswers: number[],
  isCompleted: boolean,
  completedAt: string | null
}
```

## UI Design

### Button Layout

Back of card footer:

```
┌─────────────────────────────────────────┐
│ [RESET] [FINISHED]    [👍 123] [👎 45] │
└─────────────────────────────────────────┘
```

- Left side: Action buttons (RESET, FINISHED)
- Right side: Feedback buttons (only visible when authenticated)
- Responsive sizing for mobile/desktop

### Visual States

- **RESET**: Outlined button, always enabled
- **FINISHED**: Primary button when not completed, green when completed
- **Thumbs Up**: Green highlight when user voted up
- **Thumbs Down**: Red highlight when user voted down

## Next Steps

1. **Run the migration**:

   ```bash
   npm run migrate add-question-feedback.sql
   ```

2. **Test the features**:

   - Visit http://localhost:5000
   - Log in with Google OAuth
   - Open a question card (flip it)
   - Test all four buttons

3. **Add to Admin Dashboard** (TODO):

   - Display average feedback score
   - Show top rated questions
   - List questions needing review (high thumbs down)
   - Track completion rates by pack

4. **Future Enhancements**:
   - Add comment system (schema already supports with JSONB)
   - Show user's personal statistics
   - Gamification (badges for completing packs)
   - Question difficulty rating based on completion rate

## Dependencies

- Uses existing authentication system (JWT cookies)
- Uses existing `useAuth()` hook
- Uses `sonner` for toast notifications
- No new dependencies required

## Performance Considerations

- Feedback counts cached on `questions` table (no JOIN needed)
- Indexes on frequently queried columns
- Unique constraints prevent duplicate votes
- CASCADE deletes maintain referential integrity

## Security

- All endpoints require authentication
- User can only vote once per question
- SQL injection protected by parameterized queries
- CORS configured for same-origin requests
