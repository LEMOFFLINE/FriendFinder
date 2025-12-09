-- Reseed users, interests, and friendships WITHOUT clearing posts
-- Run this to fix discover and contacts issues

-- ============================================================
-- 1. CLEAR ONLY USER-RELATED DATA (preserve posts)
-- ============================================================

-- Remove friendships
DELETE FROM friendships;

-- Remove user interests  
DELETE FROM user_interests;

-- Remove notifications
DELETE FROM notifications;

-- ============================================================
-- 2. UPDATE TEST USERS (if they don't exist, create them)
-- ============================================================

-- Upsert test users
INSERT INTO users (user_id, email, password_hash, name, age, location, bio, avatar_url)
VALUES
('11111111-1111-1111-1111-111111111111', 'alice@test.com', 'ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae', 'Alice Chen', 22, 'Hangzhou', 'Photography and travel lover', 'https://i.pravatar.cc/150?img=1'),
('22222222-2222-2222-2222-222222222222', 'bob@test.com', 'ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae', 'Bob Wang', 23, 'Shanghai', 'Music lover and guitarist', 'https://i.pravatar.cc/150?img=2'),
('33333333-3333-3333-3333-333333333333', 'carol@test.com', 'ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae', 'Carol Li', 21, 'Beijing', 'Computer Science major, AI research', 'https://i.pravatar.cc/150?img=3'),
('44444444-4444-4444-4444-444444444444', 'david@test.com', 'ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae', 'David Zhang', 24, 'Shenzhen', 'Entrepreneur | Tech enthusiast', 'https://i.pravatar.cc/150?img=4'),
('55555555-5555-5555-5555-555555555555', 'emma@test.com', 'ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae', 'Emma Liu', 20, 'Hangzhou', 'Food explorer | Designer', 'https://i.pravatar.cc/150?img=5')
ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  age = EXCLUDED.age,
  location = EXCLUDED.location,
  bio = EXCLUDED.bio,
  avatar_url = EXCLUDED.avatar_url;

-- ============================================================
-- 3. CREATE USER INTERESTS (array-based)
-- ============================================================

INSERT INTO user_interests (user_id, hobbies) VALUES
('11111111-1111-1111-1111-111111111111', ARRAY['Photography', 'Travel', 'Cooking']),
('22222222-2222-2222-2222-222222222222', ARRAY['Music', 'Gaming', 'Photography']),
('33333333-3333-3333-3333-333333333333', ARRAY['Technology', 'Reading', 'Art']),
('44444444-4444-4444-4444-444444444444', ARRAY['Technology', 'Sports', 'Travel']),
('55555555-5555-5555-5555-555555555555', ARRAY['Cooking', 'Art', 'Travel'])
ON CONFLICT (user_id) DO UPDATE SET hobbies = EXCLUDED.hobbies;

-- ============================================================
-- 4. CREATE FRIENDSHIPS
-- ============================================================

INSERT INTO friendships (user_id, friend_id, status, accepted_at) VALUES
-- Alice's friends
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'accepted', NOW() - INTERVAL '10 days'),
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'accepted', NOW() - INTERVAL '8 days'),
('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'accepted', NOW() - INTERVAL '5 days'),
-- Bob's friends
('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'accepted', NOW() - INTERVAL '7 days'),
('22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'accepted', NOW() - INTERVAL '6 days'),
-- Carol's friends
('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'accepted', NOW() - INTERVAL '9 days'),
-- David's pending request
('44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 'pending', NULL);

-- ============================================================
-- Done
-- ============================================================
SELECT 'Users, interests, and friendships reseeded successfully!' as status;
