# Question Statistics Tracking

## Overview

This document explains how question play and completion statistics are tracked in the Humbug Quiz application.

## Database Fields

The `questions` table includes two denormalized statistics fields:

```sql
-- Statistics (denormalized)
times_played INTEGER DEFAULT 0,        -- Incremented when user flips card
times_completed INTEGER DEFAULT 0,     -- Incremented when all answers are marked
```

### Field Definitions

- **`times_played`**: Tracks how many times users have flipped the card to view the answers. This metric indicates question engagement and interest.
- **`times_completed`**: Tracks how many times users have marked all answers as found. This metric indicates question difficulty and user success rate.

## Tracking Logic

### 1. **Played Event**

**Trigger**: When a user flips the card to reveal the answer side.

**Implementation**:

- In `QuestionCard.tsx`, when `isFlipped` changes from `false` to `true`
- Tracked only once per question per session
- Sends `POST /api/questions/:id/track` with `{ action: "played" }`

**Code Location**:

```tsx
// src/components/QuestionCard.tsx
useEffect(() => {
  if (isFlipped && !hasTrackedPlay) {
    fetch(`/api/questions/${question.id}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "played" }),
    });
    setHasTrackedPlay(true);
  }
}, [isFlipped, question.id, hasTrackedPlay]);
```

### 2. **Completed Event**

**Trigger**: When a user marks all answers on the answer side.

**Implementation**:

- In `QuestionCard.tsx`, when `selectedAnswers.size === question.answers.length`
- Tracked only once per question per session
- Sends `POST /api/questions/:id/track` with `{ action: "completed" }`

**Code Location**:

```tsx
// src/components/QuestionCard.tsx
useEffect(() => {
  if (
    selectedAnswers.size === question.answers.length &&
    question.answers.length > 0 &&
    !hasTrackedCompletion
  ) {
    fetch(`/api/questions/${question.id}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "completed" }),
    });
    setHasTrackedCompletion(true);
  }
}, [
  selectedAnswers.size,
  question.answers.length,
  question.id,
  hasTrackedCompletion,
]);
```

## API Endpoint

### `POST /api/questions/:id/track`

Increments the appropriate counter for a question.

**Request Body**:

```json
{
  "action": "played" | "completed"
}
```

**Response**:

```json
{
  "success": true
}
```

**Error Responses**:

- `400 Bad Request`: Invalid action type
- `500 Internal Server Error`: Database error

**Implementation** (vite.config.ts):

```typescript
if (data.action === "played") {
  await sql`
    UPDATE questions
    SET times_played = times_played + 1
    WHERE id = ${questionId}
  `;
} else if (data.action === "completed") {
  await sql`
    UPDATE questions
    SET times_completed = times_completed + 1
    WHERE id = ${questionId}
  `;
}
```

## Key Features

### 1. **No Authentication Required**

- Statistics tracking works for all users (authenticated and anonymous)
- Helps gather accurate usage data across all user types

### 2. **Session-Based Tracking**

- Each question is tracked only once per browser session
- Uses React state (`hasTrackedPlay`, `hasTrackedCompletion`)
- Prevents duplicate counting from repeated flips/completions

### 3. **Fail-Silent Approach**

- Tracking errors are logged but don't interrupt user experience
- Uses `.catch()` to handle network failures gracefully

### 4. **Performance Optimized**

- Lightweight API calls (no response data needed)
- Async/non-blocking implementation
- No impact on card flip animation or user interaction

## Use Cases

### Admin Dashboard

Admins can view these statistics in the Question Management panel:

```tsx
// Display in QuestionsPage
<div className="text-xs space-y-1">
  <div>
    <span className="text-muted-foreground">Played:</span>{" "}
    {question.timesPlayed}
  </div>
  <div>
    <span className="text-muted-foreground">Completed:</span>{" "}
    {question.timesCompleted}
  </div>
</div>
```

### Analytics Insights

1. **Engagement Rate**: `times_played / total_views`
2. **Completion Rate**: `times_completed / times_played`
3. **Difficulty Indicator**: Low completion rate suggests harder questions
4. **Popular Questions**: High play count indicates interesting topics

### Future Enhancements

Potential improvements to the tracking system:

1. **Detailed Analytics Table**:

   - Track individual user progress
   - Time-to-completion metrics
   - Answer discovery patterns

2. **Aggregate Metrics**:

   - Average completion time
   - Most commonly missed answers
   - Answer discovery order patterns

3. **Leaderboards**:

   - Fastest completion times
   - Most questions completed
   - Category-specific rankings

4. **A/B Testing**:
   - Test different question phrasings
   - Optimize answer ordering
   - Improve hint systems

## Testing

### Manual Testing Checklist

- [ ] Flip a card - verify `times_played` increments
- [ ] Mark all answers - verify `times_completed` increments
- [ ] Flip card again - verify count doesn't increment again
- [ ] Refresh page and flip - verify count increments (new session)
- [ ] Check admin panel displays correct counts
- [ ] Verify tracking works in offline mode (graceful failure)

### Database Verification

```sql
-- Check question statistics
SELECT
  id,
  question_en,
  times_played,
  times_completed,
  CASE
    WHEN times_played > 0 THEN (times_completed::float / times_played * 100)
    ELSE 0
  END as completion_rate
FROM questions
ORDER BY times_played DESC
LIMIT 10;
```

## Technical Considerations

### Race Conditions

- Multiple rapid flips are prevented by `hasTrackedPlay` state
- Database-level atomic increments prevent race conditions

### Privacy

- No personally identifiable information is collected
- Tracking is anonymous and aggregated
- Complies with cookie consent preferences

### Scalability

- Simple counter increments are highly performant
- Can handle high traffic without performance degradation
- Consider batching for very high-scale applications

## Summary

The tracking system provides valuable insights into question usage while maintaining:

- ✅ User privacy
- ✅ Simple implementation
- ✅ High performance
- ✅ Graceful degradation
- ✅ No authentication requirements

This data helps admins understand which questions are most engaging and which might need difficulty adjustments.
