# RGZW 后端系统文档

## 项目概述

RGZW 后端系统是基于 Node.js/Express 的 RESTful API 服务，为前端应用提供数据支持和业务逻辑处理。

## 项目结构

```
rgzw_backend/
├── src/
│   ├── models/              # 数据模型和DAO
│   ├── modules/             # 功能模块
│   │   ├── _authorization/  # 认证授权模块
│   │   ├── _organization/   # 组织管理模块
│   │   └── _school/         # 学校管理模块
│   ├── routers/             # 路由配置
│   ├── controllers/         # 控制器
│   ├── services/            # 业务逻辑
│   ├── middlewares/         # 中间件
│   └── utils/               # 工具函数
├── tests/                   # 测试文件
├── scripts/                 # 脚本文件
├── docs/                    # 项目文档
├── CLAUDE.md               # 开发者文档
└── package.json            # 项目配置
```

## API 接口文档

### 认证相关
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/logout` - 用户登出
- `GET /api/auth/refresh-token` - 刷新令牌

### 用户相关
- `POST /api/user/self/` - 获取当前用户信息
- `POST /api/user/list/` - 获取用户列表
- `POST /api/user/add/` - 创建用户
- `POST /api/user/edit/:id` - 编辑用户
- `POST /api/user/detail/:id` - 获取用户详情

### 账户相关
- `POST /api/account/list/` - 获取账户列表
- `POST /api/account/detail/:id` - 获取账户详情
- `POST /api/account/add/` - 创建账户
- `POST /api/account/edit/:id` - 编辑账户
- `POST /api/account/self/` - 获取当前账户信息

### 组织相关
- `POST /api/org/list/` - 获取组织列表
- `POST /api/org/detail/:id` - 获取组织详情
- `POST /api/org/add/` - 创建组织
- `POST /api/org/edit/:id` - 编辑组织
- `POST /api/org/self/` - 获取当前组织信息

### 学员相关
- `POST /api/student/list/` - 获取学员列表
- `POST /api/student/detail/:id` - 获取学员详情
- `POST /api/student/add/` - 创建学员
- `POST /api/student/edit/:id` - 编辑学员

### 课包相关
- `POST /api/pack/list` - 获取课包列表（学生可查全平台 isActive=true）
- `POST /api/pack/detail/:id` - 获取课包详情
- `POST /api/pack/add` - 创建课包
- `POST /api/pack/edit/:id` - 编辑课包
- `POST /api/pack/remove/:id` - 删除课包

### 课程相关
- `POST /api/course/list` - 获取课程列表
- `POST /api/course/detail/:id` - 获取课程详情
- `POST /api/course/add` - 创建课程
- `POST /api/course/edit/:id` - 编辑课程（含状态约束）

### 科目相关
- `POST /api/subject/list` - 获取科目列表
- `POST /api/subject/detail/:id` - 获取科目详情
- `POST /api/subject/add` - 创建科目
- `POST /api/subject/edit/:id` - 编辑科目

### 教室相关
- `POST /api/room/list` - 获取教室列表
- `POST /api/room/detail/:id` - 获取教室详情
- `POST /api/room/add` - 创建教室
- `POST /api/room/edit/:id` - 编辑教室

## 数据库模型

### Account 模型
- _id: ObjectId
- code: String (唯一)
- passwordHash: String
- accountType: String ('User' | 'Student')
- currentUser: ObjectId (关联User)
- currentStudent: ObjectId (关联Student)
- isActive: Boolean
- isAdmin: Boolean
- currentSessionId: String
- lastLoginAt: Date
- lastLogoutAt: Date

### User 模型
- _id: ObjectId
- code: String (唯一)
- name: String
- phone: String
- email: String
- idCard: String
- Org: ObjectId (关联Org)
- Dept: ObjectId (关联Dept)
- Position: ObjectId (关联Position)
- roles: [ObjectId]
- isActive: Boolean

### Org 模型
- _id: ObjectId
- code: String (唯一)
- name: String
- parent: ObjectId (关联上级组织)
- level: Number
- isActive: Boolean

### Student 模型
- _id: ObjectId
- code: String (唯一)
- name: String
- phone: String
- email: String
- idCard: String
- school: ObjectId (关联School)
- grade: ObjectId (关联Grade)
- class: ObjectId (关联Class)
- isActive: Boolean

## 认证机制

### JWT Token
- 访问令牌 (Access Token): 有效期较短
- 刷新令牌 (Refresh Token): 存储在HttpOnly Cookie中，有效期较长
- 会话管理: 通过currentSessionId防止并发登录

### 权限控制
- 基于角色的访问控制 (RBAC)
- API权限控制
- 数据范围控制

## 环境配置

### 必需环境变量
```
NODE_ENV=development
PORT=8000
MONGODB_URI=mongodb://localhost:27017/rgzw
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
```

## 启动说明

### 开发环境
```bash
npm run dev
# 或
pnpm dev
```

### 生产环境
```bash
npm start
# 或
pnpm start
```

## 测试

### 运行测试
```bash
npm test
# 单元测试
npm run test:unit
# 集成测试
npm run test:integration
```

## 部署

### Docker 部署
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8000
CMD ["npm", "start"]
```

## 安全措施

### 输入验证
- 使用中间件进行请求参数验证
- 防止SQL注入和XSS攻击
- 数据清理和转义

### 身份验证
- 密码使用Argon2加密
- JWT Token签名验证
- 会话固定攻击防护

## 监控和日志

### 日志记录
- 访问日志
- 错误日志
- 审计日志

### 性能监控
- 响应时间监控
- 错误率监控
- 系统资源监控

## API 版本控制

### 当前版本
- 版本: v1
- 路径: /api/v1/*
- 兼容性: 向后兼容

## 错误处理

### 错误码定义
- 200: 成功
- 400: 请求错误
- 401: 未授权
- 403: 权限不足
- 404: 资源不存在
- 500: 服务器内部错误

## 开发规范

请参考项目中的 CLAUDE.md 文件了解后端开发规范。

## 更新日志

### v1.0.0
- 初始化项目结构
- 实现认证授权系统
- 完成基础CRUD功能
- 添加权限控制