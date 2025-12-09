# 数据库初始化指南

## 前提条件

1. PostgreSQL 17 已安装并运行
2. 环境变量已配置（.env.local文件中的DATABASE_URL）
3. npm依赖已安装

## 初始化步骤

### 方法1：一键初始化（推荐）

在项目根目录运行：

\`\`\`bash
npm run db:setup
\`\`\`

这会自动执行：
1. 创建所有表和索引（001_init_database.sql）
2. 创建业务函数（002_create_functions.sql）
3. 插入测试数据（003_seed_test_data.sql）

### 方法2：分步执行

如果需要分步控制，可以单独运行：

\`\`\`bash
# 1. 创建数据库结构
npm run db:init

# 2. 创建业务函数
npm run db:functions

# 3. 插入测试数据（可选）
npm run db:seed
\`\`\`

## 验证安装

运行以下命令验证数据库是否正确初始化：

\`\`\`bash
psql -U postgres -d friendfinder -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
\`\`\`

应该看到以下表：
- users
- user_interests
- friendships
- posts
- comments
- likes
- reposts
- notifications

## 测试数据

初始化后会自动创建5个测试用户：
- alice@example.com (密码: password123)
- bob@example.com (密码: password123)
- carol@example.com (密码: password123)
- david@example.com (密码: password123)
- emma@example.com (密码: password123)

## 重置数据库

如果需要重置数据库：

\`\`\`bash
# 删除所有表
psql -U postgres -d friendfinder -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# 重新初始化
npm run db:setup
\`\`\`

## 环境变量配置

确保 .env.local 文件包含：

\`\`\`env
DATABASE_URL=postgresql://postgres:你的密码@localhost:5432/friendfinder
\`\`\`

## 故障排除

### 连接失败
- 检查PostgreSQL服务是否运行
- 验证DATABASE_URL中的密码和端口
- 确认防火墙允许5432端口

### 权限错误
- 确保postgres用户有创建表的权限
- 尝试以管理员身份运行psql

### UUID扩展错误
如果遇到gen_random_uuid()错误，手动启用扩展：

\`\`\`sql
psql -U postgres -d friendfinder -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
