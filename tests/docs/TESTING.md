# API 测试文档

## 概述

本文档详细介绍了 rgzw_backend 项目的API测试方法，包括自动化测试和手动测试。

## 项目API接口列表

### 1. 认证模块 (`/api/auth`)

#### POST /api/auth/login
- **功能**: 用户登录
- **请求体**: `{ "code": "用户代码", "password": "密码" }`
- **返回**: 访问令牌、刷新令牌、账户信息

#### GET /api/auth/refresh-token
- **功能**: 刷新访问令牌
- **请求头**: 从Cookie获取refreshToken
- **返回**: 新的访问令牌

#### GET /api/auth/logout
- **功能**: 用户登出
- **请求头**: `Authorization: Bearer <access_token>`
- **返回**: 登出成功消息

### 2. 账户模块 (`/api/account`)

#### POST /api/account/list
- **功能**: 获取账户列表
- **权限**: 需要认证 + 读取权限
- **请求头**: `Authorization: Bearer <access_token>`
- **请求体**: `{ "filter": {}, "options": {} }`

#### POST /api/account/detail/:id
- **功能**: 获取账户详情
- **权限**: 需要认证 + 读取权限
- **请求头**: `Authorization: Bearer <access_token>`

#### POST /api/account/edit/:id
- **功能**: 编辑账户信息
- **权限**: 需要认证 + 编辑权限
- **请求头**: `Authorization: Bearer <access_token>`

#### POST /api/account/self
- **功能**: 获取自己的账户信息
- **权限**: 需要认证
- **请求头**: `Authorization: Bearer <access_token>`

#### POST /api/account/edit/self
- **功能**: 编辑自己的账户信息
- **权限**: 需要认证
- **请求头**: `Authorization: Bearer <access_token>`

### 3. 学生模块 (`/api/student`)

#### POST /api/student/list
- **功能**: 获取学生列表
- **权限**: 需要认证 + 读取权限

#### POST /api/student/detail/:id
- **功能**: 获取学生详情
- **权限**: 需要认证 + 读取权限

#### POST /api/student/edit/:id
- **功能**: 编辑学生信息
- **权限**: 需要认证 + 编辑权限

#### POST /api/student/self
- **功能**: 获取自己的学生信息
- **权限**: 需要认证

### 4. 组织模块 (`/api/org`)

#### POST /api/org/list
- **功能**: 获取组织列表
- **权限**: 需要认证 + 读取权限

#### POST /api/org/detail/:id
- **功能**: 获取组织详情
- **权限**: 需要认证 + 读取权限

#### POST /api/org/edit/:id
- **功能**: 编辑组织信息
- **权限**: 需要认证 + 编辑权限

### 5. 用户模块 (`/api/user`)

#### POST /api/user/list
- **功能**: 获取用户列表
- **权限**: 需要认证 + 读取权限

#### POST /api/user/detail/:id
- **功能**: 获取用户详情
- **权限**: 需要认证 + 读取权限

#### POST /api/user/add
- **功能**: 添加用户（同时创建账户）
- **权限**: 需要认证 + 创建权限

#### POST /api/user/edit/:id
- **功能**: 编辑用户信息
- **权限**: 需要认证 + 编辑权限

#### POST /api/user/self
- **功能**: 获取自己的用户信息
- **权限**: 需要认证

## 测试环境准备

### 1. 环境配置
- 确保安装了 Node.js 和 pnpm
- 安装项目依赖: `pnpm install`
- 配置环境变量 `.env` 文件，至少包含:
  ```env
  NODE_ENV=test
  MONGODB_TEST_URI=mongodb://localhost:27017/rgzw_test
  ACCESS_TOKEN_SECRET=your_test_access_secret
  REFRESH_TOKEN_SECRET=your_test_refresh_secret
  ```

### 2. 数据库准备
- 启动 MongoDB 服务
- 运行数据播种: `pnpm run db:seeds:test`

## 自动化测试

### 1. 运行全部测试
```bash
pnpm test
```

### 2. 运行单元测试
```bash
pnpm test -- --testPathPattern=unit
```

### 3. 运行集成测试
```bash
pnpm test -- --testPathPattern=integration
```

### 4. 运行端到端测试
```bash
pnpm test:e2e
```

### 5. 生成测试覆盖率报告
```bash
pnpm test:coverage
```

## 手动测试

### 1. 使用 Postman 或其他 API 客户端

#### 步骤 1: 登录获取令牌
1. 发送 POST 请求到 `/api/auth/login`
2. 提供用户名和密码
3. 保存返回的访问令牌和Cookie中的刷新令牌

#### 步骤 2: 访问受保护的API
1. 在请求头中添加 `Authorization: Bearer <access_token>`
2. 发送请求到受保护的API端点
3. 验证响应是否符合预期

#### 步骤 3: 测试权限控制
1. 使用低权限账户访问高权限API
2. 验证是否返回403禁止访问错误

### 2. 使用 curl 命令测试

#### 登录示例:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"code":"test_user","password":"test_password"}'
```

#### 带认证头访问API示例:
```bash
curl -X POST http://localhost:8000/api/account/self \
  -H "Authorization: Bearer your_access_token_here" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## 测试用例覆盖

### 1. 正常流程测试
- [ ] API接口能够正常响应
- [ ] 返回数据格式正确
- [ ] 数据库操作成功

### 2. 异常流程测试
- [ ] 参数验证错误
- [ ] 认证失败
- [ ] 授权失败
- [ ] 数据库操作失败

### 3. 边界条件测试
- [ ] 空输入验证
- [ ] 超长字符串输入
- [ ] 特殊字符输入
- [ ] 非法ID格式

### 4. 性能测试
- [ ] 并发请求处理能力
- [ ] 大数据量查询性能
- [ ] 负载测试

## 测试数据管理

### 1. 测试数据清理
每次测试结束后，确保清理测试数据，避免影响下次测试结果。

### 2. 测试数据隔离
每个测试用例使用独立的测试数据，避免相互影响。

## 常见问题

### 1. 数据库连接失败
- 确保 MongoDB 服务已启动
- 检查环境变量中的数据库连接字符串

### 2. 认证失败
- 检查是否正确设置了 Authorization 头
- 确认访问令牌未过期

### 3. 权限错误
- 确认用户账户具备相应权限
- 检查权限中间件配置

## CI/CD 集成

在持续集成中，使用以下命令运行测试:
```bash
pnpm test:all
```

确保所有测试通过后才允许代码合并。