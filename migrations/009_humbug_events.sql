-- Add last_humbug_event to multiplayer_sessions for broadcasting HUMBUG results
-- This allows all players to see when someone calls HUMBUG via polling

ALTER TABLE multiplayer_sessions 
ADD COLUMN last_humbug_event JSONB DEFAULT NULL;

-- last_humbug_event structure:
-- {
--   "answerId": 123,
--   "challengerId": 45,
--   "challengerName": "Player2",
--   "answererId": 67,
--   "answererName": "Player1",
--   "answerWasCorrect": false,
--   "penaltyTarget": "answerer",
--   "penaltyPlayerName": "Player1",
--   "eliminated": false,
--   "timestamp": "2025-10-22T16:59:57.000Z"
-- }

COMMENT ON COLUMN multiplayer_sessions.last_humbug_event IS 
'Last HUMBUG challenge result - cleared when advancing to next question';
