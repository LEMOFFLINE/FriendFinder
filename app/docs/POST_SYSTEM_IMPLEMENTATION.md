# 帖子系统实现文档

## 已实现功能

### 核心服务

1. **PostValidationService** (`lib/post-validation-service.ts`)
   - 验证帖子内容（最多1000字符，9张图片）
   - 验证评论内容（最多500字符，3张图片）
   - 验证转发内容（最多300字符，3张图片）
   - 内容折叠检测

2. **RateLimitService** (`lib/rate-limit-service.ts`)
   - 发帖频率限制：30条/小时
   - 评论频率限制：60条/小时
   - 转发频率限制：100条/小时

3. **PostRepository** (`lib/post-repository.ts`)
   - 本地存储管理（localStorage）
   - 帖子CRUD操作
   - 评论和点赞管理
   - 转发记录

4. **PostService** (`lib/post-service.ts`)
   - 创建帖子
   - 获取Feed（好友帖子流）
   - 点赞/取消点赞
   - 添加评论
   - 删除帖子

### 用户界面

1. **Feed Page** (`app/feed/page.tsx`)
   - 查看好友帖子流
   - 创建新帖子
   - 点赞和评论
   - 实时评论显示
   - 删除自己的帖子

### 导航更新

所有页面的底部导航已更新，包含四个主要入口：
- Feed - 帖子流
- Discover - 发现新朋友和群组
- Contacts - 联系人列表
- Profile - 个人资料

## 数据结构

### Post 接口
\`\`\`typescript
interface Post {
  id: string;
  authorId: string;
  content: string;
  images: string[];
  likes: string[];
  comments: Comment[];
  reposts: Repost[];
  visibility: 'everyone' | 'friends';
  type: 'original' | 'repost';
  originalPostId?: string;
  parentRepostId?: string;
  depth: number;
  canBeReposted: boolean;
  createdAt: number;
  updatedAt: number;
}
\`\`\`

### Comment 接口
\`\`\`typescript
interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  images: string[];
  createdAt: number;
}
\`\`\`

## 使用指南

### 创建帖子
1. 进入 Feed 页面
2. 在输入框输入内容（最多1000字符）
3. 点击 "Post" 按钮发布

### 查看Feed
- Feed 会显示你和所有好友的帖子
- 按时间倒序排列
- 显示每条帖子的点赞数和评论数

### 互动
- 点击 ❤️ 图标点赞/取消点赞
- 点击 💬 图标展开评论区
- 在评论区输入内容并发送

### 删除帖子
- 只能删除自己的帖子
- 点击帖子右上角的垃圾桶图标
- 确认删除

## 待实现功能

### 高优先级
1. **图片上传**
   - 目前只支持文字帖子
   - 需要实现图片上传和显示
   - 建议使用 IndexedDB 或服务器存储

2. **转发系统**
   - RepostService 已实现但未集成到UI
   - 需要添加转发按钮和转发流程

3. **通知系统**
   - 点赞通知
   - 评论通知
   - 转发通知

### 中优先级
4. **Feed算法优化**
   - 当前只按时间排序
   - 可以加入热度计算（点赞数+评论数+时间衰减）
   - 个性化推荐

5. **帖子详情页**
   - 点击帖子进入详情页
   - 显示完整评论列表
   - 支持评论回复

6. **用户个人页帖子列表**
   - 在Profile页面显示用户的所有帖子
   - 支持筛选和排序

### 低优先级
7. **帖子搜索**
   - 搜索帖子内容
   - 标签搜索

8. **保存/收藏帖子**
   - 用户可以收藏喜欢的帖子
   - 查看收藏列表

9. **分享功能**
   - 分享到其他平台
   - 生成分享链接

## 技术说明

### 数据存储
- 当前使用 localStorage 存储所有数据
- 数据Key：`allPosts` - 存储所有帖子数组
- 适合开发和测试，生产环境建议迁移到数据库

### 性能考虑
- Feed加载所有帖子后在客户端过滤
- 数据量大时可能影响性能
- 建议未来实现分页加载

### 迁移到服务器
需要创建以下API端点：
- `POST /api/posts` - 创建帖子
- `GET /api/posts/feed` - 获取Feed
- `POST /api/posts/:id/like` - 点赞
- `POST /api/posts/:id/comment` - 评论
- `DELETE /api/posts/:id` - 删除帖子

## 测试建议

1. 创建多个测试账号
2. 互相添加好友
3. 发布不同长度的帖子
4. 测试点赞和评论功能
5. 验证删除功能
6. 测试频率限制（快速连续发帖）

## 已知问题

1. 刷新页面后评论区会关闭
2. 没有编辑帖子功能
3. 没有举报功能
4. 图片上传未实现
