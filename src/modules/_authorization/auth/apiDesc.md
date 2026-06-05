# Authentication 模块 API 接口文档

## 概述

Authentication 模块负责用户认证功能，包括登录、登出、令牌刷新和切换身份功能。

- **账户模型**: 一个 `Account` 可对应多个 `User`(员工) / 多个 `Student`(学生)
  - `accountType` 不可变（`User` 或 `Student`）
  - `User` 账户下可有多个 Org 的员工；同一 Org 下同一账户只能有一个 User
  - `Student` 账户下可有多个学生
- **双令牌机制**: 短时效 `accessToken`（5分钟）+ 长时效 `refreshToken`（HttpOnly Cookie，30天）
- **会话防并发**: 每次登录 / 刷新都生成新的 `currentSessionId`

## 接口列表

### 1. 用户登录
- **路径**: `POST /api/auth/login`
- **描述**: 用户登录，返回访问令牌和用户信息
- **请求参数**:
  - `code`: 用户账号/编码 (必填, 4-16位字符串)
  - `password`: 用户密码 (必填, 8-16位字符串)
- **响应**:
  - `accessToken`: 访问令牌
  - `account`: 账户信息
  - `refreshToken`: 刷新令牌（通过Cookie设置）
  - `payload`: JWT 载荷（包含 `accountType / isAdmin / currentUser / currentStudent`）

### 2. 刷新访问令牌
- **路径**: `GET /api/auth/refresh-token`
- **描述**: 使用刷新令牌获取新的访问令牌
- **请求参数**: 从Cookie中获取refreshToken
- **响应**:
  - `accessToken`: 新的访问令牌
  - `account`: 账户信息
  - `refreshToken`: 新的刷新令牌（通过Cookie设置）

### 3. 切换身份
- **路径**: `POST /api/auth/switch-role/:id`
- **描述**: 在同一账户下切换 `currentUser`（User 账户）或 `currentStudent`（Student 账户）身份
- **认证要求**: 需要有效的访问令牌（`authenticate` 中间件）
- **路径参数**:
  - `id` (必填): 目标 `User` 或 `Student` 的 ObjectId
- **业务规则**:
  - 目标身份必须存在且 `isActive === true`
  - **跨账户禁止**: 目标身份必须归属当前 `Account`（`User.Account === payload._id` / `Student.Account === payload._id`）
  - **跨机构允许**:
    - User 切换: 业务上"只要 User 切换就会换机构"——目标 User 可属于不同 Org
    - Student 切换: 跨机构时输出 `console.warn` 日志，方便审计
  - `accountType` 不可变: 切换只能在同类型身份的多个实例之间进行（User 账户只能切到 User，Student 账户只能切到 Student）
  - 切换后原 sessionId 保持不变（不强制重新登录）
  - 切换后 `accessToken` 和 `refreshToken` 都重新签发，Cookie 被更新
- **业务校验**（service 层执行）:
  - 账户不存在或被禁用 → 404
  - 目标 User/Student 不存在或被禁用 → 404
  - 目标 User/Student 不属于当前 Account → 404
  - 当前身份的 `currentUser` / `currentStudent` 字段被持久化更新到 DB（`Account.save()`）
  - 切换后立即生成新 JWT 令牌
- **响应**:
  - `accessToken`: 新的访问令牌（payload 中 `currentUser` / `currentStudent` 已更新）
  - `account`: 更新后的账户（populate 了新 `currentUser` 或 `currentStudent`）
  - `refreshToken`: 新的刷新令牌（通过Cookie设置）
  - `payload`: 新的 JWT 载荷
  - `sessionId`: 当前会话ID
- **错误响应**:
  - `404`: 账户/用户/学生不存在或被禁用
  - `400`: URL 参数 `id` 不是合法 ObjectId
  - `500`: 服务器内部错误
- **典型用例**:
  - 家长账户下有多个学生：可切换 `currentStudent` 查看不同孩子的课程
  - 一个员工关联了多个 Org 的 User 身份：可切换 `currentUser` 进入不同机构的管理界面
  - 切换后**前端需要清空本地缓存**（Pinia/Vuex store、路由状态、请求缓存），因为业务上下文已变更

