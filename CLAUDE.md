# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码仓库中工作时提供指导。

## 项目概述

这是一个基于 Express.js 和 MongoDB 的后端应用程序，具有完整的身份验证、授权和模块化架构。该项目采用模块化方法并具有自动路由加载功能，包括完整 CRUD 功能以及适当的错误处理和验证。

## 架构与结构

### 目录结构
```
src/
├── models/              # 按领域组织的数据模型
│   ├── authorization/   # 认证相关模型
│   ├── organization/    # 组织相关模型
│   └── global/          # 全局模型
├── modules/             # 功能模块（按业务领域组织）
│   ├── _authorization/  # 认证模块
│   ├── _organization/   # 组织模块
│   └── _global/         # 全局功能
├── middlewares/         # Express 中间件
├── utils/              # 工具函数
└── routers/            # 主路由入口
```

### 模块结构
每个模块遵循以下模式：
```
module-name/
├── controller.js       # 使用 asyncHandler 包装的控制器
├── service.js          # 业务逻辑层
├── index.routes.js     # 路由定义
└── utils/
    └── validator.js    # 验证规则
```

### 自动路由加载
- 路由自动从 `src/modules/` 目录加载
- 后缀为 `.routes.js` 的文件被识别为路由文件
- 名称以 `__` 开头的目录在扫描时被忽略
- 名称以 `_` 开头的目录包含在代码库中，但在路由前缀中排除

## 关键技术与模式

### 身份验证与授权
- 基于 JWT 的身份验证，刷新令牌存储在 HttpOnly Cookie 中
- 基于角色的权限，具有用户特定的 API 访问控制
- 会话验证防止并发登录
- 多级授权（authenticate、user、student）

### 响应处理
- 使用 ApiResponse 实用程序的标准 API 响应
- 用 asyncHandler 包装的异步处理器，避免在控制器中使用 try/catch
- 集中化的错误处理中间件

### 验证
- 使用 express-validator 进行请求验证
- 预定义验证规则：`createVD`、`updateVD`、`listVD`、`detailVD`、`deleteVD`
- 使用模型定义的枚举进行枚举验证

## 开发命令

### 运行应用程序
```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 运行测试
pnpm run test                    # 单元测试
pnpm run test:watch            # 监视模式
pnpm run test:coverage         # 覆盖率报告
pnpm run test:e2e              # 端到端测试
pnpm run test:all              # 所有测试

# 数据库操作
pnpm run db:seeds              # 种子数据填充
pnpm run db:seeds:test         # 测试数据库种子数据填充

# 负载测试
pnpm run test:load             # 负载测试脚本
pnpm run test:load:quick       # 快速 autocannon 测试

# 使用 PM2 进行生产部署
pnpm run pm2                   # 使用 PM2 部署
pnpm run pm2:restart           # 重启 PM2 应用
pnpm run pm2:stop              # 停止 PM2 应用
```

### 环境变量
必需的环境变量（参见 `.env.example`）：
- `NODE_ENV`: 环境（dev/test/production）
- `MONGODB_URI`: MongoDB 连接字符串
- `ACCESS_TOKEN_SECRET`: JWT 访问令牌密钥
- `REFRESH_TOKEN_SECRET`: JWT 刷新令牌密钥
- `PORT`: 服务器端口（默认：8000）

## 命名约定

### 文件
- 模型：`ModelName.model.js`
- 路由：`*.routes.js`
- 控制器：`FeatureCT`（带 CT 后缀）
- 服务：`FeatureSV`（带 SV 后缀）
- 验证器：模块的 utils 文件夹中的 `validator.js`

### 变量
- 类：PascalCase（`UserService`）
- 函数/变量：camelCase（`getUserById`）
- 常量：UPPER_SNAKE_CASE（`MAX_LENGTH`）

### 路由
- 从目录结构自动生成
- 目录名中的 `_` 前缀从路由路径中删除
- `__` 前缀忽略整个目录

## 关键实用程序

- `asyncHandler.js`: 包装异步函数以处理错误
- `response.js`: 标准化 API 响应格式
- `envValidator.js`: 验证必需的环境变量
- `JwtUtil.js`: JWT 令牌操作
- `sessionValidator.js`: 管理会话以防止并发登录

## 测试指南

- 单元测试在 `tests/unit/`
- 集成测试在 `tests/integration/`
- 端到端测试在 `tests/api/`
- 在 Node 测试环境中使用 Jest
- 为单元测试模拟数据库连接

## 安全特性

- CORS 针对生产和开发环境配置不同
- HttpOnly Cookie 用于刷新令牌
- 全面的输入验证
- 防止并发登录的会话管理
- 基于角色的 API 权限
- 安全的令牌存储和处理

## API 文档

- 健康检查可在 `/` 访问
- API 文档可在 `/api` 访问
- 完整 API 列表在 `/api/list`
- 通过路由收集器自动生成 API 文档