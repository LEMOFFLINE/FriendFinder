# PostgreSQL 数据库设置指南

## 本地开发环境设置

### 1. 安装 PostgreSQL

#### macOS
\`\`\`bash
brew install postgresql@15
brew services start postgresql@15
\`\`\`

#### Ubuntu/Debian
\`\`\`bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
\`\`\`

#### Windows
下载并安装 PostgreSQL: https://www.postgresql.org/download/windows/

### 2. 创建数据库

\`\`\`bash
# 连接到 PostgreSQL
psql postgres

# 创建数据库
CREATE DATABASE friendfinder;

# 创建用户（可选）
CREATE USER friendfinder_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE friendfinder TO friendfinder_user;

# 退出
\q
\`\`\`

### 3. 配置环境变量

复制 `.env.local.example` 到 `.env.local`:

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

编辑 `.env.local` 文件，设置数据库连接:

\`\`\`env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/friendfinder
\`\`\`

### 4. 安装依赖

\`\`\`bash
npm install
\`\`\`

这会安装 `pg` (PostgreSQL客户端) 和其他必需的依赖。

### 5. 初始化数据库

运行初始化脚本来创建所有表、索引和函数:

\`\`\`bash
# 运行所有设置脚本
npm run db:setup
\`\`\`

或者分步执行:

\`\`\`bash
# 1. 创建表和索引
npm run db:init

# 2. 创建业务函数
npm run db:functions

# 3. 添加测试数据
npm run db:seed
\`\`\`

### 6. 验证设置

连接到数据库并检查表:

\`\`\`bash
psql friendfinder

# 查看所有表
\dt

# 查看用户
SELECT * FROM users;

# 查看帖子
SELECT * FROM posts;

# 退出
\q
\`\`\`

## 数据库架构

### 核心表

- **users** - 用户信息
- **user_interests** - 用户兴趣
- **friendships** - 好友关系
- **posts** - 帖子（支持转发）
- **comments** - 评论（两级结构）
- **likes** - 点赞（统一管理帖子和评论）
- **reposts** - 转发记录
- **notifications** - 通知

### 关键特性

1. **UUID 主键**: 使用 PostgreSQL 的 `gen_random_uuid()` 生成
2. **两级评论**: 主评论 + 回复（不支持多层嵌套）
3. **转发树**: 支持多层转发，记录深度和根帖子
4. **热度算法**: 基于时间衰减和互动权重的 Feed 排序
5. **软删除**: 帖子和评论使用软删除（`is_deleted` 标志）

## 业务函数

### 1. 创建评论

\`\`\`sql
SELECT create_comment(
  'post-uuid'::UUID,           -- 帖子ID
  'user-uuid'::UUID,           -- 用户ID
  '评论内容',                   -- 内容
  NULL,                         -- 父评论ID（NULL表示主评论）
  ARRAY[]::TEXT[]              -- 图片URLs
);
\`\`\`

### 2. 点赞/取消点赞

\`\`\`sql
SELECT toggle_like(
  'user-uuid'::UUID,           -- 用户ID
  'post'::target_type,         -- 目标类型（'post' 或 'comment'）
  'target-uuid'::UUID          -- 目标ID
);
\`\`\`

### 3. 创建转发

\`\`\`sql
SELECT create_repost(
  'user-uuid'::UUID,           -- 用户ID
  'original-post-uuid'::UUID,  -- 原帖子ID
  '转发评论',                   -- 转发时的评论
  ARRAY[]::TEXT[]              -- 图片URLs
);
\`\`\`

### 4. 获取用户Feed

\`\`\`sql
SELECT * FROM get_user_feed(
  'user-uuid'::UUID,           -- 用户ID
  20,                          -- 限制数量
  0                            -- 偏移量
);
\`\`\`

## 测试数据

初始测试数据包括：

- 5个测试用户（Alice, Bob, Carol, David, Emma）
- 多个兴趣标签
- 好友关系
- 帖子、评论、点赞

### 测试用户登录信息

| 用户  | 邮箱             | 密码哈希                      |
|------|-----------------|------------------------------|
| Alice | alice@test.com  | $2a$10$dummy.hash.alice  |
| Bob   | bob@test.com    | $2a$10$dummy.hash.bob    |
| Carol | carol@test.com  | $2a$10$dummy.hash.carol  |
| David | david@test.com  | $2a$10$dummy.hash.david  |
| Emma  | emma@test.com   | $2a$10$dummy.hash.emma   |

## 性能优化

### 索引策略

- 所有主键自动创建索引
- 外键字段创建索引
- 查询频繁的字段组合创建复合索引
- 使用 `CONCURRENTLY` 创建索引避免锁表

### 查询优化

1. 使用 `WHERE is_deleted = false` 过滤软删除记录
2. Feed 查询使用 `hot_score` 和 `created_at` 排序
3. 好友关系查询使用双向索引
4. 通知查询限制50条避免过载

## 常用查询

### 查看用户的所有好友

\`\`\`sql
SELECT u.name, u.email, f.status
FROM friendships f
JOIN users u ON (
  CASE 
    WHEN f.user_id = 'your-user-uuid' THEN u.user_id = f.friend_id
    ELSE u.user_id = f.user_id
  END
)
WHERE (f.user_id = 'your-user-uuid' OR f.friend_id = 'your-user-uuid')
AND f.status = 'accepted';
\`\`\`

### 查看帖子的所有评论（包括回复）

\`\`\`sql
WITH main_comments AS (
  SELECT * FROM comments 
  WHERE post_id = 'post-uuid' AND parent_comment_id IS NULL AND is_deleted = false
),
replies AS (
  SELECT c.*, mc.comment_id as parent_main_comment
  FROM comments c
  JOIN main_comments mc ON c.parent_comment_id = mc.comment_id
  WHERE c.is_deleted = false
)
SELECT * FROM main_comments
UNION ALL
SELECT * FROM replies
ORDER BY created_at ASC;
\`\`\`

### 更新所有帖子的热度分数

\`\`\`sql
SELECT update_post_hot_score(post_id) 
FROM posts 
WHERE is_deleted = false;
\`\`\`

## 故障排查

### 连接失败

1. 检查 PostgreSQL 是否运行: `pg_isready`
2. 检查 `.env.local` 中的连接字符串
3. 验证用户名和密码
4. 检查防火墙设置

### 权限错误

\`\`\`sql
-- 授予所有权限
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
\`\`\`

### 重置数据库

\`\`\`bash
# 删除所有表
psql friendfinder -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# 重新初始化
npm run db:setup
\`\`\`

## 下一步

1. ✓ 数据库设置完成
2. 更新 `lib/database/client.ts` 切换到 PostgreSQL
3. 测试所有页面功能
4. 部署到阿里云服务器
