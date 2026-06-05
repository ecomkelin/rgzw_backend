# 认证模块流程说明

## 概述
认证模块提供了完整的用户认证功能，包括登录、刷新令牌、**切换身份**和登出功能。采用 JWT + Refresh Token + Session ID 的多层安全机制。JWT payload 中仅包含账户信息，详细用户权限在需要时从数据库中查询。

支持"一个账户下挂多个身份"的业务模型：
- 一个 `Account` 账号可对应多个 `User`（员工）/ 多个 `Student`（学生）
- `User` 账户类型下，同一 Org 内只能有一个 User（由 `{ Account: 1, Org: 1 }` 唯一索引保证），但可跨多个 Org
- `Student` 账户类型下，可有多个学生（兄弟、家长、孩子等）
- 通过 `switchRole` 接口在同类型身份之间切换

## 目录结构
```
src/modules/_authorization/auth/
├── index.routes.js         # 路由定义
├── controller.js           # 控制器层
├── service.js              # 业务逻辑层
├── middlewares/validator.js # 请求验证
├── index.routes.desc.js    # 路由描述
```

## 接口详情

### 1. 登录接口 POST /api/auth/login
**功能**: 用户身份验证并颁发访问令牌

**请求参数**:
- code: 用户代码 (4-16位字符串)
- password: 用户密码 (8-16位字符串)

**流程**:
1. 验证请求参数格式
2. 根据 code 查找账户
3. 验证密码
4. 生成唯一会话ID，更新账户的 currentSessionId
5. 生成仅包含账户信息的 JWT 载荷（不包含 User 或 Student 详情）
6. 生成 JWT 访问令牌和刷新令牌
7. 设置 HttpOnly Cookie 存储刷新令牌
8. 返回访问令牌和账户信息

**响应**:
- 成功: `{ accessToken, account, payload, refreshToken, sessionId, refreshTokenExpiresAt }`
- 失败: `{ code, message }`

### 2. 刷新令牌接口 GET /api/auth/refresh-token
**功能**: 使用刷新令牌获取新的访问令牌

**流程**:
1. 从 Cookie 中获取 refreshToken
2. 验证 refreshToken 有效性
3. 验证会话有效性（防止并发登录）
4. 生成新的会话 ID
5. 生成新的访问令牌和刷新令牌
6. 设置新的 refreshToken 到 Cookie

**响应**:
- 成功: `{ accessToken, account }` (更新的令牌)
- 失败: `{ message }`

### 3. 切换身份接口 POST /api/auth/switch-role/:id  ⭐
**功能**: 在同一账户下切换 `currentUser`（User 账户）或 `currentStudent`（Student 账户）身份

**前置条件**:
- 需要有效的访问令牌（`authenticate` 中间件）
- URL 参数 `:id` 必须是合法的 ObjectId

**请求参数**:
- `:id`: 目标 User 或 Student 的 ObjectId（路径参数）

**业务规则**:
- 目标身份必须存在且 `isActive === true`
- **跨账户禁止**: 目标身份必须归属当前 Account（`User.Account === payload._id` / `Student.Account === payload._id`）
- **跨机构允许**:
  - User 切换: 业务上"只要 User 切换就会换机构"——目标 User 可属于不同 Org
  - Student 切换: 跨机构时输出 `console.warn` 日志，方便审计
- `accountType` 不可变: 切换只能在同类型身份的多个实例之间进行

**流程**:
1. `authenticate` 中间件解析访问令牌，注入 `req.payload`
2. `switchRoleVD` 中间件校验 `:id` 是合法 ObjectId
3. `payloadChecker` 校验 payload 完整性
4. 查 Account（含 `+currentSessionId`）
5. 查目标 User / Student，校验 `isActive` 和归属（`User.Account === Account._id` / `Student.Account === Account._id`）
6. 若 `currentUser` / `currentStudent` 与目标不同，更新 Account 字段并 `save()`
7. Student 跨机构切换时输出 warn 日志
8. 用新身份签发 JWT 访问令牌和刷新令牌
9. 设置新的 refreshToken 到 Cookie
10. 返回新令牌和账户信息

**响应**:
- 成功: `{ accessToken, account, payload, refreshToken, sessionId, refreshTokenExpiresAt }`
- 失败:
  - `404`: 账户/用户/学生不存在或被禁用
  - `400`: URL 参数 id 格式错误

