import { query } from "../pg-client"

export interface Post {
  post_id: string
  author_id: string
  content?: string
  image_urls: string[]
  visibility: "public" | "friends" | "private"
  type: "original" | "repost"
  like_count: number
  repost_count: number
  comment_count: number
  hot_score: number
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface Comment {
  comment_id: string
  post_id: string
  author_id: string
  parent_comment_id?: string
  content: string
  image_urls: string[]
  like_count: number
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface PostWithAuthor extends Post {
  author_name: string
  author_email: string
  author_avatar_url: string
  liked_by_current_user: boolean
  original_post_content?: string
  original_post_image_urls?: string[]
  original_post_created_at?: string
  original_post_author_id?: string
  original_post_author_name?: string
  original_post_author_avatar_url?: string
}

export interface CommentWithAuthor extends Comment {
  author_name: string
}

class PgPostService {
  // Create a new post
  async createPost(data: {
    author_id: string
    content?: string
    image_urls?: string[]
    visibility?: "public" | "friends" | "private"
  }): Promise<{ success: boolean; post?: Post; error?: string }> {
    try {
      if (!data.content && (!data.image_urls || data.image_urls.length === 0)) {
        return { success: false, error: "Post must have content or images" }
      }

      if (data.content && data.content.length > 1000) {
        return { success: false, error: "Post content cannot exceed 1000 characters" }
      }

      const result = await query<Post>(
        `INSERT INTO posts (author_id, content, image_urls, visibility)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [data.author_id, data.content || null, data.image_urls || [], data.visibility || "friends"],
      )

      const post = result.rows[0]
      console.log("[v0] Post created:", post.post_id)

      return { success: true, post }
    } catch (error) {
      console.error("[v0] Error creating post:", error)
      return { success: false, error: "Failed to create post" }
    }
  }

  // Get feed for a user (their posts + friends' posts)
  async getFeed(userId: string): Promise<PostWithAuthor[]> {
    try {
      const result = await query<PostWithAuthor>(
        `SELECT 
          p.*,
          u.name as author_name,
          u.email as author_email,
          u.avatar_url as author_avatar_url,
          EXISTS(
            SELECT 1 FROM likes 
            WHERE likes.target_type = 'post' 
            AND likes.target_id = p.post_id 
            AND likes.user_id = $1
          ) as liked_by_current_user,
          
          -- Fetch original post data if it's a repost
          op.content as original_post_content,
          op.image_urls as original_post_image_urls,
          op.created_at as original_post_created_at,
          ou.user_id as original_post_author_id,
          ou.name as original_post_author_name,
          ou.avatar_url as original_post_author_avatar_url

         FROM posts p
         JOIN users u ON p.author_id = u.user_id
         -- Left join for reposts
         LEFT JOIN posts op ON p.original_post_id = op.post_id
         LEFT JOIN users ou ON op.author_id = ou.user_id
         
         WHERE p.is_deleted = false
         AND (
           p.author_id = $1
           OR p.visibility = 'public'
           OR (
             p.visibility = 'friends'
             AND EXISTS (
               SELECT 1 FROM friendships f
               WHERE f.status = 'accepted'
               AND ((f.user_id = $1 AND f.friend_id = p.author_id)
                 OR (f.friend_id = $1 AND f.user_id = p.author_id))
             )
           )
         )
         ORDER BY p.created_at DESC
         LIMIT 100`,
        [userId],
      )

      console.log("[v0] Loaded", result.rows.length, "posts for feed")
      return result.rows
    } catch (error) {
      console.error("[v0] Error loading feed:", error)
      return []
    }
  }

  // Toggle like on a post
  async toggleLike(userId: string, postId: string): Promise<{ success: boolean; liked: boolean; newCount: number }> {
    try {
      // Check if already liked
      const existingLike = await query(
        "SELECT like_id FROM likes WHERE user_id = $1 AND target_type = $2 AND target_id = $3",
        [userId, "post", postId],
      )

      if (existingLike.rows.length > 0) {
        // Unlike
        await query("DELETE FROM likes WHERE user_id = $1 AND target_type = $2 AND target_id = $3", [
          userId,
          "post",
          postId,
        ])
        await query("UPDATE posts SET like_count = like_count - 1 WHERE post_id = $1", [postId])

        const countResult = await query<{ like_count: number }>("SELECT like_count FROM posts WHERE post_id = $1", [
          postId,
        ])

        console.log("[v0] Post unliked:", postId)
        return { success: true, liked: false, newCount: countResult.rows[0]?.like_count || 0 }
      } else {
        // Like
        await query("INSERT INTO likes (user_id, target_type, target_id) VALUES ($1, $2, $3)", [userId, "post", postId])
        await query("UPDATE posts SET like_count = like_count + 1 WHERE post_id = $1", [postId])

        const countResult = await query<{ like_count: number }>("SELECT like_count FROM posts WHERE post_id = $1", [
          postId,
        ])

        console.log("[v0] Post liked:", postId)
        return { success: true, liked: true, newCount: countResult.rows[0]?.like_count || 1 }
      }
    } catch (error) {
      console.error("[v0] Error toggling like:", error)
      return { success: false, liked: false, newCount: 0 }
    }
  }

  // Add a comment to a post
  async addComment(data: {
    user_id: string
    post_id: string
    content: string
  }): Promise<{ success: boolean; comment?: CommentWithAuthor; error?: string }> {
    try {
      if (!data.content || data.content.length > 500) {
        return { success: false, error: "Comment must be between 1 and 500 characters" }
      }

      const result = await query<Comment>(
        `INSERT INTO comments (post_id, author_id, content, comment_type, depth)
         VALUES ($1, $2, $3, 'main', 0)
         RETURNING *`,
        [data.post_id, data.user_id, data.content],
      )

      // Update post comment count
      await query("UPDATE posts SET comment_count = comment_count + 1 WHERE post_id = $1", [data.post_id])

      // Get author name
      const authorResult = await query<{ name: string }>("SELECT name FROM users WHERE user_id = $1", [data.user_id])

      const commentWithAuthor: CommentWithAuthor = {
        ...result.rows[0],
        author_name: authorResult.rows[0]?.name || "Unknown",
      }

      console.log("[v0] Comment added to post:", data.post_id)
      return { success: true, comment: commentWithAuthor }
    } catch (error) {
      console.error("[v0] Error adding comment:", error)
      return { success: false, error: "Failed to add comment" }
    }
  }

  // Get comments for a post
  async getComments(postId: string): Promise<CommentWithAuthor[]> {
    try {
      const result = await query<CommentWithAuthor>(
        `SELECT c.*, u.name as author_name
         FROM comments c
         JOIN users u ON c.author_id = u.user_id
         WHERE c.post_id = $1 AND c.is_deleted = false
         ORDER BY c.created_at ASC`,
        [postId],
      )

      return result.rows
    } catch (error) {
      console.error("[v0] Error loading comments:", error)
      return []
    }
  }

  // Delete a post
  async deletePost(postId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user owns the post
      const postResult = await query<Post>("SELECT * FROM posts WHERE post_id = $1", [postId])

      if (postResult.rows.length === 0) {
        return { success: false, error: "Post not found" }
      }

      if (postResult.rows[0].author_id !== userId) {
        return { success: false, error: "Unauthorized" }
      }

      // First delete related data (comments, likes, etc.)
      await query("DELETE FROM comments WHERE post_id = $1", [postId])
      await query("DELETE FROM likes WHERE target_type = 'post' AND target_id = $1", [postId])

      // Delete reposts of this post
      await query("DELETE FROM posts WHERE original_post_id = $1", [postId])

      // Finally delete the post itself
      await query("DELETE FROM posts WHERE post_id = $1", [postId])

      console.log("[v0] Post deleted from database:", postId)
      return { success: true }
    } catch (error) {
      console.error("[v0] Error deleting post:", error)
      return { success: false, error: "Failed to delete post" }
    }
  }
}

export const pgPostService = new PgPostService()
