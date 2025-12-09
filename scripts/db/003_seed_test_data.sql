-- Seed Test Data for Development
-- This script creates test users, posts, and interactions

-- Clear existing data (for development only)
TRUNCATE TABLE notifications, reposts, likes, comments, posts, friendships, user_interests, users CASCADE;

-- ============================================================
-- 1. CREATE TEST USERS
-- ============================================================

-- Using SHA256 hex password hash for 'test123'
-- Hash: ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae
INSERT INTO users (user_id, email, password_hash, name, age, location, bio, avatar_url) VALUES
('11111111-1111-1111-1111-111111111111', 'alice@test.com', 'ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae', 'Alice Chen', 22, 'Hangzhou', 'Photography and travel lover', 'https://i.pravatar.cc/150?img=1'),
('22222222-2222-2222-2222-222222222222', 'bob@test.com', 'ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae', 'Bob Wang', 23, 'Shanghai', 'Music lover and guitarist', 'https://i.pravatar.cc/150?img=2'),
('33333333-3333-3333-3333-333333333333', 'carol@test.com', 'ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae', 'Carol Li', 21, 'Beijing', 'Computer Science major, AI research', 'https://i.pravatar.cc/150?img=3'),
('44444444-4444-4444-4444-444444444444', 'david@test.com', 'ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae', 'David Zhang', 24, 'Shenzhen', 'Entrepreneur | Tech enthusiast', 'https://i.pravatar.cc/150?img=4'),
('55555555-5555-5555-5555-555555555555', 'emma@test.com', 'ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae', 'Emma Liu', 20, 'Hangzhou', 'Food explorer | Designer', 'https://i.pravatar.cc/150?img=5');

-- ============================================================
-- 2. CREATE USER INTERESTS
-- ============================================================
-- Updated to use new array-based interests structure

INSERT INTO user_interests (user_id, hobbies) VALUES
('11111111-1111-1111-1111-111111111111', ARRAY['Photography', 'Travel', 'Cooking']),
('22222222-2222-2222-2222-222222222222', ARRAY['Music', 'Gaming', 'Photography']),
('33333333-3333-3333-3333-333333333333', ARRAY['Technology', 'Reading', 'Art']),
('44444444-4444-4444-4444-444444444444', ARRAY['Technology', 'Sports', 'Travel']),
('55555555-5555-5555-5555-555555555555', ARRAY['Cooking', 'Art', 'Travel']);

-- ============================================================
-- 3. CREATE FRIENDSHIPS
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
-- 4. CREATE POSTS
-- ============================================================

INSERT INTO posts (post_id, author_id, content, image_urls, visibility, created_at) VALUES
-- Alice's posts
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 
 'Took so many beautiful photos at West Lake today! Hangzhou autumn is truly stunning', 
 ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'], 
 'public', NOW() - INTERVAL '2 hours'),

('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', '11111111-1111-1111-1111-111111111111',
 'Sharing a photography tip: golden hour light is the softest, perfect for portraits',
 ARRAY[]::TEXT[],
 'friends', NOW() - INTERVAL '1 day'),

-- Bob's posts  
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222',
 'Learning a new song to share with everyone. Practiced for so long and finally got it smooth',
 ARRAY[]::TEXT[],
 'public', NOW() - INTERVAL '5 hours'),

-- Carol's posts
('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333',
 'Just completed a machine learning project using PyTorch for image classification. Learned so much!',
 ARRAY[]::TEXT[],
 'public', NOW() - INTERVAL '3 hours'),

('cccccccc-cccc-cccc-cccc-cccccccccccd', '33333333-3333-3333-3333-333333333333',
 'Book recommendation: Deep Learning by Goodfellow et al. Tough but definitely a classic',
 ARRAY[]::TEXT[],
 'friends', NOW() - INTERVAL '2 days'),

-- David's posts
('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444',
 'One year anniversary of our startup! Thanks to the team for their hard work and support. Keep going!',
 ARRAY[]::TEXT[],
 'public', NOW() - INTERVAL '4 hours'),

-- Emma's posts
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-555555555555',
 'Found an amazing private kitchen restaurant! Great atmosphere too, highly recommend',
 ARRAY['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'],
 'public', NOW() - INTERVAL '1 hour'),

