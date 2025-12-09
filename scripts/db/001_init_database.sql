-- FriendFinder Database Initialization Script
-- PostgreSQL 13+ required for gen_random_uuid()
-- This script creates all tables, types, and indexes

-- ============================================================
-- 1. CREATE ENUMS
-- ============================================================

DO $$ BEGIN
    CREATE TYPE post_visibility AS ENUM ('public', 'friends', 'private');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE post_type AS ENUM ('original', 'repost');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'rejected', 'blocked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('like', 'comment', 'repost', 'friend_request', 'mention');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE target_type AS ENUM ('post', 'comment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE comment_type AS ENUM ('main', 'reply');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- 2. CREATE TABLES
-- ============================================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    age INTEGER CHECK (age >= 13 AND age <= 120),
    location VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    background_image_url VARCHAR(500),
    
    -- Statistics (denormalized for performance)
    post_count INTEGER DEFAULT 0 CHECK (post_count >= 0),
    follower_count INTEGER DEFAULT 0 CHECK (follower_count >= 0),
    following_count INTEGER DEFAULT 0 CHECK (following_count >= 0),
    
    -- Privacy Settings
    profile_visibility post_visibility DEFAULT 'public',
    post_default_visibility post_visibility DEFAULT 'friends',
    allow_message_from post_visibility DEFAULT 'friends',
    require_friend_confirmation BOOLEAN DEFAULT true,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Interests Table (array-based storage for better performance)
CREATE TABLE IF NOT EXISTS user_interests (
    user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    hobbies TEXT[] NOT NULL DEFAULT '{}'
);

-- Friendships Table
CREATE TABLE IF NOT EXISTS friendships (
    friendship_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status friendship_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    UNIQUE(user_id, friend_id),
    CHECK (user_id != friend_id)
);

-- Posts Table
CREATE TABLE IF NOT EXISTS posts (
    post_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Content
    content TEXT CHECK (LENGTH(content) <= 1000),
    image_urls TEXT[] DEFAULT '{}',
    
    -- Metadata
    visibility post_visibility NOT NULL DEFAULT 'friends',
    type post_type NOT NULL DEFAULT 'original',
    
    -- Repost Information
    original_post_id UUID REFERENCES posts(post_id) ON DELETE SET NULL,
    root_post_id UUID REFERENCES posts(post_id) ON DELETE SET NULL,
    depth INTEGER DEFAULT 0 CHECK (depth >= 0 AND depth <= 10),
    
    -- Statistics (denormalized)
    like_count INTEGER DEFAULT 0 CHECK (like_count >= 0),
    repost_count INTEGER DEFAULT 0 CHECK (repost_count >= 0),
    comment_count INTEGER DEFAULT 0 CHECK (comment_count >= 0),
    
    -- Feed Algorithm Score
    hot_score FLOAT DEFAULT 0,
    
    -- Soft Delete
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments Table (2-level structure: main comments and replies)
CREATE TABLE IF NOT EXISTS comments (
    comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(comment_id) ON DELETE CASCADE,
    
    -- Content
    content TEXT NOT NULL CHECK (LENGTH(content) <= 500),
    image_urls TEXT[] DEFAULT '{}' CHECK (array_length(image_urls, 1) <= 3),
    
    -- Metadata
    comment_type comment_type NOT NULL DEFAULT 'main',
    depth INTEGER NOT NULL DEFAULT 0 CHECK (depth IN (0, 1)),
    
    -- Statistics
    like_count INTEGER DEFAULT 0 CHECK (like_count >= 0),
    reply_count INTEGER DEFAULT 0 CHECK (reply_count >= 0),
    
    -- Soft Delete
    is_deleted BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure comment structure is valid
    CONSTRAINT valid_comment_structure CHECK (
        (parent_comment_id IS NULL AND comment_type = 'main' AND depth = 0) OR
        (parent_comment_id IS NOT NULL AND comment_type = 'reply' AND depth = 1)
    )
);

-- Likes Table (unified for posts and comments)
CREATE TABLE IF NOT EXISTS likes (
    like_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    target_type target_type NOT NULL,
    target_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, target_type, target_id)
);

-- Reposts Table
CREATE TABLE IF NOT EXISTS reposts (
    repost_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    original_post_id UUID NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    root_post_id UUID NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    
    -- Repost Content
    content TEXT CHECK (LENGTH(content) <= 300),
    image_urls TEXT[] DEFAULT '{}' CHECK (array_length(image_urls, 1) <= 3),
    
    -- Repost Tree Information
    depth INTEGER DEFAULT 0 CHECK (depth >= 0 AND depth <= 10),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    actor_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Related Content
    post_id UUID REFERENCES posts(post_id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(comment_id) ON DELETE CASCADE,
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================================

-- Users Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active_at DESC);

-- User Interests Indexes
CREATE INDEX IF NOT EXISTS idx_user_interests_user_id ON user_interests(user_id);
-- No need for idx_user_interests_interest as hobbies is an array

-- Friendships Indexes
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

-- Posts Indexes (Critical for Feed Performance)
CREATE INDEX IF NOT EXISTS idx_posts_author_created ON posts(author_id, created_at DESC) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_posts_visibility_created ON posts(visibility, created_at DESC) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_posts_hot_score ON posts(hot_score DESC, created_at DESC) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_posts_root_post ON posts(root_post_id) WHERE root_post_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_original_post ON posts(original_post_id) WHERE original_post_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC) WHERE is_deleted = false;

-- Comments Indexes
CREATE INDEX IF NOT EXISTS idx_comments_post_created ON comments(post_id, created_at DESC) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;

-- Likes Indexes
CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_created ON likes(user_id, created_at DESC);

-- Reposts Indexes
CREATE INDEX IF NOT EXISTS idx_reposts_user ON reposts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reposts_original_post ON reposts(original_post_id);
CREATE INDEX IF NOT EXISTS idx_reposts_root_post ON reposts(root_post_id);

-- Notifications Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, created_at DESC) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- ============================================================
-- 4. CREATE TRIGGERS
-- ============================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop triggers if they exist before creating to make script idempotent
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Database initialization complete
-- ============================================================
