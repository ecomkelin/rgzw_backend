# 认证模块流程说明

## 概述
认证模块提供了完整的用户认证功能，包括登录、刷新令牌和登出功能。采用JWT + Refresh Token + Session ID的多层安全机制。JWT payload中仅包含账户信息，详细用户权限在需要时从数据库中查询。

## 目录结构
```
src/modules/_authorization/auth/
├── index.routes.js         # 路由定义
├── controller.js           # 控制器层
├── service.js              # 业务逻辑层
├── middlewares/validator.js # 请求验证
├── index.routes.desc.js    # 路由描述（可能）
```

## 接口详情

### 1. 登录接口 POST /api/auth/login
**功能**: 用户身份验证并颁发访问令牌

**请求参数**:
- code: 用户代码 (4-16位字符串)
- password: 用户密码 (8-16位字符串)

**流程**:
1. 验证请求参数格式
2. 根据code查找账户
3. 验证密码
4. 生成唯一会话ID，更新账户的currentSessionId
5. 生成仅包含账户信息的JWT载荷（不包含User或Student详情）
6. 生成JWT访问令牌和刷新令牌
7. 设置HttpOnly Cookie存储刷新令牌
8. 返回访问令牌和账户信息

**响应**:
- 成功: `{accessToken, account}`
- 失败: `{code, message}`

### 2. 刷新令牌接口 GET /api/auth/refresh-token
**功能**: 使用刷新令牌获取新的访问令牌

**流程**:
1. 从Cookie中获取refreshToken
2. 验证refreshToken有效性
3. 验证会话有效性（防止并发登录）
4. 生成新的会话ID
5. 生成新的访问令牌和刷新令牌
6. 设置新的refreshToken到Cookie

**响应**:
- 成功: `{accessToken, account}` (更新的令牌)
- 失败: `{message}`

### 3. 登出接口 GET /api/auth/logout
**功能**: 用户登出，清除会话

**前置条件**: 需要有效的访问令牌（authenticate中间件）

**流程**:
1. 验证访问令牌有效性
2. 通过authenticate中间件解析用户身份
3. 清除账户的currentSessionId字段
4. 更新最后登出时间
5. 返回登出成功消息

## 安全机制

### 1. 多重验证
- 密码哈希验证
- JWT令牌验证
- 会话ID验证

### 2. 防止并发登录
- 通过currentSessionId确保同一账户只有一个活跃会话
- 每次登录或刷新令牌都生成新的会话ID

### 3. 令牌安全管理
- 访问令牌: 短时效（默认5分钟）
- 刷新令牌: 存储在HttpOnly Cookie中，防止XSS攻击
- 会话验证: 每次访问受保护资源时验证会话有效性

### 4. 登出安全性
- 立即清除服务器端会话标识
- 未来可考虑添加令牌黑名单机制

## 中间件链

### 登录 (/login)
`loginVD` → `controller.login`

### 刷新令牌 (/refresh-token)
`controller.refreshToken`

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

### 登出错误
- 服务器内部错误

## 与其他模块关系

### 依赖的模型
- `@models/authorization/Account.model`: 账户信息

### 依赖的工具
- `@utils/JwtUtil`: JWT令牌操作
- `@utils/sessionValidator`: 会话验证
- `@utils/response`: 统一响应格式
- `@middlewares/auth`: 认证中间件

### 依赖的中间件
- `@middlewares/auth.authenticate`: 身份验证
- `./middlewares/validator.loginVD`: 登录验证规则

## 性能优化

1. 令牌精简: JWT载荷只包含基本账户信息，减少网络传输
2. 权限延迟加载: 详细权限信息在需要时从数据库查询
3. 会话验证: 仅在必要时查询数据库验证会话状态
4. 索引优化: 确保查询字段有适当索引（code, isActive等）

## 可扩展性

1. 可添加双因素认证
2. 可增加IP白名单机制
3. 可添加登录尝试次数限制
4. 可支持多种认证方式（OAuth等）