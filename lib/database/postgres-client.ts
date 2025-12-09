// PostgreSQL Database Client
// This replaces the localStorage client with a real PostgreSQL connection

import { Pool } from "pg"
import type { User, Friendship, Post, Comment, Like, Repost, Notification } from "./schema"

class PostgresClient {
  private pool: Pool

  constructor() {
    // Initialize connection pool
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      max: 20, // Maximum pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    // Handle pool errors
    this.pool.on("error", (err) => {
      console.error("[v0] Unexpected database error:", err)
    })
  }

  // ============================================================
  // USERS
  // ============================================================

  async getUsers(): Promise<User[]> {
    const result = await this.pool.query<User>("SELECT * FROM users WHERE is_active = true ORDER BY created_at DESC")
    return result.rows
  }

  async getUserById(userId: string): Promise<User | null> {
    const result = await this.pool.query<User>("SELECT * FROM users WHERE user_id = $1", [userId])
    return result.rows[0] || null
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query<User>("SELECT * FROM users WHERE email = $1", [email])
    return result.rows[0] || null
  }

  async createUser(user: User): Promise<User> {
    const query = `
      INSERT INTO users (
        user_id, email, password_hash, name, age, location, bio, avatar_url,
        background_image_url, post_count, follower_count, following_count,
        profile_visibility, post_default_visibility, allow_message_from,
        require_friend_confirmation, is_active, last_active_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `
    const values = [
      user.user_id,
      user.email,
      user.password_hash,
      user.name,
      user.age || null,
      user.location || null,
      user.bio || null,
      user.avatar_url || null,
      user.background_image_url || null,
      user.post_count || 0,
      user.follower_count || 0,
      user.following_count || 0,
      user.profile_visibility || "public",
      user.post_default_visibility || "friends",
      user.allow_message_from || "friends",
      user.require_friend_confirmation !== false,
      user.is_active !== false,
      user.last_active_at || new Date().toISOString(),
    ]
    const result = await this.pool.query<User>(query, values)
    return result.rows[0]
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const fields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== "user_id" && key !== "updated_at" && value !== undefined) {
        fields.push(`${key} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
    })

    if (fields.length === 0) return this.getUserById(userId)

    values.push(userId)
    const query = `UPDATE users SET ${fields.join(", ")}, updated_at = NOW() WHERE user_id = $${paramIndex} RETURNING *`

    const result = await this.pool.query<User>(query, values)
    return result.rows[0] || null
  }

  // ============================================================
  // USER INTERESTS
  // ============================================================

  async getUserInterests(userId: string): Promise<string[]> {
    const result = await this.pool.query<{ hobbies: string[] }>(
      "SELECT hobbies FROM user_interests WHERE user_id = $1",
      [userId],
    )
    return result.rows[0]?.hobbies || []
  }

  async setUserInterests(userId: string, hobbies: string[]): Promise<string[]> {
    const query = `
      INSERT INTO user_interests (user_id, hobbies)
      VALUES ($1, $2)
      ON CONFLICT (user_id) DO UPDATE SET hobbies = $2
      RETURNING hobbies
    `
    const result = await this.pool.query<{ hobbies: string[] }>(query, [userId, hobbies])
    return result.rows[0].hobbies
  }

  async deleteUserInterests(userId: string): Promise<void> {
    await this.pool.query("DELETE FROM user_interests WHERE user_id = $1", [userId])
  }

  // ============================================================
  // FRIENDSHIPS
  // ============================================================

  async getFriendships(userId: string): Promise<Friendship[]> {
    const result = await this.pool.query<Friendship>(
      "SELECT * FROM friendships WHERE user_id = $1 OR friend_id = $1 ORDER BY created_at DESC",
      [userId],
    )
    return result.rows
  }

  async createFriendship(friendship: Friendship): Promise<Friendship> {
    const query = `
      INSERT INTO friendships (friendship_id, user_id, friend_id, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `
    const result = await this.pool.query<Friendship>(query, [
      friendship.friendship_id,
      friendship.user_id,
      friendship.friend_id,
      friendship.status,
    ])
    return result.rows[0]
  }

  async updateFriendship(friendshipId: string, updates: Partial<Friendship>): Promise<Friendship | null> {
    const fields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== "friendship_id" && value !== undefined) {
        fields.push(`${key} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
    })

    if (fields.length === 0) {
      const result = await this.pool.query<Friendship>("SELECT * FROM friendships WHERE friendship_id = $1", [
        friendshipId,
      ])
      return result.rows[0] || null
    }

    values.push(friendshipId)
    const query = `UPDATE friendships SET ${fields.join(", ")} WHERE friendship_id = $${paramIndex} RETURNING *`

    const result = await this.pool.query<Friendship>(query, values)
    return result.rows[0] || null
  }

