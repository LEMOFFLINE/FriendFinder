-- Business Logic Functions for FriendFinder
-- These functions implement core business logic with proper validation

-- ============================================================
-- 1. COMMENT FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION create_comment(
    p_post_id UUID,
    p_author_id UUID,
    p_content TEXT,
    p_parent_comment_id UUID DEFAULT NULL,
    p_image_urls TEXT[] DEFAULT '{}'
) RETURNS JSONB AS $$
DECLARE
    v_comment_type comment_type;
    v_depth INTEGER;
    v_new_comment_id UUID;
    v_post_author_id UUID;
    v_parent_author_id UUID;
    v_new_comment_count INTEGER;
BEGIN
    -- Validate content
    IF p_content IS NULL OR LENGTH(TRIM(p_content)) = 0 THEN
        RETURN jsonb_build_object('success', false, 'error', '评论内容不能为空');
    END IF;
    
    IF LENGTH(p_content) > 500 THEN
        RETURN jsonb_build_object('success', false, 'error', '评论内容不能超过500字符');
    END IF;
    
    -- Validate image count
    IF array_length(p_image_urls, 1) > 3 THEN
        RETURN jsonb_build_object('success', false, 'error', '评论图片不能超过3张');
    END IF;
    
    -- Determine comment type and depth
    IF p_parent_comment_id IS NULL THEN
        v_comment_type := 'main';
        v_depth := 0;
    ELSE
        -- Verify parent is a main comment (depth 0)
        SELECT depth INTO v_depth FROM comments 
        WHERE comment_id = p_parent_comment_id AND is_deleted = false;
        
        IF v_depth IS NULL THEN
            RETURN jsonb_build_object('success', false, 'error', '父评论不存在');
        END IF;
        
        IF v_depth != 0 THEN
            RETURN jsonb_build_object('success', false, 'error', '只能回复主评论');
        END IF;
        
        v_comment_type := 'reply';
        v_depth := 1;
    END IF;
    
    -- Create comment
    INSERT INTO comments (post_id, author_id, parent_comment_id, comment_type, depth, content, image_urls)
    VALUES (p_post_id, p_author_id, p_parent_comment_id, v_comment_type, v_depth, p_content, p_image_urls)
    RETURNING comment_id INTO v_new_comment_id;
    
    -- Update reply count for parent comment
    IF v_comment_type = 'reply' THEN
        UPDATE comments 
        SET reply_count = reply_count + 1
        WHERE comment_id = p_parent_comment_id;
        
        -- Get parent comment author for notification
        SELECT author_id INTO v_parent_author_id
        FROM comments WHERE comment_id = p_parent_comment_id;
    END IF;
    
    -- Update post comment count
    UPDATE posts 
    SET comment_count = comment_count + 1, updated_at = NOW()
    WHERE post_id = p_post_id
    RETURNING comment_count, author_id INTO v_new_comment_count, v_post_author_id;
    
    -- Create notifications
    IF v_comment_type = 'main' THEN
        -- Notify post author (if not commenting on own post)
        IF v_post_author_id != p_author_id THEN
            INSERT INTO notifications (user_id, type, actor_id, post_id, comment_id)
            VALUES (v_post_author_id, 'comment', p_author_id, p_post_id, v_new_comment_id);
        END IF;
    ELSE
        -- Notify parent comment author (if not replying to own comment)
        IF v_parent_author_id != p_author_id THEN
            INSERT INTO notifications (user_id, type, actor_id, post_id, comment_id)
            VALUES (v_parent_author_id, 'comment', p_author_id, p_post_id, v_new_comment_id);
        END IF;
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'comment_id', v_new_comment_id,
        'comment_count', v_new_comment_count
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 2. LIKE FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION toggle_like(
    p_user_id UUID,
    p_target_type target_type,
    p_target_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_like_exists BOOLEAN;
    v_author_id UUID;
    v_action_type TEXT;
    v_new_count INTEGER;
BEGIN
    -- Check if like already exists
    SELECT EXISTS(
        SELECT 1 FROM likes 
        WHERE user_id = p_user_id 
        AND target_type = p_target_type 
        AND target_id = p_target_id
    ) INTO v_like_exists;
    
    IF v_like_exists THEN
        -- Unlike
        DELETE FROM likes 
        WHERE user_id = p_user_id 
        AND target_type = p_target_type 
        AND target_id = p_target_id;
        
        v_action_type := 'unlike';
    ELSE
        -- Like
        INSERT INTO likes (user_id, target_type, target_id) 
        VALUES (p_user_id, p_target_type, p_target_id);
        
        v_action_type := 'like';
        
        -- Get author for notification (exclude self-likes)
        IF p_target_type = 'post' THEN
            SELECT author_id INTO v_author_id FROM posts WHERE post_id = p_target_id;
        ELSE
            SELECT author_id INTO v_author_id FROM comments WHERE comment_id = p_target_id;
        END IF;
        
        -- Create notification if not liking own content
        IF v_author_id != p_user_id THEN
            INSERT INTO notifications (user_id, type, actor_id, post_id, comment_id)
            VALUES (
                v_author_id,
                'like',
                p_user_id,
                CASE WHEN p_target_type = 'post' THEN p_target_id ELSE NULL END,
                CASE WHEN p_target_type = 'comment' THEN p_target_id ELSE NULL END
            );
        END IF;
    END IF;
    
    -- Update like count
    IF p_target_type = 'post' THEN
        UPDATE posts 
        SET like_count = (
            SELECT COUNT(*) FROM likes 
            WHERE target_type = 'post' AND target_id = p_target_id
        )
        WHERE post_id = p_target_id
        RETURNING like_count INTO v_new_count;
    ELSE
        UPDATE comments 
        SET like_count = (
            SELECT COUNT(*) FROM likes 
            WHERE target_type = 'comment' AND target_id = p_target_id
        )
        WHERE comment_id = p_target_id
        RETURNING like_count INTO v_new_count;
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'action', v_action_type,
        'liked', v_action_type = 'like',
        'new_count', COALESCE(v_new_count, 0)
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 3. REPOST FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION create_repost(
    p_user_id UUID,
    p_original_post_id UUID,
    p_content TEXT DEFAULT '',
    p_image_urls TEXT[] DEFAULT '{}'
) RETURNS JSONB AS $$
DECLARE
    v_original_post posts%ROWTYPE;
    v_root_post_id UUID;
    v_depth INTEGER;
    v_new_post_id UUID;
    v_repost_count INTEGER;
BEGIN
    -- Get original post
    SELECT * INTO v_original_post 
    FROM posts 
    WHERE post_id = p_original_post_id AND is_deleted = false;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', '帖子不存在');
    END IF;
    
    -- Check visibility
    IF v_original_post.visibility = 'private' THEN
        RETURN jsonb_build_object('success', false, 'error', '无法转发私有帖子');
    END IF;
    
    -- Validate repost content
    IF LENGTH(p_content) > 300 THEN
        RETURN jsonb_build_object('success', false, 'error', '转发评论不能超过300字符');
    END IF;
    
    IF array_length(p_image_urls, 1) > 3 THEN
        RETURN jsonb_build_object('success', false, 'error', '转发图片不能超过3张');
    END IF;
    
    -- Determine root post and depth
    IF v_original_post.type = 'original' THEN
        v_root_post_id := v_original_post.post_id;
        v_depth := 1;
    ELSE
        v_root_post_id := v_original_post.root_post_id;
        v_depth := v_original_post.depth + 1;
    END IF;
    
    -- Check depth limit
    IF v_depth > 10 THEN
        RETURN jsonb_build_object('success', false, 'error', '转发深度已达到限制');
    END IF;
    
    -- Create repost as a post
    INSERT INTO posts (
        author_id, content, image_urls, type, 
        original_post_id, root_post_id, depth,
        visibility
    ) VALUES (
        p_user_id, p_content, p_image_urls, 'repost',
        v_original_post.post_id, v_root_post_id, v_depth,
        'public' -- Reposts are typically public
    ) RETURNING post_id INTO v_new_post_id;
    
    -- Create repost record
    INSERT INTO reposts (
        user_id, original_post_id, root_post_id, 
        content, image_urls, depth
    ) VALUES (
        p_user_id, p_original_post_id, v_root_post_id, 
        p_content, p_image_urls, v_depth
    );
    
    -- Update original post repost count
    UPDATE posts 
    SET repost_count = repost_count + 1, updated_at = NOW()
    WHERE post_id = p_original_post_id
    RETURNING repost_count INTO v_repost_count;
    
    -- Update user post count
    UPDATE users 
    SET post_count = post_count + 1
    WHERE user_id = p_user_id;
    
    -- Create notification (exclude self-reposts)
    IF v_original_post.author_id != p_user_id THEN
        INSERT INTO notifications (user_id, type, actor_id, post_id)
        VALUES (v_original_post.author_id, 'repost', p_user_id, p_original_post_id);
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'post_id', v_new_post_id,
        'repost_count', v_repost_count
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 4. FEED ALGORITHM FUNCTIONS
-- ============================================================

-- Update hot score for feed algorithm
CREATE OR REPLACE FUNCTION update_post_hot_score(p_post_id UUID) 
RETURNS VOID AS $$
BEGIN
    UPDATE posts 
    SET hot_score = (
        -- Time decay + engagement weight formula
        -- Newer posts + more engagement = higher score
        POWER((EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600.0 + 2), -1.8) *
        (like_count * 0.4 + comment_count * 0.3 + repost_count * 0.3 + 1)
    )
    WHERE post_id = p_post_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update hot score on engagement
CREATE OR REPLACE FUNCTION trigger_update_hot_score()
RETURNS TRIGGER AS $$
DECLARE
    v_post_id UUID;
BEGIN
    -- Determine which post to update
    IF TG_TABLE_NAME = 'likes' THEN
        IF NEW.target_type = 'post' THEN
            v_post_id := NEW.target_id;
        ELSE
            -- Get post_id from comment
            SELECT post_id INTO v_post_id FROM comments WHERE comment_id = NEW.target_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'comments' THEN
        v_post_id := NEW.post_id;
    ELSIF TG_TABLE_NAME = 'reposts' THEN
        v_post_id := NEW.original_post_id;
    END IF;
    
    IF v_post_id IS NOT NULL THEN
        PERFORM update_post_hot_score(v_post_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for hot score updates
DROP TRIGGER IF EXISTS update_hot_score_on_like ON likes;
CREATE TRIGGER update_hot_score_on_like
    AFTER INSERT OR DELETE ON likes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_hot_score();

DROP TRIGGER IF EXISTS update_hot_score_on_comment ON comments;
CREATE TRIGGER update_hot_score_on_comment
    AFTER INSERT ON comments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_hot_score();

DROP TRIGGER IF EXISTS update_hot_score_on_repost ON reposts;
CREATE TRIGGER update_hot_score_on_repost
    AFTER INSERT ON reposts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_hot_score();

-- ============================================================
-- 5. USER FEED QUERY FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_feed(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
) RETURNS TABLE(
    post_id UUID,
    author_id UUID,
    content TEXT,
    image_urls TEXT[],
    visibility post_visibility,
    type post_type,
    original_post_id UUID,
    like_count INTEGER,
    comment_count INTEGER,
    repost_count INTEGER,
    hot_score FLOAT,
    created_at TIMESTAMPTZ,
    author_name VARCHAR,
    author_avatar_url VARCHAR,
    is_liked BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.post_id,
        p.author_id,
        p.content,
        p.image_urls,
        p.visibility,
        p.type,
        p.original_post_id,
        p.like_count,
        p.comment_count,
        p.repost_count,
        p.hot_score,
        p.created_at,
        u.name as author_name,
        u.avatar_url as author_avatar_url,
        EXISTS(
            SELECT 1 FROM likes l 
            WHERE l.user_id = p_user_id 
            AND l.target_type = 'post' 
            AND l.target_id = p.post_id
        ) as is_liked
    FROM posts p
    JOIN users u ON p.author_id = u.user_id
    WHERE p.is_deleted = false
    AND (
        -- User's own posts
        p.author_id = p_user_id
        OR
        -- Public posts
        p.visibility = 'public'
        OR
        -- Friends' posts
        (p.visibility = 'friends' AND EXISTS(
            SELECT 1 FROM friendships f 
            WHERE ((f.user_id = p_user_id AND f.friend_id = p.author_id)
                OR (f.friend_id = p_user_id AND f.user_id = p.author_id))
            AND f.status = 'accepted'
        ))
    )
    ORDER BY p.hot_score DESC, p.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Functions created successfully
-- ============================================================
