// Database client - currently using localStorage, will be replaced with real DB client

import type { User, UserInterest, Friendship, Post, Comment, Like, Repost, Notification } from "./schema"

class DatabaseClient {
  private getItem<T>(key: string): T[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  }

  private setItem<T>(key: string, data: T[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(key, JSON.stringify(data))
  }

  // Users
  async getUsers(): Promise<User[]> {
    return this.getItem<User>("db_users")
  }

  async getUserById(userId: string): Promise<User | null> {
    const users = await this.getUsers()
    return users.find((u) => u.user_id === userId) || null
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.getUsers()
    return users.find((u) => u.email === email) || null
  }

  async createUser(user: User): Promise<User> {
    const users = await this.getUsers()
    users.push(user)
    this.setItem("db_users", users)
    return user
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const users = await this.getUsers()
    const index = users.findIndex((u) => u.user_id === userId)
    if (index === -1) return null
    users[index] = { ...users[index], ...updates, updated_at: new Date().toISOString() }
    this.setItem("db_users", users)
    return users[index]
  }

  // User Interests
  async getUserInterests(userId: string): Promise<UserInterest[]> {
    const interests = this.getItem<UserInterest>("db_user_interests")
    return interests.filter((i) => i.user_id === userId)
  }

  async createUserInterest(interest: UserInterest): Promise<UserInterest> {
    const interests = this.getItem<UserInterest>("db_user_interests")
    interests.push(interest)
    this.setItem("db_user_interests", interests)
    return interest
  }

  async deleteUserInterests(userId: string): Promise<void> {
    const interests = this.getItem<UserInterest>("db_user_interests")
    this.setItem(
      "db_user_interests",
      interests.filter((i) => i.user_id !== userId),
    )
  }

  // Friendships
  async getFriendships(userId: string): Promise<Friendship[]> {
    const friendships = this.getItem<Friendship>("db_friendships")
    return friendships.filter((f) => f.user_id === userId || f.friend_id === userId)
  }

  async createFriendship(friendship: Friendship): Promise<Friendship> {
    const friendships = this.getItem<Friendship>("db_friendships")
    friendships.push(friendship)
    this.setItem("db_friendships", friendships)
    return friendship
  }

  async updateFriendship(friendshipId: string, updates: Partial<Friendship>): Promise<Friendship | null> {
    const friendships = this.getItem<Friendship>("db_friendships")
    const index = friendships.findIndex((f) => f.friendship_id === friendshipId)
    if (index === -1) return null
    friendships[index] = { ...friendships[index], ...updates }
    this.setItem("db_friendships", friendships)
    return friendships[index]
  }

  async deleteFriendship(userId: string, friendId: string): Promise<void> {
    const friendships = this.getItem<Friendship>("db_friendships")
    this.setItem(
      "db_friendships",
      friendships.filter(
        (f) =>
          !((f.user_id === userId && f.friend_id === friendId) || (f.user_id === friendId && f.friend_id === userId)),
      ),
    )
  }

  // Posts
  async getPosts(): Promise<Post[]> {
    return this.getItem<Post>("db_posts")
  }

  async getPostById(postId: string): Promise<Post | null> {
    const posts = await this.getPosts()
    return posts.find((p) => p.post_id === postId && !p.is_deleted) || null
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    const posts = await this.getPosts()
    return posts.filter((p) => p.author_id === userId && !p.is_deleted)
  }

  async createPost(post: Post): Promise<Post> {
    const posts = await this.getPosts()
    posts.push(post)
    this.setItem("db_posts", posts)
    return post
  }

  async updatePost(postId: string, updates: Partial<Post>): Promise<Post | null> {
    const posts = await this.getPosts()
    const index = posts.findIndex((p) => p.post_id === postId)
    if (index === -1) return null
    posts[index] = { ...posts[index], ...updates, updated_at: new Date().toISOString() }
    this.setItem("db_posts", posts)
    return posts[index]
  }

  async deletePost(postId: string): Promise<void> {
    const posts = await this.getPosts()
    const index = posts.findIndex((p) => p.post_id === postId)
    if (index !== -1) {
      posts[index].is_deleted = true
      posts[index].deleted_at = new Date().toISOString()
      this.setItem("db_posts", posts)
    }
  }

  // Comments
  async getCommentsByPostId(postId: string): Promise<Comment[]> {
    const comments = this.getItem<Comment>("db_comments")
    return comments.filter((c) => c.post_id === postId && !c.is_deleted)
  }

  async createComment(comment: Comment): Promise<Comment> {
    const comments = this.getItem<Comment>("db_comments")
    comments.push(comment)
    this.setItem("db_comments", comments)
    return comment
  }

  async updateComment(commentId: string, updates: Partial<Comment>): Promise<Comment | null> {
    const comments = this.getItem<Comment>("db_comments")
    const index = comments.findIndex((c) => c.comment_id === commentId)
    if (index === -1) return null
    comments[index] = { ...comments[index], ...updates }
    this.setItem("db_comments", comments)
    return comments[index]
  }

  // Likes
  async getLikes(targetType: string, targetId: string): Promise<Like[]> {
    const likes = this.getItem<Like>("db_likes")
    return likes.filter((l) => l.target_type === targetType && l.target_id === targetId)
  }

  async getUserLike(userId: string, targetType: string, targetId: string): Promise<Like | null> {
    const likes = this.getItem<Like>("db_likes")
    return likes.find((l) => l.user_id === userId && l.target_type === targetType && l.target_id === targetId) || null
  }

  async createLike(like: Like): Promise<Like> {
    const likes = this.getItem<Like>("db_likes")
    likes.push(like)
    this.setItem("db_likes", likes)
    return like
  }

  async deleteLike(userId: string, targetType: string, targetId: string): Promise<void> {
    const likes = this.getItem<Like>("db_likes")
    this.setItem(
      "db_likes",
      likes.filter((l) => !(l.user_id === userId && l.target_type === targetType && l.target_id === targetId)),
    )
  }

  // Reposts
  async createRepost(repost: Repost): Promise<Repost> {
    const reposts = this.getItem<Repost>("db_reposts")
    reposts.push(repost)
    this.setItem("db_reposts", reposts)
    return repost
  }

  // Notifications
  async getUserNotifications(userId: string): Promise<Notification[]> {
    const notifications = this.getItem<Notification>("db_notifications")
    return notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  async createNotification(notification: Notification): Promise<Notification> {
    const notifications = this.getItem<Notification>("db_notifications")
    notifications.push(notification)
    this.setItem("db_notifications", notifications)
    return notification
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const notifications = this.getItem<Notification>("db_notifications")
    const index = notifications.findIndex((n) => n.notification_id === notificationId)
    if (index !== -1) {
      notifications[index].is_read = true
      this.setItem("db_notifications", notifications)
    }
  }
}

export const db = new DatabaseClient()
