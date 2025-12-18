-- Phase 2 & 3: Groups and Messages System
-- This script adds groups, group members, and messages tables

-- ============================================================
-- CREATE ENUMS FOR MESSAGES
-- ============================================================

DO $$ BEGIN
    CREATE TYPE message_type AS ENUM ('text', 'image');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- CREATE GROUPS TABLES
-- ============================================================

-- Groups Table
CREATE TABLE IF NOT EXISTS groups (
    group_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_name VARCHAR(100) NOT NULL,
    group_description TEXT,
    group_leader_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    avatar_url VARCHAR(500),
    tags TEXT[] DEFAULT '{}',
    member_count INTEGER DEFAULT 1 CHECK (member_count >= 0),
    is_disbanded BOOLEAN DEFAULT FALSE,
    disbanded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group Members Table
CREATE TABLE IF NOT EXISTS group_members (
    group_id UUID REFERENCES groups(group_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
);

-- Removed group_nicknames table - using only user_nicknames now

-- ============================================================
-- CREATE MESSAGES TABLE
-- ============================================================

-- Messages Table (supports both 1-on-1 and group messages)
CREATE TABLE IF NOT EXISTS messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(group_id) ON DELETE CASCADE,
    message_type message_type NOT NULL DEFAULT 'text',
    content TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CHECK (
        (receiver_id IS NOT NULL AND group_id IS NULL) OR
        (receiver_id IS NULL AND group_id IS NOT NULL)
    ),
    CHECK (
        (message_type = 'text' AND content IS NOT NULL AND LENGTH(content) <= 200) OR
        (message_type = 'image' AND content IS NOT NULL)
    )
);

-- ============================================================
-- CREATE INDEXES
-- ============================================================

-- Groups Indexes
CREATE INDEX IF NOT EXISTS idx_groups_leader ON groups(group_leader_id);
CREATE INDEX IF NOT EXISTS idx_groups_created ON groups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_groups_not_disbanded ON groups(is_disbanded) WHERE is_disbanded = FALSE;

-- Group Members Indexes
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);

-- Messages Indexes  
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_group ON messages(group_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id, sent_at DESC);

-- ============================================================
-- CREATE TRIGGERS
-- ============================================================

-- Update group updated_at timestamp
DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Increment group member count when member joins
DROP FUNCTION IF EXISTS increment_group_member_count() CASCADE;
CREATE OR REPLACE FUNCTION increment_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE groups SET member_count = member_count + 1 WHERE group_id = NEW.group_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_group_member_count ON group_members;
CREATE TRIGGER trigger_increment_group_member_count
AFTER INSERT ON group_members
FOR EACH ROW EXECUTE FUNCTION increment_group_member_count();

-- Decrement group member count when member leaves
DROP FUNCTION IF EXISTS decrement_group_member_count() CASCADE;
CREATE OR REPLACE FUNCTION decrement_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE groups SET member_count = member_count - 1 WHERE group_id = OLD.group_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_decrement_group_member_count ON group_members;
CREATE TRIGGER trigger_decrement_group_member_count
AFTER DELETE ON group_members
FOR EACH ROW EXECUTE FUNCTION decrement_group_member_count();

-- ============================================================
-- Groups and Messages system initialization complete
-- ============================================================
