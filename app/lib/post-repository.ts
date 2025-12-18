import type { Post, Comment, Repost } from "./types/post-types"

export class PostRepository {
  private readonly STORAGE_KEY = "allPosts"

  // 获取所有帖子
  findAll(): Post[] {
    const data = localStorage.getItem(this.STORAGE_KEY)
    return data ? JSON.parse(data) : []
  }

  // 根据ID查找帖子
  findById(postId: string): Post | null {
    const posts = this.findAll()
    return posts.find((p) => p.id === postId) || null
  }

  // 保存帖子
  save(post: Post): void {
    const posts = this.findAll()
    const index = posts.findIndex((p) => p.id === post.id)

    if (index >= 0) {
      posts[index] = post
    } else {
      posts.unshift(post)
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(posts))
  }

  // 删除帖子
  delete(postId: string): void {
    const posts = this.findAll()
    const filtered = posts.filter((p) => p.id !== postId)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
  }

  // 获取用户的帖子
  findByAuthor(authorId: string): Post[] {
    return this.findAll().filter((p) => p.authorId === authorId)
  }

  // 获取好友的帖子（用于Feed）
  findByAuthors(authorIds: string[]): Post[] {
    return this.findAll()
      .filter((p) => authorIds.includes(p.authorId))
      .sort((a, b) => b.createdAt - a.createdAt)
  }

  // 添加转发记录
  addRepost(postId: string, repost: Repost): void {
    const post = this.findById(postId)
    if (post) {
      post.reposts.push(repost)
      this.save(post)
    }
  }

  // 获取直接转发
  findDirectReposts(postId: string): Post[] {
    return this.findAll().filter((p) => p.parentRepostId === postId)
  }

  // 分页获取转发
  findRepostsPaginated(
    postId: string,
    page: number,
    pageSize: number,
  ): {
    reposts: Repost[]
    hasMore: boolean
    total: number
  } {
    const post = this.findById(postId)
    if (!post) {
      return { reposts: [], hasMore: false, total: 0 }
    }

    const total = post.reposts.length
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const reposts = post.reposts.slice(start, end)

    return {
      reposts,
      hasMore: end < total,
      total,
    }
  }

  // 添加评论
  addComment(postId: string, comment: Comment): void {
    const post = this.findById(postId)
    if (post) {
      post.comments.push(comment)
      this.save(post)
    }
  }

  // 切换点赞
  toggleLike(postId: string, userId: string): void {
    const post = this.findById(postId)
    if (post) {
      const index = post.likes.indexOf(userId)
      if (index >= 0) {
        post.likes.splice(index, 1)
      } else {
        post.likes.push(userId)
      }
      this.save(post)
    }
  }
}
