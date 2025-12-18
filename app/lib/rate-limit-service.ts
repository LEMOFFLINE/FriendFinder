class RateLimitService {
  private static readonly RATE_LIMITS = {
    post: { limit: 30, windowMs: 60 * 60 * 1000 }, // 30条/小时
    comment: { limit: 60, windowMs: 60 * 60 * 1000 }, // 60条/小时
    repost: { limit: 100, windowMs: 60 * 60 * 1000 }, // 100条/小时
  }

  private userActivity: Map<string, Map<string, number[]>> = new Map()

  // 检查是否超过频率限制
  checkRateLimit(
    userId: string,
    action: "post" | "comment" | "repost",
  ): {
    allowed: boolean
    remaining: number
    resetTime: number
  } {
    const limitConfig = this.RATE_LIMITS[action]
    const now = Date.now()
    const windowStart = now - limitConfig.windowMs

    // 获取用户的活动记录
    if (!this.userActivity.has(userId)) {
      this.userActivity.set(userId, new Map())
    }
    const userActions = this.userActivity.get(userId)!

    if (!userActions.has(action)) {
      userActions.set(action, [])
    }
    const actionTimestamps = userActions.get(action)!

    // 清理过期的记录
    const validTimestamps = actionTimestamps.filter((timestamp) => timestamp > windowStart)
    userActions.set(action, validTimestamps)

    const currentCount = validTimestamps.length
    const remaining = Math.max(0, limitConfig.limit - currentCount)
    const resetTime = now + (validTimestamps[0] ? validTimestamps[0] + limitConfig.windowMs - now : 0)

    return {
      allowed: currentCount < limitConfig.limit,
      remaining,
      resetTime,
    }
  }

  // 记录用户活动
  recordActivity(userId: string, action: "post" | "comment" | "repost"): void {
    if (!this.userActivity.has(userId)) {
      this.userActivity.set(userId, new Map())
    }
    const userActions = this.userActivity.get(userId)!

    if (!userActions.has(action)) {
      userActions.set(action, [])
    }
    const actionTimestamps = userActions.get(action)!

    actionTimestamps.push(Date.now())
  }
}

export default RateLimitService
