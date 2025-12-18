-- Drop the old user_interests table and create a new one with the correct schema
-- User hobbies stored as an array of strings in a single row per user

DROP TABLE IF EXISTS user_interests CASCADE;

-- Create new user_interests table with array storage
CREATE TABLE IF NOT EXISTS user_interests (
    user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    hobbies TEXT[] NOT NULL DEFAULT '{}'
);

-- Create index for hobby searches
CREATE INDEX IF NOT EXISTS idx_user_interests_hobbies ON user_interests USING GIN (hobbies);
