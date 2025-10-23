-- HUMBUG! Mechanic - Add revealed flag and timer
-- Players have 30 seconds to call HUMBUG after an answer is submitted

-- Add revealed flag to player_answers
ALTER TABLE player_answers 
  ADD COLUMN IF NOT EXISTS revealed BOOLEAN DEFAULT FALSE;

-- Add humbug_called_by to track who challenged
ALTER TABLE player_answers
  ADD COLUMN IF NOT EXISTS humbug_called_by INTEGER REFERENCES room_players(id);

-- Add humbug_timer to multiplayer_sessions (when can HUMBUG be called)
ALTER TABLE multiplayer_sessions
  ADD COLUMN IF NOT EXISTS last_answer_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS humbug_deadline TIMESTAMP;

-- Index for HUMBUG queries
CREATE INDEX IF NOT EXISTS idx_answers_unrevealed ON player_answers(session_id, question_id, revealed) WHERE revealed = FALSE;

COMMENT ON COLUMN player_answers.revealed IS 'Whether the answer correctness has been revealed (by time or HUMBUG)';
COMMENT ON COLUMN player_answers.humbug_called_by IS 'Player who called HUMBUG on this answer';
COMMENT ON COLUMN multiplayer_sessions.last_answer_at IS 'Timestamp of last answer submission';
COMMENT ON COLUMN multiplayer_sessions.humbug_deadline IS 'Deadline for calling HUMBUG (last_answer_at + 30 seconds)';
