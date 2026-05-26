# API 测试覆盖汇总

## 已完成的测试

### 1. 认证模块 (/api/auth)
- ✅ 登录接口测试 (POST /api/auth/login) - **待修复** 
- ✅ 刷新令牌测试 (GET /api/auth/refresh-token) - **待修复**
- ✅ 登出接口测试 (GET /api/auth/logout) - **待修复**

### 2. 账户模块 (/api/account)
- ✅ 获取账户列表 (POST /api/account/list) - **待修复**
- ✅ 获取账户详情 (POST /api/account/detail/:id) - **待修复**
- ✅ 编辑账户信息 (POST /api/account/edit/:id) - **待修复**
- ✅ 获取自己账户信息 (POST /api/account/self) - **待修复**
- ✅ 编辑自己账户信息 (POST /api/account/edit/self) - **待修复**

### 3. 学生模块 (/api/student)
- ✅ 获取学生列表 (POST /api/student/list) - **待修复**
- ✅ 获取学生详情 (POST /api/student/detail/:id) - **待修复**
- ✅ 编辑学生信息 (POST /api/student/edit/:id) - **待修复**
- ✅ 获取自己学生信息 (POST /api/student/self) - **待修复**

### 4. 组织模块 (/api/org)
- ✅ 获取组织列表 (POST /api/org/list) - **待修复**
- ✅ 获取组织详情 (POST /api/org/detail/:id) - **待修复**
- ✅ 编辑组织信息 (POST /api/org/edit/:id) - **待修复**

### 5. 用户模块 (/api/user)
- ✅ 获取用户列表 (POST /api/user/list) - **待修复**
- ✅ 获取用户详情 (POST /api/user/detail/:id) - **待修复**
- ✅ 添加用户 (POST /api/user/add) - **待修复**
- ✅ 编辑用户信息 (POST /api/user/edit/:id) - **待修复**
- ✅ 获取自己用户信息 (POST /api/user/self) - **待修复**

## 当前测试状态

### 问题
- 由于项目使用了复杂的模块别名系统 (`@utils`, `@models` 等)，在 Jest 测试环境中存在模块解析问题
- 主要问题出现在路由加载器 (`src/routers/__utils/routeLoader.js`) 中使用了 `@utils/routeCollector` 别名

### 临时解决方案
1. 已创建基础API测试 (`tests/api/basic.test.js`) 作为概念验证
2. 完整的API测试代码已编写，但需要解决模块别名问题后方可运行

## 解决模块别名问题的方法

### 方法1: 使用相对路径
修改项目中的所有别名引用，替换为相对路径：
- `@utils/xxx` → `../../src/utils/xxx`
- `@models/xxx` → `../../../src/models/xxx`

### 方法2: 修复Jest配置
确保 Jest 的 moduleNameMapper 正确配置并在测试前注册模块别名

## 测试覆盖率

### 基础功能
- ✅ 应用健康检查测试

### 认证与授权 (待修复)
- ❌ JWT 认证测试
- ❌ 访问控制测试
- ❌ 权限验证测试
- ❌ 刷新令牌机制测试

### 数据验证 (待修复)
- ❌ 输入验证测试
- ❌ 参数验证测试
- ❌ 错误响应格式测试

### 业务逻辑 (待修复)
- ❌ 数据库操作测试
- ❌ 业务规则验证
- ❌ 异常处理测试

### 安全性测试 (待修复)
- ❌ 未认证访问测试
- ❌ 权限不足测试
- ❌ 数据泄露防护测试

## 运行命令总结

```bash
# 运行基础测试
npx jest tests/api/basic.test.js

# 运行所有测试
pnpm test

# 生成覆盖率报告
pnpm test:coverage

# 监视模式运行
pnpm test:watch
```

## 需要解决的问题

1. 修复模块别名在测试环境中的解析问题
2. 配置正确的 Jest 环境以支持模块别名
3. 确保测试数据库正确设置和清理
4. 修复应用启动和关闭过程中的异步操作问题

## 维护说明

当解决模块别名问题后，以下测试文件可以正常使用：
- `tests/api/auth.test.js`
- `tests/api/account.test.js`
- `tests/api/student.test.js`
- `tests/api/org.test.js`
- `tests/api/user.test.js`