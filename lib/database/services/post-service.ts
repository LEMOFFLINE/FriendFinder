// Post service - business logic for posts

import { db } from "../client"
import type { Post, Comment, Like } from "../schema"
import { generateId } from "../../utils"

export class PostService {
  async createPost(data: {
    author_id: string
    content?: string
    image_urls?: string[]
    visibility?: "public" | "friends" | "private"
  }): Promise<{ success: boolean; post?: Post; error?: string }> {
    if (!data.content && (!data.image_urls || data.image_urls.length === 0)) {
      return { success: false, error: "Post must have content or images" }
    }

    if (data.content && data.content.length > 1000) {
      return { success: false, error: "Post content cannot exceed 1000 characters" }
    }

    const postId = generateId()
    const post: Post = {
      post_id: postId,
      author_id: data.author_id,
      content: data.content,
      image_urls: data.image_urls || [],
      visibility: data.visibility || "friends",
      type: "original",
      like_count: 0,
      repost_count: 0,
      comment_count: 0,
      hot_score: 0,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const createdPost = await db.createPost(post)

    // Update user post count
    const user = await db.getUserById(data.author_id)
    if (user) {
      await db.updateUser(data.author_id, { post_count: user.post_count + 1 })
    }

    return { success: true, post: createdPost }
  }

  async getFeed(userId: string): Promise<Post[]> {
    const friendships = await db.getFriendships(userId)
    const friendIds = friendships
      .filter((f) => f.status === "accepted")
      .map((f) => (f.user_id === userId ? f.friend_id : f.user_id))

    const allPosts = await db.getPosts()

    return allPosts
      .filter((p) => {
        if (p.is_deleted) return false
        if (p.author_id === userId) return true
        if (p.visibility === "public") return true
        if (p.visibility === "friends" && friendIds.includes(p.author_id)) return true
        return false
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  async toggleLike(
    userId: string,
    targetType: "post" | "comment",
    targetId: string,
  ): Promise<{
    success: boolean
    liked: boolean
    newCount: number
  }> {
    const existingLike = await db.getUserLike(userId, targetType, targetId)

    if (existingLike) {
      // Unlike
      await db.deleteLike(userId, targetType, targetId)

      if (targetType === "post") {
        const post = await db.getPostById(targetId)
        if (post) {
          const newCount = Math.max(0, post.like_count - 1)
          await db.updatePost(targetId, { like_count: newCount })
          return { success: true, liked: false, newCount }
        }
      } else {
        // Comment like count update logic here
      }

      return { success: true, liked: false, newCount: 0 }
    } else {
      // Like
      const like: Like = {
        like_id: generateId(),
        user_id: userId,
        target_type: targetType,
        target_id: targetId,
        created_at: new Date().toISOString(),
      }
      await db.createLike(like)

      if (targetType === "post") {
        const post = await db.getPostById(targetId)
        if (post) {
          const newCount = post.like_count + 1
          await db.updatePost(targetId, { like_count: newCount })
          return { success: true, liked: true, newCount }
        }
      }

      return { success: true, liked: true, newCount: 1 }
    }
  }

  async createComment(data: {
    user_id: string
    post_id: string
    content: string
    parent_comment_id?: string
  }): Promise<{ success: boolean; comment?: Comment; error?: string }> {
    if (!data.content || data.content.length > 500) {
      return { success: false, error: "Comment must be between 1 and 500 characters" }
    }

    const comment: Comment = {
      comment_id: generateId(),
      post_id: data.post_id,
      author_id: data.user_id,
      parent_comment_id: data.parent_comment_id,
      content: data.content,
      image_urls: [],
      depth: 0, // TODO: Calculate depth from parent
      like_count: 0,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const createdComment = await db.createComment(comment)

    // Update post comment count
    const post = await db.getPostById(data.post_id)
    if (post) {
      await db.updatePost(data.post_id, { comment_count: post.comment_count + 1 })
    }

    return { success: true, comment: createdComment }
  }

  async getComments(postId: string): Promise<Comment[]> {
    return await db.getCommentsByPostId(postId)
  }

  async deletePost(postId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    const post = await db.getPostById(postId)
    if (!post) {
      return { success: false, error: "Post not found" }
    }

    if (post.author_id !== userId) {
      return { success: false, error: "Unauthorized" }
    }

    await db.deletePost(postId)
    return { success: true }
  }
}

export const postService = new PostService()
