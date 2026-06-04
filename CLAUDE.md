# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 项目概述

rgzw_backend 是一个基于 Node.js/Express 构建的应用程序，使用 MongoDB 作为数据库。它是一个科技培训学校管理系统。应用程序遵循 MVC 模式，在模型、控制器和服务之间有明确的关注点分离。

## 架构结构

应用程序遵循模块化架构，包含以下关键目录：

- `src/` - 主要源代码
  - `models/` - 数据库模式和数据访问对象 (DAO)
  - `modules/` - 功能模块 (认证、组织、学校等)
  - `routers/` - Express 路由和路由加载工具
  - `controllers/` - 请求处理逻辑 (在模块内)
  - `services/` - 业务逻辑 (在模块内)
  - `middlewares/` - Express 中间件函数
  - `utils/` - 实用函数和辅助工具

## 路由系统

应用程序使用自动路由加载系统，扫描 `src/modules` 目录中以 `.routes.js` 结尾的文件。路由按功能模块组织，并自动挂载到 `/api` 下。

- 路由文件使用 `.routes.js` 后缀
- 以 `__` 开头的文件/目录在扫描期间被忽略
- 以 `_` 开头的目录在路由路径构建中被忽略
- 系统支持可选的路由描述文件 (`.routes.desc.js`) 用于 API 文档

## 模型和数据访问模式

模型在 `src/models` 目录中组织，并遵循一致的模式：
- `.model.js` 文件定义 Mongoose 模式和枚举
- `.dao.js` 文件提供数据访问的 CRUD 操作和业务逻辑
- 模型使用 DAO (数据访问对象) 模式进行标准化操作
- 密码哈希使用 Argon2 自动处理

## 认证和授权

应用程序实现了全面的认证系统：
- 基于 JWT 的认证，包含访问令牌和刷新令牌
- 刷新令牌存储在 HTTP-only cookies 中
- 会话管理防止并发登录
- 基于角色的访问控制，为管理员、用户和学生提供不同权限
- 多层授权 (认证 + 基于角色的权限)

## 关键技术与库

- **Node.js** 与 **Express** 框架
- **MongoDB** 与 **Mongoose** ODM
- **Argon2** 用于密码哈希
- **JWT** 用于基于令牌的认证
- **Jest** 用于测试
- **PM2** 用于生产进程管理
- **Nodemon** 用于开发自动重启

## 环境变量

所需环境变量在 `.env.example` 中定义：
- `NODE_ENV` - 环境模式 (dev, test, production)
- `PORT` - 服务器端口 (默认: 8000)
- `MONGODB_URI` - MongoDB 连接字符串
- `ACCESS_TOKEN_SECRET` 和 `REFRESH_TOKEN_SECRET` - JWT 密钥
- 各种令牌过期设置

## 命令脚本

开发的关键 pnpm 脚本：

- `pnpm dev` - 启动开发服务器并自动重启
- `pnpm test` - 运行单元测试
- `pnpm test:watch` - 在监视模式下运行测试
- `pnpm test:coverage` - 生成测试覆盖报告
- `pnpm test:e2e` - 运行端到端测试
- `pnpm db:seeds` - 使用种子数据初始化数据库
- `pnpm pm2` - 使用 PM2 部署到生产环境
- `pnpm test:load:quick` - 使用 autocannon 快速负载测试

## 编程模式

### 控制器模式
- 响应使用 `ApiResponse` 实用程序进行一致性格式化
- 通过中间件进行标准化错误处理

### 服务模式
业务逻辑封装在服务类中：
- 服务处理业务逻辑，与请求处理分离
- 使用代码和消息进行一致的错误抛出

### 响应模式
所有 API 响应遵循使用 `ApiResponse` 的一致格式：
- 成功响应: `{ code: 200, success: true, message: "...", data: {...} }`
- 错误响应具有标准化的代码和格式

### 错误处理模式
- 服务层、DAO层、中间件等统一使用的错误格式抛出：`throw({code: Number, message: String})`
- 控制器层接收错误并使用 `ApiResponse.error()` 根据 code 返回适当响应
- 开发环境中详细记录，在生产环境中精简响应
- 自定义错误对象带有 `code` 属性用于正确处理

## 模块结构

`src/modules` 中的每个模块都遵循此结构：
```
_module_name/
├── index.routes.js          # 主路由文件
├── controller.js            # 请求处理程序
├── service.js               # 业务逻辑
├── middlewares/             # 模块特定中间件
│   └── validator.js         # 请求验证
```

## 测试方法

测试位于 `tests` 目录并使用 Jest：
- 单元测试用于单个函数和模块
- API 端点的集成测试
- 完整工作流程的端到端测试
- 数据库设置/拆卸的测试实用程序

## 数据库播种

数据库初始化通过播种系统处理：
- 位于 `scripts/db/seeds/`
- 支持账户和其他基本数据的初始化
- 使用 `pnpm db:seeds` 运行

## 项目文档结构

项目文档分为以下几个部分：

### 根目录文档
- `README.md` - 项目概述和快速入门
- `CLAUDE.md` - Claude Code 开发指导
- `version.md` - 版本历史记录

### 文档目录 (doc/)
- `ARCHITECTURE.md` - 项目架构详细说明
- `DEVELOPMENT_STANDARD.md` - 开发规范和标准
- `LOGIN_PAYLOAD_STRUCTURE.md` - **Login Payload 结构规范**（含 `payloadChecker` 工具使用）
- 其他技术文档

### 测试文档 (tests/docs/)
- `TESTING_GUIDE.md` - 测试指南
- `TESTING_SOLUTIONS.md` - 测试问题解决方案
- `TESTING_SUMMARY.md` - 测试总结
- `TESTING.md` - 测试说明

### 测试报告 (tests/report/)
- `report_x_x_x.md` - 版本测试报告