('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeff', '55555555-5555-5555-5555-555555555555',
 'Working on a new brand logo design recently, inspired by traditional Chinese elements',
 ARRAY[]::TEXT[],
 'friends', NOW() - INTERVAL '6 hours');

-- Update user post counts
UPDATE users SET post_count = 2 WHERE user_id = '11111111-1111-1111-1111-111111111111';
UPDATE users SET post_count = 1 WHERE user_id = '22222222-2222-2222-2222-222222222222';
UPDATE users SET post_count = 2 WHERE user_id = '33333333-3333-3333-3333-333333333333';
UPDATE users SET post_count = 1 WHERE user_id = '44444444-4444-4444-4444-444444444444';
UPDATE users SET post_count = 2 WHERE user_id = '55555555-5555-5555-5555-555555555555';

-- ============================================================
-- 5. CREATE LIKES
-- ============================================================

-- Likes on Alice's first post
INSERT INTO likes (user_id, target_type, target_id) VALUES
('22222222-2222-2222-2222-222222222222', 'post', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('33333333-3333-3333-3333-333333333333', 'post', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('55555555-5555-5555-5555-555555555555', 'post', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- Likes on Carol's post
INSERT INTO likes (user_id, target_type, target_id) VALUES
('11111111-1111-1111-1111-111111111111', 'post', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
('22222222-2222-2222-2222-222222222222', 'post', 'cccccccc-cccc-cccc-cccc-cccccccccccc');

-- Likes on Emma's post
INSERT INTO likes (user_id, target_type, target_id) VALUES
('11111111-1111-1111-1111-111111111111', 'post', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
('44444444-4444-4444-4444-444444444444', 'post', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee');

-- Update post like counts
UPDATE posts SET like_count = 3 WHERE post_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
UPDATE posts SET like_count = 2 WHERE post_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
UPDATE posts SET like_count = 2 WHERE post_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

-- ============================================================
-- 6. CREATE COMMENTS
-- ============================================================

-- Comments on Alice's post
INSERT INTO comments (comment_id, post_id, author_id, content, comment_type, depth, created_at) VALUES
('c0000001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
 '22222222-2222-2222-2222-222222222222', 'Great photos! What camera do you use?', 'main', 0, NOW() - INTERVAL '1 hour'),
('c0000002-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 '33333333-3333-3333-3333-333333333333', 'West Lake is really beautiful, lets go together next time!', 'main', 0, NOW() - INTERVAL '50 minutes');

-- Reply to first comment
INSERT INTO comments (comment_id, post_id, author_id, parent_comment_id, content, comment_type, depth, created_at) VALUES
('c0000003-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 '11111111-1111-1111-1111-111111111111', 'c0000001-0000-0000-0000-000000000001', 
 'Its Sony A7M3 with a 24-70mm lens', 'reply', 1, NOW() - INTERVAL '45 minutes');

-- Update reply count
UPDATE comments SET reply_count = 1 WHERE comment_id = 'c0000001-0000-0000-0000-000000000001';

-- Comments on Carol's post
INSERT INTO comments (comment_id, post_id, author_id, content, comment_type, depth) VALUES
('c0000004-0000-0000-0000-000000000004', 'cccccccc-cccc-cccc-cccc-cccccccccccc',
 '22222222-2222-2222-2222-222222222222', 'Awesome! Can you share the code?', 'main', 0);

-- Update post comment counts
UPDATE posts SET comment_count = 3 WHERE post_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
UPDATE posts SET comment_count = 1 WHERE post_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

-- ============================================================
-- 7. UPDATE HOT SCORES
-- ============================================================

-- Update hot scores for all posts
SELECT update_post_hot_score(post_id) FROM posts WHERE is_deleted = false;

-- ============================================================
-- Test data seeding complete
-- ============================================================

-- Show summary
SELECT 'Database seeded successfully!' as status;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as post_count FROM posts;
SELECT COUNT(*) as comment_count FROM comments;
SELECT COUNT(*) as like_count FROM likes;
SELECT COUNT(*) as friendship_count FROM friendships;
