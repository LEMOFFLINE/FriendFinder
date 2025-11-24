# FriendFinder - 社交连接应用

一个帮助人们基于共同兴趣建立友谊的Web应用。

## 功能特性

- 用户注册和认证
- 基于兴趣的智能匹配算法
- 实时消息系统
- 隐私和安全设置
- 响应式设计（支持手机和桌面）
- PWA支持（可安装到手机主屏幕）

## 技术栈

- **前端**: Next.js 15, React 18, TypeScript
- **样式**: Tailwind CSS
- **状态管理**: React Hooks + localStorage（开发阶段）
- **未来后端**: Node.js + PostgreSQL

## 快速开始

### 安装依赖
\`\`\`bash
npm install
\`\`\`

### 启动开发服务器
\`\`\`bash
npm run dev
\`\`\`

访问 http://localhost:3000

### 创建测试用户

参见 `docs/TEST_USERS_GUIDE.md` 了解如何快速创建测试用户。

## 项目结构

\`\`\`
.
├── app/                    # Next.js App Router
│   ├── page.tsx           # 首页
│   ├── signup/            # 注册页面
│   ├── login/             # 登录页面
│   ├── discover/          # 发现新朋友
│   ├── matches/           # 已连接的朋友
│   ├── messages/          # 消息功能
│   ├── profile/           # 个人资料
│   ├── privacy/           # 隐私设置
│   └── api/               # API路由（预留）
├── components/            # 可复用组件
├── scripts/               # 工具脚本
├── docs/                  # 文档
└── public/                # 静态资源
\`\`\`

## 开发指南

### 当前架构（localStorage）

当前使用localStorage存储数据，适合：
- 快速原型开发
- 功能测试
- UI/UX迭代

### 数据结构

\`\`\`typescript
// localStorage.user - 当前登录用户
{
  id: string,
  name: string,
  email: string,
  age: string,
  location: string,
  interests: string[],
  bio: string
}

// localStorage.allUsers - 所有注册用户
User[]

// localStorage.connections - 当前用户的连接
User[]

// localStorage.messages_[userId]_[otherUserId] - 聊天记录
Message[]
\`\`\`

## 部署到生产环境

参见 `docs/TEST_USERS_GUIDE.md` 中的"迁移到生产环境"章节。

## 团队协作建议

1. 使用Git进行版本控制
2. 功能分支开发（feature branches）
3. 代码审查（Pull Requests）
4. 定期同步进度

## 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## License

MIT License