**安全机制**:
- **跨账户检查**: 阻止攻击者利用一个 Account 的 token 切换到其他 Account 的身份
- **isActive 检查**: 目标身份必须处于活跃状态
- **session 保持**: 切换后 sessionId 不变（用户无需重新登录），但 accessToken 和 refreshToken 都重新签发
- **跨机构审计**: Student 跨机构切换会留下 warn 日志，方便后续审计

**典型用例**:
- 家长账户下有多个学生：切换 `currentStudent` 查看不同孩子的课程
- 员工关联了多个 Org 的 User 身份：切换 `currentUser` 进入不同机构的管理界面
- **切换后前端必须清空本地状态**（Pinia/Vuex store、路由、缓存），因为业务上下文已变更

### 4. 登出接口 GET /api/auth/logout
**功能**: 用户登出，清除会话

**前置条件**: 需要有效的访问令牌（authenticate 中间件）

**流程**:
1. 验证访问令牌有效性
2. 通过 authenticate 中间件解析用户身份
3. 清除账户的 currentSessionId 字段
4. 更新最后登出时间
5. 返回登出成功消息

## 安全机制

### 1. 多重验证
- 密码哈希验证
- JWT 令牌验证
- 会话ID验证
- 切换身份时的归属验证（User.Account / Student.Account）

### 2. 防止并发登录
- 通过 currentSessionId 确保同一账户只有一个活跃会话
- 每次登录或刷新令牌都生成新的会话ID
- 切换身份不重置 sessionId（保持当前会话）

### 3. 令牌安全管理
- 访问令牌: 短时效（默认5分钟）
- 刷新令牌: 存储在 HttpOnly Cookie 中（**默认7天**，由环境变量 `REFRESH_TTL_D` 控制，本仓库 `.env` 当前设为 30；与 `JwtUtil.REFRESH_TTL_DAYS` / Cookie `maxAge` 保持同源），防止 XSS 攻击
- 会话验证: 每次访问受保护资源时验证会话有效性

### 4. 切换身份安全
- **跨账户禁止**: 通过 User/Student 模型的 `Account` 字段强制约束
- **isActive 强制检查**: 不能切换到被禁用的身份
- **跨机构审计**: Student 跨机构切换有 warn 日志

### 5. 登出安全性
- 立即清除服务器端会话标识
- 未来可考虑添加令牌黑名单机制

## 中间件链

### 登录 (/login)
`loginVD` → `controller.login`

### 刷新令牌 (/refresh-token)
`controller.refreshToken`

### 切换身份 (/switch-role/:id)
`authenticate` → `switchRoleVD` → `controller.switchRole`

### 登出 (/logout)
`authenticate` → `controller.logout`

## 错误处理

### 登录错误
- 用户不存在或已禁用
- 密码错误
- 服务器内部错误

### 刷新令牌错误
- 无效的刷新令牌
- 会话已过期
- 服务器内部错误

### 切换身份错误
- 账户/用户/学生不存在或被禁用
- 目标身份不归属当前账户
- URL 参数 id 格式错误
- 服务器内部错误

### 登出错误
- 服务器内部错误

## 与其他模块关系

### 依赖的模型
- `@models/authorization/Account.model`: 账户信息
- `@models/organization/structure/User.model`: 员工身份（User 账户下）
- `@models/school/student/Student.model`: 学生身份（Student 账户下）

### 依赖的工具
- `@utils/JwtUtil`: JWT 令牌操作
- `@utils/payloadChecker`: payload 完整性校验
- `@utils/response`: 统一响应格式
- `@middlewares/auth`: 认证中间件

### 依赖的中间件
- `@middlewares/auth.authenticate`: 身份验证
- `./middlewares/validator.loginVD`: 登录验证规则
- `./middlewares/validator.switchRoleVD`: 切换身份验证规则

## 性能优化

1. 令牌精简: JWT 载荷只包含基本账户信息，减少网络传输
2. 权限延迟加载: 详细权限信息在需要时从数据库查询
3. 会话验证: 仅在必要时查询数据库验证会话状态
4. 索引优化: 确保查询字段有适当索引（code, isActive等）
5. 切换身份优化: 相同身份切换时跳过 save() 操作

## 可扩展性

1. 可添加双因素认证
2. 可增加 IP 白名单机制
3. 可添加登录尝试次数限制
4. 可支持多种认证方式（OAuth 等）
5. 可添加切换身份的审计日志表（当前仅 console.warn）
6. 可添加切换身份的频率限制（防滥用）
