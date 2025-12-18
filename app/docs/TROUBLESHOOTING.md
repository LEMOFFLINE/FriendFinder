# 数据库连接问题排查指南

## 问题：client password must be a string

这个错误通常由以下原因引起：

### 原因1：.env.local文件不存在或配置错误

**解决方法：**
1. 确保项目根目录有 `.env.local` 文件
2. 复制 `.env.local.example` 的内容到 `.env.local`
3. 替换 `YOUR_PASSWORD` 为你的实际密码

\`\`\`bash
# 在项目根目录
copy .env.local.example .env.local  # Windows
# 或
cp .env.local.example .env.local    # Linux/Mac
\`\`\`

### 原因2：密码包含特殊字符

如果你的PostgreSQL密码包含特殊字符（如 @, :, /, ?, # 等），需要进行URL编码。

**常见特殊字符编码：**
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`
- `#` → `%23`

**示例：**
\`\`\`
原密码: p@ss:word
编码后: p%40ss%3Aword
DATABASE_URL=postgresql://postgres:p%40ss%3Aword@localhost:5432/friendfinder
\`\`\`

### 原因3：密码为空

确保你在安装PostgreSQL时设置了密码，并且正确填写在DATABASE_URL中。

**检查步骤：**
\`\`\`bash
# 1. 运行诊断脚本
npm run db:check

# 如果提示密码错误，重置PostgreSQL密码：
# 使用pgAdmin或命令行重置
\`\`\`

## 问题：无法连接到数据库

### 检查PostgreSQL服务是否运行

**Windows:**
\`\`\`cmd
# 检查服务状态
sc query postgresql-x64-17

# 启动服务
sc start postgresql-x64-17
\`\`\`

**或使用Services管理器：**
1. Win + R → `services.msc`
2. 找到 `postgresql-x64-17`
3. 右键 → 启动

### 检查端口5432是否被占用

\`\`\`cmd
netstat -ano | findstr :5432
\`\`\`

## 完整诊断流程

运行以下命令检查所有配置：

\`\`\`bash
# 1. 检查环境变量和连接
npm run db:check

# 2. 如果连接成功但数据库为空，初始化数据库
npm run db:setup

# 3. 验证数据库表是否创建成功
npm run db:verify
\`\`\`

## 常见配置示例

### 本地开发（Windows）
\`\`\`env
DATABASE_URL=postgresql://postgres:你的密码@localhost:5432/friendfinder
\`\`\`

### 本地开发（使用默认密码）
\`\`\`env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/friendfinder
\`\`\`

### 密码包含特殊字符
\`\`\`env
# 原密码: Pass@123!
DATABASE_URL=postgresql://postgres:Pass%40123%21@localhost:5432/friendfinder
