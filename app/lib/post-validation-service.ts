import type { PostingLimits } from "./types/post-types"

class PostValidationService {
  private static readonly LIMITS: PostingLimits = {
    maxPostCharacters: 1000,
    maxPostImages: 9,
    maxCommentCharacters: 500,
    maxCommentImages: 3,
    maxRepostCharacters: 300,
    maxRepostImages: 3,
    maxRepostDepth: 10,
    postFoldLines: 10,
    commentFoldLines: 3,
    repostFoldLines: 2,
  }

  // 验证帖子内容
  static validatePost(content: string, images: string[]): { isValid: boolean; error?: string } {
    if (content.length > this.LIMITS.maxPostCharacters) {
      return {
        isValid: false,
        error: `帖子内容不能超过${this.LIMITS.maxPostCharacters}字符`,
      }
    }

    if (images.length > this.LIMITS.maxPostImages) {
      return {
        isValid: false,
        error: `帖子图片不能超过${this.LIMITS.maxPostImages}张`,
      }
    }

    return { isValid: true }
  }

  // 验证评论内容
  static validateComment(content: string, images: string[]): { isValid: boolean; error?: string } {
    if (content.length > this.LIMITS.maxCommentCharacters) {
      return {
        isValid: false,
        error: `评论内容不能超过${this.LIMITS.maxCommentCharacters}字符`,
      }
    }

    if (images.length > this.LIMITS.maxCommentImages) {
      return {
        isValid: false,
        error: `评论图片不能超过${this.LIMITS.maxCommentImages}张`,
      }
    }

    return { isValid: true }
  }

  // 验证转发内容
  static validateRepost(content: string, images: string[]): { isValid: boolean; error?: string } {
    if (content.length > this.LIMITS.maxRepostCharacters) {
      return {
        isValid: false,
        error: `转发评论不能超过${this.LIMITS.maxRepostCharacters}字符`,
      }
    }

    if (images.length > this.LIMITS.maxRepostImages) {
      return {
        isValid: false,
        error: `转发图片不能超过${this.LIMITS.maxRepostImages}张`,
      }
    }

    return { isValid: true }
  }

  // 检查是否需要折叠
  static shouldFoldContent(content: string, type: "post" | "comment" | "repost"): boolean {
    const lines = content.split("\n").length
    switch (type) {
      case "post":
        return lines > this.LIMITS.postFoldLines
      case "comment":
        return lines > this.LIMITS.commentFoldLines
      case "repost":
        return lines > this.LIMITS.repostFoldLines
      default:
        return false
    }
  }

  static getLimits(): PostingLimits {
    return { ...this.LIMITS }
  }
}

export default PostValidationService
