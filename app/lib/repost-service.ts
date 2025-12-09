import type { Post, Repost } from "./types/post-types"
import { PostRepository } from "./post-repository"
import PostValidationService from "./post-validation-service"

class RepostService {
  private postRepository: PostRepository

  constructor() {
    this.postRepository = new PostRepository()
  }

  // 创建转发
  async createRepost(
    originalPostId: string,
    authorId: string,
    content = "",
    images: string[] = [],
  ): Promise<{ success: boolean; repost?: Post; error?: string }> {
    // 验证转发内容
    const validation = PostValidationService.validateRepost(content, images)
    if (!validation.isValid) {
      return { success: false, error: validation.error }
    }

    // 获取原始帖子
    const originalPost = await this.postRepository.findById(originalPostId)
    if (!originalPost) {
      return { success: false, error: "原始帖子不存在" }
    }

    // 检查原始帖子是否允许转发
    if (!originalPost.canBeReposted) {
      return { success: false, error: "该帖子不允许被转发" }
    }

    // 计算转发深度
    const depth = originalPost.type === "original" ? 1 : originalPost.depth + 1

    // 检查深度限制
    if (depth > PostValidationService.getLimits().maxRepostDepth) {
      return { success: false, error: "转发深度已达到限制" }
    }

    // 创建转发帖子
    const repost: Post = {
      id: this.generateId(),
      authorId,
      content,
      images,
      likes: [],
      comments: [],
      reposts: [],
      visibility: "everyone",
      type: "repost",
      originalPostId: originalPost.type === "original" ? originalPost.id : originalPost.originalPostId,
      parentRepostId: originalPost.type === "repost" ? originalPost.id : undefined,
      depth,
      canBeReposted: true, // 方案二：允许转发被再次转发
      // canBeReposted: false, // 方案一：转发不能被再次转发
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    // 保存转发帖子
    await this.postRepository.save(repost)

    // 更新原始帖子的转发列表
    await this.postRepository.addRepost(originalPostId, {
      id: repost.id,
      postId: originalPostId,
      authorId,
      content,
      images,
      createdAt: repost.createdAt,
    })

    return { success: true, repost }
  }

  // 获取转发树（带深度限制）
  async getRepostTree(postId: string, maxDepth = 3): Promise<Post[]> {
    const result: Post[] = []

    const buildTree = async (currentPostId: string, currentDepth: number) => {
      if (currentDepth > maxDepth) return

      const post = await this.postRepository.findById(currentPostId)
      if (!post) return

      result.push(post)

      // 获取该帖子的直接转发
      const reposts = await this.postRepository.findDirectReposts(currentPostId)

      for (const repost of reposts) {
        await buildTree(repost.id, currentDepth + 1)
      }
    }

    await buildTree(postId, 0)
    return result
  }

  // 获取扁平化转发列表（性能优化版本）
  async getRepostList(
    postId: string,
    page = 1,
    pageSize = 20,
  ): Promise<{
    reposts: Repost[]
    hasMore: boolean
    total: number
  }> {
    return await this.postRepository.findRepostsPaginated(postId, page, pageSize)
  }

  private generateId(): string {
    return `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export default RepostService
