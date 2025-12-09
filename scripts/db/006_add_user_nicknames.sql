-- Create user_nicknames table
CREATE TABLE IF NOT EXISTS user_nicknames (
  nicknamer_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  nickname VARCHAR(50) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (nicknamer_id, target_user_id)
);

-- Create trigger to update updated_at column
DROP TRIGGER IF EXISTS update_user_nickname_timestamp ON user_nicknames;
CREATE TRIGGER update_user_nickname_timestamp
BEFORE UPDATE ON user_nicknames
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