### 4. 用户登出
- **路径**: `GET /api/auth/logout`
- **描述**: 用户登出，清除登录状态
- **认证要求**: 需要有效的访问令牌
- **响应**: 登出成功消息

## 认证机制

- 使用基于JWT的双重令牌认证机制
- 访问令牌(Access Token): 用于常规API调用，短期有效（默认5分钟）
- 刷新令牌(Refresh Token): 存储在HttpOnly Cookie中，长期有效（默认30天），用于获取新的访问令牌
- 会话ID(`currentSessionId`): 每次登录/刷新都会更新，防止并发登录
- 切换身份(`switchRole`)不会改变 `currentSessionId`，但会签发新 accessToken 和 refreshToken

## 响应格式

所有接口均采用统一的响应格式：

```json
{
  "code": 200,
  "success": true,
  "message": "操作成功",
  "data": {}
}
```

## 错误码说明

| 状态码 | 含义 | 触发场景 |
| --- | --- | --- |
| `200` | 成功 | - |
| `400` | 参数错误 | URL 参数 `id` 格式错误、密码错误、用户不存在或被禁用 |
| `401` | 身份验证失败 | 访问令牌无效/过期、刷新令牌无效/过期、账号被禁用 |
| `404` | 资源不存在 | 账户/用户/学生不存在或被禁用 |
| `500` | 服务器内部错误 | 数据库异常、未知错误 |

## 切换身份流程图

```
┌─────────┐                 ┌─────────┐                 ┌──────────┐
│  Client │                 │  Server │                 │ MongoDB  │
└────┬────┘                 └────┬────┘                 └────┬─────┘
     │  POST /switch-role/:id   │                            │
     │  (accessToken in header) │                            │
     │ ────────────────────────>│                            │
     │                          │  authenticate()            │
     │                          │  验证 accessToken           │
     │                          │ ──────────────────────────>│
     │                          │  查 Account                │
     │                          │ <──────────────────────────│
     │                          │  payload OK                │
     │                          │                            │
     │                          │  payloadChecker()          │
     │                          │  校验 payload 完整性         │
     │                          │                            │
     │                          │  validateObjectId('id')    │
     │                          │  校验 :id 是合法 ObjectId   │
     │                          │                            │
     │                          │  switchRole()              │
     │                          │                            │
     │                          │  1. 查 Account (含 +sessionId)
     │                          │ ──────────────────────────>│
     │                          │ <──────────────────────────│
     │                          │                            │
     │                          │  2. 查 User/Student         │
     │                          │ ──────────────────────────>│
     │                          │ <──────────────────────────│
     │                          │                            │
     │                          │  3. 校验归属:               │
     │                          │     User/Student.Account   │
     │                          │     === Account._id        │
     │                          │                            │
     │                          │  4. 若 currentUser 不同:    │
     │                          │     Account.save()         │
     │                          │ ──────────────────────────>│
     │                          │ <──────────────────────────│
     │                          │                            │
     │                          │  5. 签发新 JWT             │
     │                          │  6. 返回新令牌 + 更新 Cookie│
     │ <────────────────────────│                            │
     │  { accessToken,          │                            │
     │    refreshToken,         │                            │
     │    account, payload,     │                            │
     │    sessionId }           │                            │
     │  Set-Cookie: refreshToken│                            │
```

## 注意事项

1. **跨机构切换后必须刷新前端状态**: 切到不同 Org 的 User 后，业务上下文完全改变，前端需要清空所有缓存、store、路由状态。
2. **跨账户切换是禁止的**: 攻击者拿到一个 Account 的 token 后，无法切换到其他 Account 的身份。
3. **`switchRole` 不重置 sessionId**: 用户切换身份后 session 保持，但 token 重新签发。
4. **同一 Org 下同一 Account 只能有一个 User**: 这是 `User` 模型上的 `{ Account: 1, Org: 1 }` 唯一索引保证的。
