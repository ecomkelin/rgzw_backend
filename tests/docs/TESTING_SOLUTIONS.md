# 测试执行说明和解决方案

## 当前状态

当前项目使用了模块别名（如 `@utils`, `@models` 等），这些别名在运行时通过 `module-alias` 包解析，但在测试环境中（特别是Jest）可能出现解析问题。

## 解决方案

### 方案1：修复 Jest 配置（推荐）

我们需要在 package.json 中修改测试脚本，确保模块别名在测试启动时就注册：

```json
{
  "scripts": {
    "test": "node -r module-alias/register -r dotenv/config -e \"require('jest-cli/bin/jest')\"",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand --no-cache"
  }
}
```

### 方案2：修改模块导入方式

将所有别名导入改为相对路径导入。例如：
- `@utils/routeCollector` → `../src/utils/routeCollector`
- `@models/authorization/Account.dao` → `../src/models/authorization/Account.dao`

### 方案3：使用 webpack 风格的别名映射

在 Jest 配置中正确设置 moduleNameMapper，确保所有别名都能被正确映射。

## 临时解决方案

目前可以采取以下措施：

1. 运行基础测试以验证测试环境配置：
```bash
npx jest tests/api/basic.test.js
```

2. 为解决模块别名问题，可以创建一个 Jest 预设环境文件

## 完整解决方案实施步骤

### 步骤1: 创建 Jest 预设环境
创建 `tests/jest.setup.js` 和 `tests/register-aliases.js` 文件

### 步骤2: 修改 Jest 配置
确保 moduleNameMapper 包含所有别名映射

### 步骤3: 更新 package.json 测试脚本
使用正确的启动选项

## 测试执行命令

一旦问题解决，以下命令将可正常运行：

```bash
# 运行所有测试
pnpm test

# 运行特定模块测试
npx jest tests/api/auth.test.js
npx jest tests/api/account.test.js
npx jest tests/api/student.test.js
npx jest tests/api/org.test.js
npx jest tests/api/user.test.js

# 生成覆盖率报告
pnpm test:coverage

# 监视模式
pnpm test:watch
```

## 测试文件状态

- ✅ `tests/api/basic.test.js` - 可以正常运行
- ❌ `tests/api/auth.test.js` - 需要解决模块别名问题
- ❌ `tests/api/account.test.js` - 需要解决模块别名问题
- ❌ `tests/api/student.test.js` - 需要解决模块别名问题
- ❌ `tests/api/org.test.js` - 需要解决模块别名问题
- ❌ `tests/api/user.test.js` - 需要解决模块别名问题

## 环境配置

测试需要以下环境变量（在 `.env.test` 文件中配置）：

```env
NODE_ENV=test
MONGODB_TEST_URI=mongodb://localhost:27017/rgzw_test
ACCESS_TOKEN_SECRET=your_test_access_secret
REFRESH_TOKEN_SECRET=your_test_refresh_secret
ACCESS_TOKEN_EXPIRED=15m
REFRESH_TOKEN_EXPIRED=7d
```

## 注意事项

1. 问题根源在于 `src/routers/__utils/routeLoader.js` 文件中使用了 `@utils/routeCollector` 别名
2. 在测试环境中，该文件被导入时模块别名系统尚未完全初始化
3. 一旦模块别名问题解决，所有测试文件将可以正常运行

## 长期建议

考虑将项目重构为使用相对路径而非模块别名，这样可以避免测试环境中的配置复杂性。或者使用 TypeScript + 路径映射来更好地处理模块导入。