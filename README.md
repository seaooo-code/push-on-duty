# 值班推送系统

一个基于 Next.js 和飞书开放平台的值班管理和推送系统，支持值班计划管理、人员管理、消息模板配置等功能。

## 功能特性

- 🔐 **飞书登录集成** - 使用飞书开放平台进行用户认证
- 📅 **值班计划管理** - 创建和管理值班计划，支持 Cron 表达式定时
- 👥 **人员管理** - 管理值班人员信息
- 📝 **消息模板** - 自定义推送消息模板
- 🎯 **拖拽排序** - 支持拖拽方式调整值班顺序
- 📱 **响应式设计** - 适配移动端和桌面端

## 技术栈

- **前端框架**: Next.js 15 + React 19
- **UI 组件库**: HeroUI
- **状态管理**: Valtio
- **HTTP 客户端**: Alova
- **数据库**: MySQL + Drizzle ORM
- **样式**: Tailwind CSS
- **拖拽功能**: @dnd-kit
- **表单处理**: React Hook Form

## 快速开始

### 环境要求

- Node.js 18+
- Bun (推荐) 或 npm/yarn
- MySQL 数据库

### 安装依赖

```bash
bun install
# 或
npm install
```

### 环境配置

1. 复制环境变量文件：
```bash
cp .env.testing .env
```

2. 配置环境变量：
```bash
# .env
DATABASE_URL=mysql://username:password@localhost:3306/database_name
```

3. 配置飞书应用：
   - 在飞书开放平台创建应用
   - 获取 App ID 并更新 `app/components/header/index.tsx` 中的 `app_id`
   - 配置重定向 URI 为你的域名

### 数据库初始化

```bash
# 生成数据库表结构
bun run generate
```

### 启动开发服务器

```bash
bun dev
# 或
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
app/
├── components/          # 组件目录
│   ├── duty-form/      # 值班表单
│   ├── duty-table/     # 值班表格
│   ├── user-table/     # 用户表格
│   └── ...
├── duty/               # 值班管理页面
├── user/               # 用户管理页面
├── template/           # 模板管理页面
├── api.ts              # API 配置
└── ...
drizzle/                # 数据库相关
├── schema.ts           # 数据库模式
└── ...
```

## 部署

### Docker 部署

```bash
# 构建镜像
docker build -t push-on-duty .

# 运行容器
docker run -p 3000:3000 -e DATABASE_URL="your_database_url" push-on-duty
```

### Vercel 部署

1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量 `DATABASE_URL`
3. 部署

## 配置说明

### 飞书应用配置

1. 在飞书开放平台创建企业自建应用
2. 配置应用权限：
   - `contact:contact.base:readonly`
   - `contact:user.base:readonly`
   - `contact:user.email:readonly`
   - `contact:user:search`
3. 设置重定向 URI
4. 获取 App ID 并更新代码中的配置

### 数据库配置

支持 MySQL 数据库，使用 Drizzle ORM 进行数据库操作。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
