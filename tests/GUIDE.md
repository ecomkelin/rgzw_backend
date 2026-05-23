# 测试执行指南

本文档介绍如何运行项目中的各类测试。

## 测试环境要求

在运行测试前，请确保：

- Node.js 14.x 或更高版本
- MongoDB 实例（用于集成测试）
- 安装项目依赖：`pnpm`

## 测试命令

### 运行所有测试
```bash
pnpm test
```

### 运行单元测试
```bash
pnpm test -- --testPathPattern=unit
```

### 运行集成测试
```bash
pnpm test -- --testPathPattern=integration
```

### 运行特定模块的测试
```bash
# 运行 Label 模块的单元测试
pnpm test -- tests/unit/modules/_global/label/

# 运行 Label 模块的集成测试
pnpm test -- tests/integration/modules/_global/label/
```

### 运行测试并查看覆盖率
```bash
pnpm test:coverage
```

### 监视模式运行测试（开发时使用）
```bash
pnpm test:watch
```

## 测试分类说明

### 单元测试 (Unit Tests)
- 位于 `tests/unit/`
- 测试单个函数和方法
- 通常会模拟外部依赖
- 执行速度快

### 集成测试 (Integration Tests)
- 位于 `tests/integration/`
- 测试模块间的交互
- 可能涉及数据库连接
- 验证端到端的 API 功能

### API 测试 (API Tests)
- 位于 `tests/api/`
- 测试 REST API 端点
- 验证认证和授权功能

## 测试结构

### Label 模块测试覆盖
- **服务层测试**: 验证业务逻辑和数据操作
- **控制器测试**: 验证 API 端点和响应格式
- **软删除工具测试**: 验证标签软删除功能
- **API 集成测试**: 验证完整 API 工作流
- **端到端测试**: 验证用户完整操作流程

## 常见问题

### 测试连接超时
如果遇到 MongoDB 连接超时问题：
```bash
# 检查 MongoDB 是否正在运行
mongod --version

# 确认连接字符串正确
MONGODB_TEST_URI=mongodb://localhost:27017/test
```

### 模拟对象配置
测试中使用的模拟对象位于 `tests/__mocks__/` 目录下，可根据需要进行调整。

## 测试准则

### 为新功能添加测试
每当添加新功能时：
1. 编写相应的单元测试
2. 编写集成测试以验证端到端功能
3. 确保测试覆盖率不低于 80%

### 测试命名规范
- 测试文件: `*.test.js`
- 测试用例: 描述性名称，如 "should return user profile when valid token provided"

### 测试数据管理
- 使用测试专用的数据库
- 在测试前后清理测试数据
- 避免使用生产数据进行测试