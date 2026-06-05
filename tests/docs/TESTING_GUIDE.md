# 测试执行说明

## 安装依赖

在运行测试之前，请确保已安装所有依赖：

```bash
pnpm install
```

## 环境配置

测试需要以下环境变量，可以在 `.env.test` 文件中配置：

```env
NODE_ENV=test
MONGODB_TEST_URI=mongodb://localhost:27017/rgzw_test
ACCESS_TOKEN_SECRET=test_access_secret_key
REFRESH_TOKEN_SECRET=test_refresh_secret_key
ACCESS_TTL_M=15m
REFRESH_TTL_D=7d
```

## 运行测试

### 1. 运行所有测试

```bash
# 运行所有测试
pnpm test

# 或者使用 npm 命令
npm run test
```

### 2. 运行特定模块测试

```bash
# 运行认证模块测试
npx jest tests/api/auth.test.js

# 运行账户模块测试
npx jest tests/api/account.test.js

# 运行学生模块测试
npx jest tests/api/student.test.js

# 运行组织模块测试
npx jest tests/api/org.test.js

# 运行用户模块测试
npx jest tests/api/user.test.js
```

### 3. 运行测试并生成覆盖率报告

```bash
pnpm test:coverage
```

### 4. 监视模式运行测试

```bash
pnpm test:watch
```

## 测试结构说明

### 测试文件组织

- `tests/test.utils.js`: 测试工具函数，包括数据库连接、清理等功能
- `tests/api/`: 存放各个模块的API测试文件
  - `auth.test.js`: 认证模块测试
  - `account.test.js`: 账户模块测试
  - `student.test.js`: 学生模块测试
  - `org.test.js`: 组织模块测试
  - `user.test.js`: 用户模块测试

### 测试工具函数

`tests/test.utils.js` 提供以下工具函数：

- `startMongoServer()`: 启动内存MongoDB服务器
- `stopMongoServer()`: 关闭内存MongoDB服务器
- `clearDatabase()`: 清空数据库
- `loginAndGetTokens(credentials)`: 登录并获取认证令牌

## 测试用例编写规范

### 基本结构

每个测试文件应遵循以下结构：

```javascript
const {
  request,
  app,
  startMongoServer,
  stopMongoServer,
  clearDatabase,
  loginAndGetTokens
} = require('../test.utils');

describe('Module API', () => {
  beforeAll(async () => {
    await startMongoServer();
  });

  beforeEach(async () => {
    await clearDatabase();
    // 设置测试数据
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await stopMongoServer();
  });

  // 测试用例...
});
```

### 测试断言

- 使用 Jest 的内置断言函数
- 验证HTTP状态码
- 验证响应体结构
- 验证错误处理

## 测试场景覆盖

### 认证模块
- [x] 成功登录
- [x] 登录失败（错误凭据）
- [x] 刷新令牌
- [x] 登出

### 账户模块
- [x] 获取账户列表
- [x] 获取账户详情
- [x] 编辑账户信息
- [x] 获取自己的账户信息
- [x] 编辑自己的账户信息

### 学生模块
- [x] 获取学生列表
- [x] 获取学生详情
- [x] 编辑学生信息
- [x] 获取自己的学生信息

### 组织模块
- [x] 获取组织列表
- [x] 获取组织详情
- [x] 编辑组织信息

### 用户模块
- [x] 获取用户列表
- [x] 获取用户详情
- [x] 添加用户
- [x] 编辑用户信息
- [x] 获取自己的用户信息

## 环境准备

### 数据库种子

在运行测试前，可能需要为测试环境准备初始数据：

```bash
# 为测试环境添加种子数据
pnpm run db:seeds:test
```

### 运行测试的先决条件

1. 确保 MongoDB 服务正在运行（如果使用真实数据库）
2. 如果使用内存数据库（推荐用于测试），无需额外设置
3. 确保环境变量正确配置

## 常见问题解决

### 1. 测试失败：数据库连接超时
- 检查 MongoDB 是否正在运行
- 确认数据库连接字符串是否正确

### 2. 测试失败：认证失败
- 确认测试数据库中存在可用的测试账户
- 检查登录凭据是否正确

### 3. 测试失败：端口冲突
- 确认没有其他应用占用了测试端口
- 检查是否正确设置了 NODE_ENV=test

### 4. 内存泄漏警告
- 确保每个测试完成后都调用了清理函数
- 确保 beforeAll 和 afterAll 配对使用

## CI/CD 集成

在持续集成环境中，使用以下命令：

```bash
# 运行所有测试并生成覆盖率报告
pnpm test:coverage

# 运行端到端测试
pnpm test:e2e
```

确保测试覆盖率达到预设标准（例如 80%）以上。