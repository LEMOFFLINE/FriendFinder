# FriendFinder 数据库快速设置指南

## 第一步：创建数据库

打开pgAdmin 4（安装PostgreSQL时自动安装的图形界面工具）：

1. 启动pgAdmin 4
2. 连接到PostgreSQL 17服务器（输入你的密码）
3. 右键点击"Databases"
4. 选择"Create" → "Database"
5. 在"Database"字段输入：`friendfinder`
6. 点击"Save"

## 第二步：配置环境变量

运行交互式配置工具：

\`\`\`cmd
npm run db:setup-env
\`\`\`

这个工具会问你几个问题，然后自动创建.env.local文件，并处理密码中的特殊字符。

按照提示输入：
- Database host: 直接回车（使用默认localhost）
- Database port: 直接回车（使用默认5432）
- Database user: 直接回车（使用默认postgres）
- Database password: 输入你的PostgreSQL密码
- Database name: 直接回车（使用默认friendfinder）

## 第三步：验证配置

\`\`\`cmd
npm run db:check
\`\`\`

如果看到"Connection successful"和"PostgreSQL version"，说明配置正确。

## 第四步：初始化数据库

\`\`\`cmd
npm run db:setup
\`\`\`

这会创建所有表、索引、函数和测试数据。

## 第五步：验证数据库

\`\`\`cmd
npm run db:verify
\`\`\`

应该看到所有表都创建成功，并且有测试数据。

## 常见问题

### 问题1：密码包含特殊字符导致连接失败

**症状：** "client password must be a string"

**解决：** 使用 `npm run db:setup-env` 工具会自动处理特殊字符编码

### 问题2：psql字符编码错误

**症状：** "character with byte sequence 0xe9... has no equivalent"

**解决：** 不要使用psql命令行，使用pgAdmin 4图形界面创建数据库

### 问题3：数据库不存在

**症状：** "database friendfinder does not exist"

**解决：** 返回第一步，用pgAdmin 4创建friendfinder数据库

## 完整命令流程

\`\`\`cmd
# 1. 配置环境变量（交互式）
npm run db:setup-env

# 2. 验证配置
npm run db:check

# 3. 初始化数据库（创建表和数据）
npm run db:setup

# 4. 验证数据库
npm run db:verify

# 5. 启动开发服务器
npm run dev
\`\`\`

## 测试用户

数据库初始化后会创建5个测试用户：

- john@example.com / password123
- jane@example.com / password123
- bob@example.com / password123
- alice@example.com / password123
- charlie@example.com / password123

可以用这些账号登录测试。
