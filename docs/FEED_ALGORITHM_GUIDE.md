# Social Media Feed 算法指南

## Feed 算法概述

社交媒体的 Feed 算法是推荐系统的核心，决定用户看到什么内容。虽然各平台算法细节不同，但核心逻辑大同小异。

---

## 主流 Feed 算法类型

### 1. 时间序列 Feed (Chronological)

**代表平台：** Twitter (可选), Mastodon

**逻辑：**
\`\`\`
按时间倒序显示所有好友的帖子
最新的帖子显示在最上面
\`\`\`

**优点：**
- 实现简单
- 透明公平
- 实时性强

**缺点：**
- 容易错过重要内容
- 高频发帖者占据 Feed
- 用户体验不够个性化

**实现伪代码：**
\`\`\`typescript
function getTimelineFeed(userId: string): Post[] {
  const user = getUser(userId);
  const friends = user.connectedUsers;
  
  // 获取所有好友的帖子
  const posts = [];
  for (const friendId of friends) {
    const friendPosts = getPostsByUser(friendId);
    posts.push(...friendPosts);
  }
  
  // 按时间倒序排序
  posts.sort((a, b) => b.createdAt - a.createdAt);
  
  return posts;
}
\`\`\`

---

### 2. 算法排序 Feed (Algorithmic)

**代表平台：** Facebook, Instagram, TikTok, LinkedIn

**逻辑：**
\`\`\`
1. 获取候选帖子（好友+推荐）
2. 计算每个帖子的"得分"
3. 按得分排序
4. 返回前 N 个帖子
\`\`\`

**得分计算因素：**
- **时间新鲜度：** 越新得分越高，但随时间衰减
- **互动热度：** 点赞、评论、分享数量
- **个人偏好：** 用户过去互动过的内容类型
- **关系强度：** 与好友的互动频率
- **内容类型：** 图片、视频、文字权重不同

**实现伪代码：**
\`\`\`typescript
function getAlgorithmicFeed(userId: string): Post[] {
  const user = getUser(userId);
  const posts = getCandidatePosts(userId);
  
  // 为每个帖子计算得分
  const scoredPosts = posts.map(post => ({
    post,
    score: calculateScore(post, user)
  }));
  
  // 按得分排序
  scoredPosts.sort((a, b) => b.score - a.score);
  
  return scoredPosts.map(item => item.post);
}

function calculateScore(post: Post, user: User): number {
  const timeScore = getTimeScore(post.createdAt);
  const engagementScore = getEngagementScore(post);
  const relationshipScore = getRelationshipScore(post.authorId, user);
  const personalScore = getPersonalScore(post, user);
  
  // 加权求和
  return (
    timeScore * 0.3 +
    engagementScore * 0.3 +
    relationshipScore * 0.2 +
    personalScore * 0.2
  );
}
\`\`\`

---

### 3. 混合 Feed (Hybrid)

**代表平台：** Twitter (现在的 X), Reddit

**逻辑：**
\`\`\`
时间序列 + 算法推荐的混合
- 主要按时间排序
- 穿插推荐的热门内容
\`\`\`

---

## 低成本实现方案

对于课程项目，我们采用**简化的算法排序 Feed**，平衡功能和开发成本。

### 阶段 1：基础时间序列 (Week 1-2)

最简单的实现，快速上线。

\`\`\`typescript
// app/api/feed/route.ts
export async function GET(request: Request) {
  const userId = getCurrentUserId(request);
  const user = await db.getUser(userId);
  
  // 获取所有好友的帖子
  const friendIds = user.connectedUsers;
  const allPosts: Post[] = [];
  
  for (const friendId of friendIds) {
    const posts = await db.getPostsByUser(friendId);
    allPosts.push(...posts);
  }
  
  // 按时间倒序排序
  allPosts.sort((a, b) => b.createdAt - a.createdAt);
  
  // 分页返回
  const page = parseInt(request.url.searchParams.get('page') || '1');
  const pageSize = 20;
  const startIndex = (page - 1) * pageSize;
  
  return Response.json({
    posts: allPosts.slice(startIndex, startIndex + pageSize),
    hasMore: startIndex + pageSize < allPosts.length
  });
}
\`\`\`

**优点：** 实现简单，1-2天完成
**缺点：** 用户体验一般

---

### 阶段 2：加入热度排序 (Week 3-4)

考虑帖子的互动数据。

\`\`\`typescript
function calculatePostScore(post: Post): number {
  const now = Date.now();
  const ageInHours = (now - post.createdAt) / (1000 * 60 * 60);
  
  // 时间衰减：越新越好，但衰减速度适中
  const timeScore = Math.pow(0.95, ageInHours);
  
  // 互动分数：点赞和评论的加权
  const engagementScore = post.likes.length * 1 + post.commentCount * 2;
  
  // 综合得分
  return timeScore * 100 + engagementScore;
}

// 使用
allPosts.sort((a, b) => {
  return calculatePostScore(b) - calculatePostScore(a);
});
\`\`\`

**时间衰减公式解释：**
- `Math.pow(0.95, ageInHours)` 
- 1小时前的帖子：得分 95分
- 6小时前的帖子：得分 74分
- 24小时前的帖子：得分 29分
- 48小时前的帖子：得分 8分

---

### 阶段 3：个性化推荐 (Week 5-6, 可选)

根据用户兴趣调整得分。

\`\`\`typescript
function calculatePersonalizedScore(post: Post, user: User): number {
  const baseScore = calculatePostScore(post);
  
  // 作者与用户的兴趣匹配度
  const author = db.getUser(post.authorId);
  const commonInterests = user.interests.filter(
    interest => author.interests.includes(interest)
  );
  const interestBonus = commonInterests.length * 10;
  
  // 用户过去互动过的作者（关系强度）
  const hasInteractedBefore = checkPastInteraction(user.id, post.authorId);
  const relationshipBonus = hasInteractedBefore ? 20 : 0;
  
  return baseScore + interestBonus + relationshipBonus;
}
\`\`\`

---

## 性能优化策略

### 1. 分页加载

不要一次加载所有帖子，使用分页。

\`\`\`typescript
// 客户端
const [posts, setPosts] = useState<Post[]>([]);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

async function loadMorePosts() {
  const response = await fetch(`/api/feed?page=${page}`);
  const data = await response.json();
  
  setPosts([...posts, ...data.posts]);
  setHasMore(data.hasMore);
  setPage(page + 1);
}
\`\`\`

### 2. 缓存计算结果

\`\`\`typescript
// 服务器端缓存
const feedCache = new Map<string, { posts: Post[], timestamp: number }>();

function getCachedFeed(userId: string): Post[] | null {
  const cached = feedCache.get(userId);
  if (!cached) return null;
  
  // 缓存5分钟
  const isExpired = Date.now() - cached.timestamp > 5 * 60 * 1000;
  if (isExpired) {
    feedCache.delete(userId);
    return null;
  }
  
  return cached.posts;
}
\`\`\`

### 3. 懒加载和虚拟滚动

对于前端，使用 `react-window` 或 `react-virtualized` 实现虚拟滚动，只渲染可见的帖子。

---

## 推荐的最终实现

对于你的项目，建议采用**阶段2的实现**（时间 + 热度）：

\`\`\`typescript
// lib/feed-algorithm.ts
export function generateFeed(userId: string, page: number = 1): Post[] {
  const user = db.getUser(userId);
  const pageSize = 20;
  
  // 1. 获取候选帖子（好友的帖子）
  const candidatePosts = [];
  for (const friendId of user.connectedUsers) {
    const posts = db.getPostsByUser(friendId, { 
      limit: 50, // 限制每个好友最多50条
      visibility: ['everyone', 'friends'] 
    });
    candidatePosts.push(...posts);
  }
  
  // 2. 过滤掉已屏蔽用户的帖子
  const filteredPosts = candidatePosts.filter(
    post => !user.blockedUsers.includes(post.authorId)
  );
  
  // 3. 计算得分并排序
  const scoredPosts = filteredPosts.map(post => ({
    post,
    score: calculateHybridScore(post, user)
  }));
  
  scoredPosts.sort((a, b) => b.score - a.score);
  
  // 4. 分页返回
  const startIndex = (page - 1) * pageSize;
  return scoredPosts
    .slice(startIndex, startIndex + pageSize)
    .map(item => item.post);
}

function calculateHybridScore(post: Post, user: User): number {
  const now = Date.now();
  const ageInHours = (now - post.createdAt) / (1000 * 60 * 60);
  
  // 时间得分（指数衰减）
  const timeScore = Math.pow(0.95, ageInHours) * 100;
  
  // 互动得分
  const likeScore = post.likes.length * 1;
  const commentScore = post.commentCount * 2;
  const engagementScore = likeScore + commentScore;
  
  // 兴趣匹配得分（可选）
  const author = db.getUser(post.authorId);
  const commonInterests = user.interests.filter(
    i => author.interests.includes(i)
  ).length;
  const interestScore = commonInterests * 5;
  
  // 综合得分
  return timeScore + engagementScore + interestScore;
}
\`\`\`

---

## 测试和调优

### 测试数据生成

创建多样化的测试帖子：

\`\`\`typescript
// 脚本：生成测试帖子
function generateTestPosts() {
  const users = getAllUsers();
  const now = Date.now();
  
  for (let i = 0; i < 100; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const hoursAgo = Math.random() * 48; // 0-48小时前
    
    createPost({
      authorId: randomUser.id,
      content: `测试帖子 #${i}`,
      images: [],
      likes: generateRandomLikes(users, Math.floor(Math.random() * 20)),
      commentCount: Math.floor(Math.random() * 10),
      createdAt: now - hoursAgo * 60 * 60 * 1000
    });
  }
}
\`\`\`

### 调优参数

根据测试结果调整：

1. **时间衰减速度：** `Math.pow(0.95, ageInHours)` 的 0.95 可以调整
   - 更小（如0.9）：更激进的衰减，更重视新内容
   - 更大（如0.98）：更缓慢的衰减，旧内容也能保持可见

2. **互动权重：** 点赞 vs 评论的权重比
   - 评论通常比点赞重要（2:1 或 3:1）

3. **页面大小：** 每页显示多少帖子
   - 移动端：10-15 条
   - 桌面端：20-30 条

---

## 总结

**推荐实现路径：**
1. **Week 1-2：** 基础时间序列（最简单）
2. **Week 3-4：** 加入热度排序（显著提升体验）
3. **Week 5-6：** 个性化推荐（可选，锦上添花）

**核心原则：**
- 先求有，再求好
- 分页加载，避免性能问题
- 缓存结果，减少计算
- 可配置参数，便于调优

这样的实现可以在**1-2周内完成核心功能**，效果接近主流社交媒体的70-80%，对课程项目完全足够。
