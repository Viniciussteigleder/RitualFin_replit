-- Add ritual_goals table for storing goals set during rituals
CREATE TABLE IF NOT EXISTS ritual_goals (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ritual_id VARCHAR REFERENCES rituals(id) ON DELETE CASCADE,
  ritual_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  goal_text TEXT NOT NULL,
  target_date TIMESTAMP,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ritual_goals_user_idx ON ritual_goals(user_id);
CREATE INDEX IF NOT EXISTS ritual_goals_ritual_idx ON ritual_goals(ritual_id);
CREATE INDEX IF NOT EXISTS ritual_goals_type_idx ON ritual_goals(ritual_type);