  async deleteFriendship(userId: string, friendId: string): Promise<void> {
    await this.pool.query(
      "DELETE FROM friendships WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)",
      [userId, friendId],
    )
  }

  // ============================================================
  // POSTS
  // ============================================================

  async getPosts(): Promise<Post[]> {
    const result = await this.pool.query<Post>("SELECT * FROM posts WHERE is_deleted = false ORDER BY created_at DESC")
    return result.rows
  }

  async getPostById(postId: string): Promise<Post | null> {
    const result = await this.pool.query<Post>("SELECT * FROM posts WHERE post_id = $1 AND is_deleted = false", [
      postId,
    ])
    return result.rows[0] || null
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    const result = await this.pool.query<Post>(
      "SELECT * FROM posts WHERE author_id = $1 AND is_deleted = false ORDER BY created_at DESC",
      [userId],
    )
    return result.rows
  }

  async createPost(post: Post): Promise<Post> {
    const query = `
      INSERT INTO posts (
        post_id, author_id, content, image_urls, visibility, type,
        original_post_id, root_post_id, like_count, repost_count, 
        comment_count, hot_score, is_deleted
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `
    const values = [
      post.post_id,
      post.author_id,
      post.content || null,
      post.image_urls || [],
      post.visibility || "friends",
      post.type || "original",
      post.original_post_id || null,
      post.root_post_id || null,
      post.like_count || 0,
      post.repost_count || 0,
      post.comment_count || 0,
      post.hot_score || 0,
      post.is_deleted || false,
    ]
    const result = await this.pool.query<Post>(query, values)
    return result.rows[0]
  }

  async updatePost(postId: string, updates: Partial<Post>): Promise<Post | null> {
    const fields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== "post_id" && key !== "updated_at" && value !== undefined) {
        fields.push(`${key} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
    })

    if (fields.length === 0) return this.getPostById(postId)

    values.push(postId)
    const query = `UPDATE posts SET ${fields.join(", ")}, updated_at = NOW() WHERE post_id = $${paramIndex} RETURNING *`

    const result = await this.pool.query<Post>(query, values)
    return result.rows[0] || null
  }

  async deletePost(postId: string): Promise<void> {
    await this.pool.query("UPDATE posts SET is_deleted = true, deleted_at = NOW() WHERE post_id = $1", [postId])
  }

  // ============================================================
  // COMMENTS
  // ============================================================

  async getCommentsByPostId(postId: string): Promise<Comment[]> {
    const result = await this.pool.query<Comment>(
      "SELECT * FROM comments WHERE post_id = $1 AND is_deleted = false ORDER BY created_at ASC",
      [postId],
    )
    return result.rows
  }

  async createComment(comment: Comment): Promise<Comment> {
    const query = `
      INSERT INTO comments (
        comment_id, post_id, author_id, parent_comment_id, content,
        image_urls, depth, like_count, is_deleted
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `
    const values = [
      comment.comment_id,
      comment.post_id,
      comment.author_id,
      comment.parent_comment_id || null,
      comment.content,
      comment.image_urls || [],
      comment.depth || 0,
      comment.like_count || 0,
      comment.is_deleted || false,
    ]
    const result = await this.pool.query<Comment>(query, values)
    return result.rows[0]
  }

  async updateComment(commentId: string, updates: Partial<Comment>): Promise<Comment | null> {
    const fields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== "comment_id" && key !== "updated_at" && value !== undefined) {
        fields.push(`${key} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
    })

    if (fields.length === 0) {
      const result = await this.pool.query<Comment>("SELECT * FROM comments WHERE comment_id = $1", [commentId])
      return result.rows[0] || null
    }

    values.push(commentId)
    const query = `UPDATE comments SET ${fields.join(", ")}, updated_at = NOW() WHERE comment_id = $${paramIndex} RETURNING *`

    const result = await this.pool.query<Comment>(query, values)
    return result.rows[0] || null
  }

