-- HUMBUG! Multiplayer MVP Tables
-- Polling-based turn-based game rooms for Vercel Hobby tier
-- Compatible with Neon PostgreSQL serverless (pooled connections)

-- Game Rooms: Core room management with 6-char codes
CREATE TABLE IF NOT EXISTS game_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) UNIQUE NOT NULL,
  host_session_id TEXT NOT NULL,
  
  -- Settings (MVP simplified)
  max_players INTEGER DEFAULT 10 CHECK (max_players BETWEEN 2 AND 10),
  question_set_id INTEGER REFERENCES question_sets(id),
  
  -- State management
  state VARCHAR(20) DEFAULT 'lobby' CHECK (state IN ('lobby', 'playing', 'finished')),
  state_version INTEGER DEFAULT 0, -- For ETag/304 optimization
  last_activity TIMESTAMP DEFAULT NOW(),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '2 hours',
  
  -- Indexes for fast lookup
  CONSTRAINT valid_code CHECK (code ~ '^[A-Z0-9]{6}$')
);

CREATE INDEX IF NOT EXISTS idx_rooms_code ON game_rooms(code);
CREATE INDEX IF NOT EXISTS idx_rooms_expires ON game_rooms(expires_at) WHERE state != 'finished';
CREATE INDEX IF NOT EXISTS idx_rooms_active ON game_rooms(state, last_activity);

-- Room Players: Session-based player tracking (no auth required for MVP)
CREATE TABLE IF NOT EXISTS room_players (
  id SERIAL PRIMARY KEY,
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  nickname VARCHAR(50) NOT NULL,
  
  -- Game state
  lives INTEGER DEFAULT 3,
  score INTEGER DEFAULT 0,
  is_host BOOLEAN DEFAULT false,
  
  -- Connection tracking
  joined_at TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(room_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_players_room ON room_players(room_id, joined_at);
CREATE INDEX IF NOT EXISTS idx_players_session ON room_players(session_id);

-- Game Sessions: Active game state per room
CREATE TABLE IF NOT EXISTS multiplayer_sessions (
  id SERIAL PRIMARY KEY,
  room_id UUID UNIQUE REFERENCES game_rooms(id) ON DELETE CASCADE,
  
  -- Current game state
  current_question_id INTEGER REFERENCES questions(id),
  current_question_index INTEGER DEFAULT 0,
  current_turn_player_id INTEGER REFERENCES room_players(id),
  round_number INTEGER DEFAULT 1,
  
  -- Question tracking
  question_ids INTEGER[] DEFAULT '{}', -- Array of question IDs for this game
  total_questions INTEGER DEFAULT 10,
  
  -- Timestamps
  started_at TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_multiplayer_sessions_room ON multiplayer_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_multiplayer_sessions_updated ON multiplayer_sessions(last_updated);

-- Player Answers: Answer submissions and validation
CREATE TABLE IF NOT EXISTS player_answers (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES multiplayer_sessions(id) ON DELETE CASCADE,
  player_id INTEGER REFERENCES room_players(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(id),
  
  -- Answer data
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  points_earned INTEGER DEFAULT 0,
  
  -- Metadata
  submitted_at TIMESTAMP DEFAULT NOW(),
  round_number INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_answers_session ON player_answers(session_id, round_number);
CREATE INDEX IF NOT EXISTS idx_answers_player ON player_answers(player_id, question_id);

-- Helper function: Generate random 6-character room code
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS VARCHAR(6) AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Exclude confusing chars (O, 0, I, 1)
  result VARCHAR(6) := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Helper function: Cleanup expired rooms (for cron)
CREATE OR REPLACE FUNCTION cleanup_expired_rooms()
RETURNS TABLE(deleted_count INTEGER) AS $$
DECLARE
  count INTEGER;
BEGIN
  DELETE FROM game_rooms 
  WHERE expires_at < NOW() 
    OR (state = 'finished' AND last_activity < NOW() - INTERVAL '1 hour');
  
  GET DIAGNOSTICS count = ROW_COUNT;
  RETURN QUERY SELECT count;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update last_activity on any room change
CREATE OR REPLACE FUNCTION update_room_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'room_players' THEN
    UPDATE game_rooms 
    SET last_activity = NOW(),
        state_version = state_version + 1
    WHERE id = NEW.room_id;
  ELSIF TG_TABLE_NAME = 'multiplayer_sessions' THEN
    UPDATE game_rooms 
    SET last_activity = NOW(),
        state_version = state_version + 1
    WHERE id = NEW.room_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_player_activity ON room_players;
CREATE TRIGGER trigger_player_activity
  AFTER INSERT OR UPDATE ON room_players
  FOR EACH ROW EXECUTE FUNCTION update_room_activity();

DROP TRIGGER IF EXISTS trigger_session_activity ON multiplayer_sessions;
CREATE TRIGGER trigger_session_activity
  AFTER INSERT OR UPDATE ON multiplayer_sessions
  FOR EACH ROW EXECUTE FUNCTION update_room_activity();

-- Comments for documentation
COMMENT ON TABLE game_rooms IS 'Multiplayer game rooms with polling-based state sync';
COMMENT ON TABLE room_players IS 'Session-based players (guest-friendly, no auth required)';
COMMENT ON TABLE multiplayer_sessions IS 'Active game state tracking per room';
COMMENT ON TABLE player_answers IS 'Answer submissions with exact-match validation (MVP)';
COMMENT ON COLUMN game_rooms.state_version IS 'Incremented on every state change for ETag/304 optimization';
COMMENT ON COLUMN game_rooms.expires_at IS 'Automatic cleanup after 2 hours';
