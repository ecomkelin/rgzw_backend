# 科技培训学校管理系统 (rgzw_backend)

> 版本: **v8.0.0**（[version.md](./version.md) 查看更新历史）
> 架构: **四层架构**（Route → Controller → Service → DAO）

基于 Node.js + Express + MongoDB 的科技培训学校管理系统后端，提供账户、组织、课程、学员、课包、教室、科目等模块的 RESTful API。

---

## 🗂 项目结构

```
rgzw_backend/
├── src/
│   ├── main.js                  # 入口文件
│   ├── models/                  # 数据模型（model.js 定义 schema，dao.js 提供 CRUD）
│   │   ├── authorization/       #   - 账户、权限相关
│   │   ├── organization/        #   - 机构、用户、教室
│   │   ├── school/              #   - 课程、学员、课次
│   │   └── pack/                #   - 课包、订单
│   ├── modules/                 # 业务模块（每个模块内部都是 Route→CT→SV→DAO 四层）
│   │   ├── _authorization/      #   - auth（登录/登出/刷新/切换身份）、account
│   │   ├── _organization/       #   - org、user、room
│   │   └── _school/             #   - course、student、pack、subject
│   ├── middlewares/             # 通用中间件（authenticate / userAuthorize / error / logger）
│   ├── utils/                   # 工具（JwtUtil / payloadChecker / ApiResponse / envValidator …）
│   └── routers/                 # 自动路由加载（扫描 src/modules 下 *.routes.js）
├── tests/                       # 单元测试 + E2E 测试
├── scripts/db/seeds/            # 数据库种子数据
├── doc/                         # 详细技术文档（架构 / 数据库 / 开发规范 / Payload 结构）
├── .env.example                 # 环境变量模板
├── package.json
└── version.md
```

> 📁 **自动路由加载规则**：
> - 扫描 `src/modules/**/*.routes.js`
> - `__` 开头的目录/文件 **不**扫描（如 `src/models/authorization/__roleApi/`）
> - `_` 开头的目录会被收录，但路径中**忽略**目录名（如 `_authorization/auth` → `/api/auth`）

---

## ✨ 主要特性

| 类别 | 能力 |
|---|---|
| **认证** | JWT 双令牌（access 5m + refresh 30d HttpOnly Cookie）+ 单会话防并发 + Argon2id 密码哈希 |
| **多身份** | 一个 `Account` 下可挂多个 `User`（跨机构）/ `Student`，通过 `switch-role` 切换 |
| **权限** | 管理员（isAdmin）/ 经理（manager）/ 教师（teacher）+ `userAuthorize` 中间件 + `payloadChecker` 工具 |
| **数据隔离** | 严格按 `Org` 隔离 + 软删除（`isActive: false`）|
| **安全** | `immutable` / `immutableFront` 字段保护 + 字段级 payloadChecker + NoSQL 注入防护 |
| **可观测** | 日志中间件 + 监控中间件 + Sentry 可选接入 |

---

## 🚀 快速开始

```bash
# 1. 安装依赖
pnpm install

# 2. 复制环境变量
cp .env.example .env
# 编辑 .env：必须设置 ACCESS_TOKEN_SECRET / REFRESH_TOKEN_SECRET / MONGODB_URI

# 3. 初始化种子数据
pnpm db:seeds

# 4. 启动开发服务器（默认 :8000）
pnpm dev
```

---

## 📜 命令脚本

| 命令 | 用途 |
|---|---|
| `pnpm dev` | 开发模式（nodemon 热重启）|
| `pnpm test` | 单元测试 |
| `pnpm test:watch` | 单元测试 watch 模式 |
| `pnpm test:coverage` | 单元测试 + 覆盖率 |
| `pnpm test:e2e` | 端到端测试 |
| `pnpm test:all` | 单元 + E2E |
| `pnpm db:seeds` | 初始化种子数据 |
| `pnpm db:seeds:test` | 测试环境初始化种子数据 |
| `pnpm pm2` | PM2 部署（生产）|
| `pnpm test:load:quick` | 快速负载测试（autocannon）|

---

## ⚠️ 已知异常：`.env` 中 `ACCESS_TTL_M=12000m`

本仓库 `.env` 当前把 `ACCESS_TTL_M` 设为 **12000m**（200 小时 = 8.3 天），这是为了**开发期免反复登录**故意为之。

- 📖 **代码默认**（`src/utils/JwtUtil.js`）：`5m`
- 🛠 **本仓库 `.env` 实际**：`12000m`
- 🚨 **生产前必改**：≤ 60m（建议 15m）

如果你**复用本项目**到新环境，建议从 `.env.example` 复制，不要直接沿用 `12000m`。

---

## 📚 详细文档

| 文档 | 内容 |
|---|---|
| [doc/ARCHITECTURE.md](./doc/ARCHITECTURE.md) | 四层架构规范（Route / Controller / Service / DAO）|
| [doc/DATABASE_ARCHITECTURE.md](./doc/DATABASE_ARCHITECTURE.md) | 数据库实体关系 + 权限控制 |
| [doc/DEVELOPMENT_STANDARD.md](./doc/DEVELOPMENT_STANDARD.md) | 开发规范（命名 / 注释 / 错误处理）|
| [doc/LOGIN_PAYLOAD_STRUCTURE.md](./doc/LOGIN_PAYLOAD_STRUCTURE.md) | **登录 Payload 结构 + payloadChecker 工具使用** ⭐ |
| [DOCS/API_DOCUMENTATION.md](./DOCS/API_DOCUMENTATION.md) | 全部 API 端点清单（按模块）|
| [version.md](./version.md) | 版本更新日志 |
| [tests/docs/TESTING_GUIDE.md](./tests/docs/TESTING_GUIDE.md) | 测试指南（5 份测试 doc 合并后的唯一入口）|

---

## 🛠 技术栈

- **运行时**: Node.js（建议 ≥ 18）
- **框架**: Express 4
- **数据库**: MongoDB + Mongoose
- **认证**: JWT（jsonwebtoken）+ Cookie（cookie-parser）
- **密码**: Argon2id
- **校验**: express-validator
- **测试**: Jest + Supertest + mongodb-memory-server
- **进程管理**: PM2
- **包管理**: pnpm

---

## 📐 编码约定

### 路径别名（来自 `package.json` `_moduleAliases`）

| 别名 | 指向 |
|---|---|
| `@/` | `src/` |
| `@models/` | `src/models/` |
| `@modules/` | `src/modules/` |
| `@middlewares/` | `src/middlewares/` |
| `@utils/` | `src/utils/` |
| `@routers/` | `src/routers/` |
| `@config/` | `src/config/` | ⏳ 预留（当前项目**无** `src/config/` 目录，但 `package.json` 已注册，便于未来引入配置文件）|

### 错误抛出规范

```javascript
// ✅ 业务错误：service / DAO 层
throw ({ code: 404, message: '账户不存在' });

// ✅ Controller 捕获并返回
try { ... } catch (e) {
  return res.status(e.code || 500).json(ApiResponse.error(e));
}
```

### 响应格式

```json
{ "code": 200, "success": true, "message": "操作成功", "data": { ... } }
```

完整约定见 [doc/DEVELOPMENT_STANDARD.md](./doc/DEVELOPMENT_STANDARD.md)。