  // ============================================================
  // LIKES
  // ============================================================

  async getLikes(targetType: string, targetId: string): Promise<Like[]> {
    const result = await this.pool.query<Like>(
      "SELECT * FROM likes WHERE target_type = $1 AND target_id = $2 ORDER BY created_at DESC",
      [targetType, targetId],
    )
    return result.rows
  }

  async getUserLike(userId: string, targetType: string, targetId: string): Promise<Like | null> {
    const result = await this.pool.query<Like>(
      "SELECT * FROM likes WHERE user_id = $1 AND target_type = $2 AND target_id = $3",
      [userId, targetType, targetId],
    )
    return result.rows[0] || null
  }

  async createLike(like: Like): Promise<Like> {
    const query = "INSERT INTO likes (like_id, user_id, target_type, target_id) VALUES ($1, $2, $3, $4) RETURNING *"
    const result = await this.pool.query<Like>(query, [like.like_id, like.user_id, like.target_type, like.target_id])
    return result.rows[0]
  }

  async deleteLike(userId: string, targetType: string, targetId: string): Promise<void> {
    await this.pool.query("DELETE FROM likes WHERE user_id = $1 AND target_type = $2 AND target_id = $3", [
      userId,
      targetType,
      targetId,
    ])
  }

  // ============================================================
  // REPOSTS
  // ============================================================

  async createRepost(repost: Repost): Promise<Repost> {
    const query = `
      INSERT INTO reposts (
        repost_id, user_id, original_post_id, root_post_id,
        content, image_urls, depth
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `
    const values = [
      repost.repost_id,
      repost.user_id,
      repost.original_post_id,
      repost.root_post_id,
      repost.content || null,
      repost.image_urls || [],
      repost.depth || 0,
    ]
    const result = await this.pool.query<Repost>(query, values)
    return result.rows[0]
  }

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const result = await this.pool.query<Notification>(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
      [userId],
    )
    return result.rows
  }

  async createNotification(notification: Notification): Promise<Notification> {
    const query = `
      INSERT INTO notifications (
        notification_id, user_id, type, actor_id,
        post_id, comment_id, is_read
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `
    const values = [
      notification.notification_id,
      notification.user_id,
      notification.type,
      notification.actor_id,
      notification.post_id || null,
      notification.comment_id || null,
      notification.is_read || false,
    ]
    const result = await this.pool.query<Notification>(query, values)
    return result.rows[0]
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.pool.query("UPDATE notifications SET is_read = true WHERE notification_id = $1", [notificationId])
  }

  // ============================================================
  // UTILITY METHODS
  // ============================================================

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.pool.query("SELECT NOW()")
      console.log("[v0] Database connection successful:", result.rows[0])
      return true
    } catch (error) {
      console.error("[v0] Database connection failed:", error)
      return false
    }
  }

  async close(): Promise<void> {
    await this.pool.end()
  }
}

// Export singleton instance
export const postgresDb = new PostgresClient()
