# Windows数据库设置指南

## 问题1：解决字符编码错误

在Windows上使用psql时，如果遇到编码错误，用以下方法创建数据库：

### 方法1：使用pgAdmin 4（推荐）

1. 打开pgAdmin 4（安装PostgreSQL时自动安装）
2. 连接到PostgreSQL 17服务器，输入密码
3. 右键"Databases" → "Create" → "Database"
4. 名称填写：`friendfinder`
5. 点击"Save"

### 方法2：修改psql编码

在CMD中执行：
\`\`\`cmd
chcp 65001
psql -U postgres
CREATE DATABASE friendfinder;
\q
\`\`\`

`chcp 65001` 将控制台切换为UTF-8编码。

## 问题2：修复DATABASE_URL配置

.env.local文件格式必须完全正确：

### 正确格式示例

\`\`\`
DATABASE_URL=postgresql://postgres:你的密码@localhost:5432/friendfinder
\`\`\`

### 常见错误

1. **密码包含特殊字符**
   - 如果密码是 `P@ss123`，必须写成 `P%40ss123`
   - 如果密码是 `pass#123`，必须写成 `pass%23123`

2. **格式错误**
   - ❌ 错误：`DATABASE_URL = postgresql://...`（等号两边有空格）
   - ✅ 正确：`DATABASE_URL=postgresql://...`（等号紧贴）

3. **引号问题**
   - ❌ 错误：`DATABASE_URL="postgresql://..."`（不需要引号）
   - ✅ 正确：`DATABASE_URL=postgresql://...`

### 验证配置

创建.env.local后，运行：
\`\`\`cmd
npm run db:check
\`\`\`

应该显示：
\`\`\`
[v0] DATABASE_URL exists: true
[v0] ✓ Successfully parsed connection details
\`\`\`

## 完整步骤

1. **创建数据库**（用pgAdmin 4或上面的方法）

2. **创建.env.local文件**
   - 在项目根目录创建
   - 写入：`DATABASE_URL=postgresql://postgres:你的密码@localhost:5432/friendfinder`
   - 注意密码特殊字符要URL编码

3. **验证配置**
   \`\`\`cmd
   npm run db:check
   \`\`\`

4. **初始化数据库**
   \`\`\`cmd
   npm run db:setup
   \`\`\`

## 特殊字符URL编码对照表

| 字符 | 编码 |
|------|------|
| @    | %40  |
| #    | %23  |
| $    | %24  |
| %    | %25  |
| &    | %26  |
| +    | %2B  |
| /    | %2F  |
| :    | %3A  |
| =    | %3D  |
| ?    | %3F  |

例如：密码 `P@ss#123` → `P%40ss%23123`
\`\`\`

\`\`\`typescript file="" isHidden
