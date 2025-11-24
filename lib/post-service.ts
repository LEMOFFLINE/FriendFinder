import { PostRepository } from "./post-repository"
import type { Post, Comment } from "./types/post-types"

const PostValidationService = {
  validatePost(content: string, images: string[]) {
    if (content.length > 1000) {
      return { isValid: false, error: "帖子内容不能超过1000字符" }
    }
    if (images.length > 9) {
      return { isValid: false, error: "帖子图片不能超过9张" }
    }
    return { isValid: true }
  },
  validateComment(content: string, images: string[]) {
    if (content.length > 500) {
      return { isValid: false, error: "评论内容不能超过500字符" }
    }
    if (images.length > 3) {
      return { isValid: false, error: "评论图片不能超过3张" }
    }
    return { isValid: true }
  },
}

export class PostService {
  private postRepository: PostRepository

  constructor() {
    this.postRepository = new PostRepository()
  }

  // 创建帖子
  createPost(
    userId: string,
    content: string,
    images: string[] = [],
    visibility: "everyone" | "friends" = "everyone",
  ): { success: boolean; post?: Post; error?: string } {
    const validation = PostValidationService.validatePost(content, images)
    if (!validation.isValid) {
      return { success: false, error: validation.error }
    }

    const post: Post = {
      id: this.generateId(),
      authorId: userId,
      content,
      images,
      likes: [],
      comments: [],
      reposts: [],
      visibility,
      type: "original",
      depth: 0,
      canBeReposted: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    this.postRepository.save(post)
    return { success: true, post }
  }

  // 获取Feed（好友的帖子）
  getFeed(userId: string): Post[] {
    const currentUserData = localStorage.getItem("user")
    if (!currentUserData) return []

    const connections = JSON.parse(localStorage.getItem("connections") || "[]")
    const connectedUserIds = connections
      .filter((c: any) => c.status === "accepted" && (c.requesterId === userId || c.receiverId === userId))
      .map((c: any) => (c.requesterId === userId ? c.receiverId : c.requesterId))

    connectedUserIds.push(userId)

    return this.postRepository.findByAuthors(connectedUserIds)
  }

  // 获取用户的帖子
  getUserPosts(userId: string): Post[] {
    return this.postRepository.findByAuthor(userId)
  }

  // 点赞/取消点赞
  toggleLike(postId: string, userId: string): void {
    this.postRepository.toggleLike(postId, userId)
  }

  // 添加评论
  addComment(
    postId: string,
    userId: string,
    content: string,
    images: string[] = [],
  ): { success: boolean; comment?: Comment; error?: string } {
    const validation = PostValidationService.validateComment(content, images)
    if (!validation.isValid) {
      return { success: false, error: validation.error }
    }

    const comment: Comment = {
      id: this.generateId(),
      postId,
      authorId: userId,
      content,
      images,
      createdAt: Date.now(),
    }

    this.postRepository.addComment(postId, comment)
    return { success: true, comment }
  }

  // 删除帖子
  deletePost(postId: string, userId: string): { success: boolean; error?: string } {
    const post = this.postRepository.findById(postId)

    if (!post) {
      return { success: false, error: "帖子不存在" }
    }

    if (post.authorId !== userId) {
      return { success: false, error: "只能删除自己的帖子" }
    }

    this.postRepository.delete(postId)
    return { success: true }
  }

  // 获取单个帖子
  getPost(postId: string): Post | null {
    return this.postRepository.findById(postId)
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
