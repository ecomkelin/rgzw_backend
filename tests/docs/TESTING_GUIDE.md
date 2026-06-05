# 测试指南（唯一入口）

> ⚠️ 本文档是测试文档的**唯一入口**。
> 历史文档（`TESTING.md` / `TESTING_SOLUTIONS.md` / `TESTING_SUMMARY.md`）已废弃，仅保留作为重定向占位。
> 反映 **v8.0.0** 后现状。

## 1. 安装依赖

```bash
pnpm install
# postinstall 钩子会自动下载 mongodb-memory-server 二进制（仅开发/测试环境）
```

## 2. 环境配置

测试环境变量在 `.env.test`（或 `.env`，CI 通常用前者）。本仓库 `.env` 当前配置：
```
NODE_ENV=dev / test
MONGODB_URI=mongodb://localhost:27017/rgzw
ACCESS_TOKEN_SECRET=...
REFRESH_TOKEN_SECRET=...
ACCESS_TTL_M=12000m   # 开发用超长 TTL，避免反复登录；测试时建议改 15m
REFRESH_TTL_D=30
```

> **测试建议**：把 `ACCESS_TTL_M` 改成 `15m`，避免 `authenticate` 中间件在长用例中过期。

## 3. 运行测试

### 3.1 全部单元/集成测试
```bash
pnpm test               # 等价 npm run test
pnpm test:watch         # watch 模式
pnpm test:coverage      # 覆盖率报告
```

### 3.2 E2E 测试
```bash
pnpm test:e2e
```

### 3.3 跑指定文件 / 用例
```bash
# 单文件
npx jest tests/api/auth.test.js

# 名字匹配
npx jest -t "login"

# 单跑某个 describe
npx jest --testPathPattern=account
```

### 3.4 负载测试
```bash
pnpm test:load:quick    # autocannon 100 连接 / 20s 打 /api/health
pnpm test:load          # 自定义压测脚本
```

## 4. 测试文件组织

```
tests/
├── __tests__/                   # 单元测试
│   ├── setup.js
│   ├── setup.local.js
│   └── test.utils.js            # 公共工具（DB 启停 / 登录 / 清库）
├── api/                         # API 集成测试（按模块）
│   ├── auth.test.js
│   ├── account.test.js
│   ├── student.test.js
│   ├── org.test.js
│   ├── user.test.js
│   └── ...
├── e2e/                         # 端到端测试
├── docs/                        # 测试文档（**仅本文档有效**）
└── report/                      # 测试报告
```

## 5. 公共测试工具

`tests/__tests__/test.utils.js` 暴露：

| 函数 | 用途 |
|---|---|
| `startMongoServer()` | 启动内存 MongoDB（`mongodb-memory-server`）|
| `stopMongoServer()` | 停止并清理 |
| `clearDatabase()` | 清空所有 collection |
| `loginAndGetTokens(credentials)` | 登录并返回 `{ accessToken, refreshToken, cookie, ... }` |
| `request` | 已配置好 `supertest` + `cookie-parser` 的 request 实例 |

## 6. 测试用例编写规范

### 6.1 标准结构

```javascript
const {
  request, app,
  startMongoServer, stopMongoServer, clearDatabase, loginAndGetTokens
} = require('../__tests__/test.utils');

describe('Account API', () => {
  beforeAll(async () => { await startMongoServer(); });
  beforeEach(async () => { await clearDatabase(); /* seed */ });
  afterEach(async () => { await clearDatabase(); });
  afterAll(async () => { await stopMongoServer(); });

  it('should login admin and get tokens', async () => {
    const { accessToken, headers } = await loginAndGetTokens({ code: 'ADMIN001', password: 'Test1234@' });
    const res = await request(app)
      .post('/api/account/list')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ filter: { isActive: true } });
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBeGreaterThanOrEqual(0);
  });
});
```

### 6.2 必查项

- HTTP 状态码
- 响应体 `{ code, success, message, data }` 结构
- 错误码语义（400/401/403/404/500）
- **跨 Org 隔离**：用 `Org B` 的 token 调 `Org A` 的资源应 403

### 6.3 鉴权 helper

`loginAndGetTokens` 返回 `headers`（已包含 `Authorization: Bearer ...` + `Cookie: refreshToken=...`），建议直接 spread：

```javascript
const { headers } = await loginAndGetTokens({ code: 'M001', password: 'Test1234@' });
await request(app).post('/api/user/list').set(headers).send({});
```

## 7. 当前测试覆盖状态（v8.0.0）

> ⚠️ 当前 v8.0.0 阶段，集成测试代码框架已就位，**大量用例处于"待修复"状态**。
> 历史"测试场景覆盖"段落（写为 `[x]`）已删除——以实际跑通为准。

| 模块 | 用例文件 | 状态 |
|---|---|---|
| 认证 (`auth`) | `tests/api/auth.test.js` | 🟡 框架就位，部分用例待补 |
| 账户 (`account`) | `tests/api/account.test.js` | 🟡 框架就位 |
| 学生 (`student`) | `tests/api/student.test.js` | 🟡 框架就位 |
| 组织 (`org`) | `tests/api/org.test.js` | 🟡 框架就位 |
| 用户 (`user`) | `tests/api/user.test.js` | 🟡 框架就位 |
| 课程 (`course`) / 课包 (`pack`) / 教室 (`room`) / 科目 (`subject`) | （未建） | 🔴 待建 |

## 8. 常见问题

### 8.1 数据库连接超时
- 真实 MongoDB：检查 `MONGODB_URI` 与 `mongod` 是否启动
- 内存 MongoDB：检查 `mongodb-memory-server` 二进制是否下载完整（`pnpm install` 时会触发 `postinstall`）

### 8.2 认证失败（401）
- 检查 token 是否过期（开发期 `ACCESS_TTL_M=12000m` 可极大缓解）
- 检查 payload 中 `sessionId` 与 `Account.currentSessionId` 一致（`SESSION_CHECK=on` 时严格，否则开发环境仅 warn）

### 8.3 端口冲突
- Jest 默认随机分配端口；如用 `supertest` 直连 `app.listen(0)`，**不要** hardcode 端口

### 8.4 内存泄漏警告
- `beforeAll` 启动的 `MongoMemoryServer` 必须在 `afterAll` 显式 `stop()`
- 创建的 Mongoose 连接在测试结束后需 `disconnect()`

### 8.5 模块别名（`@utils` / `@models`）找不到
- `package.json` 的 `test` 脚本会自动用 `module-alias/register`（已配置）
- 如自定义 Jest 入口，**必须**先 `require('module-alias/register')` 再 `require('jest')`

## 9. CI/CD 集成

```bash
# 单元 + 集成
pnpm test -- --ci --coverage

# E2E（需独立 DB）
pnpm test:e2e
```

覆盖率目标：80%（见 [package.json](../../package.json) 的 `jest.config.js`，如有 `coverageThreshold` 配置则按配置走）。

## 10. 已废弃文档（重定向）

| 历史文件 | 状态 |
|---|---|
| `TESTING.md` | 旧版 API 测试文档，**已并入本文档**，仅作重定向占位 |
| `TESTING_SOLUTIONS.md` | 旧版测试解决方案（模块别名等），核心内容已并入本文档 §8.5 |
| `TESTING_SUMMARY.md` | 旧版覆盖汇总，**已废弃**（覆盖状态以本文档 §7 为准） |
| `tests/report/report_2_3_0.md` | 历史测试报告（v2.3.0），保留作为历史档案 |
