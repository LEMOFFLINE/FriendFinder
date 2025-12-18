# 测试用户指南

## 如何创建测试用户

### 方法1：使用脚本（推荐）

1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 复制粘贴 `scripts/create-test-users.ts` 中的全部代码
4. 按回车运行
5. 刷新页面

这将创建5个测试用户：
- Sarah Chen (sarah@test.com)
- James Wilson (james@test.com)
- Emma Rodriguez (emma@test.com)
- Michael Brown (michael@test.com)
- Olivia Taylor (olivia@test.com)

所有测试账号密码都是：`Test123`

### 方法2：手动注册

在注册页面手动创建账号，需要提供：
- 姓名
- 邮箱
- 密码
- 年龄
- 位置
- 至少3个兴趣标签

## 当前架构 vs 生产架构

### 当前架构（开发阶段）
\`\`\`
客户端 localStorage
  ↓
所有数据存储在浏览器
  ↓
匹配算法在客户端运行
\`\`\`

**优点：**
- 快速开发和测试
- 无需服务器
- 立即看到效果

**缺点：**
- 数据不共享（每个浏览器独立）
- 刷新localStorage会丢失数据
- 无法真正"匹配"不同用户

### 生产架构（部署后）
\`\`\`
客户端
  ↓ HTTP Request
API 路由（/api/discover）
  ↓
服务器计算匹配分数
  ↓
数据库查询（PostgreSQL/MongoDB）
  ↓ HTTP Response
客户端显示结果
\`\`\`

**优点：**
- 数据持久化
- 真正的多用户系统
- 服务器端安全验证
- 复杂算法不暴露给客户端

## 主流App的技术选择

### 社交应用（Tinder, Bumble）
- **架构**：RESTful API + WebSocket
- **匹配算法**：服务器端（保密）
- **推荐**：预加载10-20个用户
- **消息**：WebSocket实时通信

### 职业社交（LinkedIn）
- **架构**：GraphQL API
- **推荐**：AI驱动的服务器端算法
- **预加载**：滚动加载，每次5-10个

### 约会应用（Hinge）
- **架构**：RESTful + Push Notifications
- **匹配**：服务器端ML模型
- **策略**：限制每日推荐数量（稀缺性）

## 负载平衡最佳实践

### 服务器端应该做什么
1. **匹配算法计算**
   - 复杂的相似度计算
   - AI/ML模型推理
   - 访问完整用户数据库

2. **数据过滤和排序**
   - 根据地理位置过滤
   - 根据匹配分数排序
   - 应用用户偏好设置

3. **安全和验证**
   - 用户认证
   - 权限检查
   - 敏感数据保护

### 客户端应该做什么
1. **UI渲染和交互**
   - 卡片滑动动画
   - 用户输入处理
   - 本地状态管理

2. **缓存管理**
   - 缓存已加载的用户
   - 预加载下一批数据
   - 管理图片缓存

3. **简单的客户端过滤**
   - 已查看过的用户
   - 本地偏好设置
   - UI过滤（不影响数据）

## Discover页面的推荐策略

### 批量加载（Batch Loading）
\`\`\`typescript
// 首次加载
GET /api/discover?limit=10&offset=0
// 返回：用户1-10

// 用户查看到第8个
GET /api/discover?limit=10&offset=10
// 预加载：用户11-20

// 无缝体验
\`\`\`

### 匹配分数计算
\`\`\`typescript
function calculateMatchScore(user1, user2) {
  // 服务器端运行
  const factors = {
    sharedInterests: 40%,    // 共同兴趣
    locationProximity: 30%,  // 地理位置接近
    ageSimilarity: 20%,      // 年龄相近
    activityLevel: 10%       // 活跃度匹配
  }
  
  return weightedScore;
}
\`\`\`

### 推荐算法
\`\`\`typescript
// 服务器端
function getRecommendations(userId) {
  1. 获取用户资料和偏好
  2. 查询所有可能的匹配
  3. 计算每个用户的匹配分数
  4. 排序（高分优先）
  5. 过滤掉已连接/屏蔽的用户
  6. 返回前N个结果
}
\`\`\`

## 迁移到生产环境

当你部署到服务器时，需要：

1. **设置数据库**（PostgreSQL推荐）
\`\`\`sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  age INTEGER,
  location VARCHAR(100),
  interests TEXT[],
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE connections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  connected_user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, connected_user_id)
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES users(id),
  receiver_id INTEGER REFERENCES users(id),
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);
\`\`\`

2. **实现API路由**
- /api/auth/login
- /api/auth/signup
- /api/discover
- /api/connections
- /api/messages

3. **使用环境变量**
\`\`\`env
DATABASE_URL=postgresql://user:password@localhost:5432/friendfinder
JWT_SECRET=your-secret-key
\`\`\`

4. **更新客户端代码**
将localStorage调用替换为API请求

## 性能优化建议

### 客户端
- 使用图片懒加载
- 实现虚拟滚动
- 缓存API响应（SWR或React Query）
- 使用Service Worker离线缓存

### 服务器端
- 数据库索引优化
- 使用Redis缓存热门数据
- CDN加速静态资源
- 负载均衡（多服务器实例）

## 测试场景

创建测试用户后，你可以：

1. **测试匹配算法**
   - 注册一个新用户
   - 选择与测试用户相同的兴趣
   - 查看匹配分数是否正确

2. **测试消息功能**
   - 连接一个测试用户
   - 发送消息
   - 用另一个浏览器窗口登录测试用户查看消息

3. **测试屏蔽功能**
   - 屏蔽一个用户
   - 确认该用户不再出现在discover页面
   - 测试隐私设置

4. **测试删除功能**
   - 删除一个连接
   - 确认聊天记录被清除
   - 该用户重新出现在discover页面
