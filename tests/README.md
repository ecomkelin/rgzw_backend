# 测试说明

本项目采用多层次测试策略，确保代码质量和功能正确性。

## 目录结构

```
tests/
├── unit/                           # 单元测试
│   └── modules/_global/label/      # Label 模块单元测试
│       ├── service.test.js         # 服务层测试
│       ├── controller.test.js      # 控制器层测试
│       └── softDeleteUtils.test.js # 软删除工具测试
├── integration/                    # 集成测试
│   └── modules/_global/label/      # Label 模块集成测试
│       ├── api.test.js            # API 端点测试
│       └── e2e.test.js            # 端到端测试
├── api/                            # API 功能测试
│   └── auth/                       # 认证相关测试
├── performance/                    # 性能测试文件
├── __mocks__/                      # 测试模拟对象
└── jest.setup.js                   # Jest 测试配置
```

## 测试类型说明

### 1. 单元测试 (Unit Tests)
- **目标**: 测试单个函数、方法或类的逻辑
- **位置**: `tests/unit/`
- **特点**: 
  - 快速执行
  - 隔离性强
  - 模拟外部依赖

### 2. 集成测试 (Integration Tests)  
- **目标**: 测试多个组件之间的交互
- **位置**: `tests/integration/`
- **特点**:
  - 测试模块内部的组件交互
  - 可能涉及数据库连接

### 3. API 功能测试 (API Tests)
- **目标**: 测试 REST API 端点
- **位置**: `tests/api/`
- **特点**:
  - 测试真实的 HTTP 请求/响应
  - 验证认证和授权逻辑

## 运行测试

### 运行所有测试
```bash
npm run test
```

### 运行单元测试
```bash
npm run test -- --testPathPattern=unit
```

### 运行集成测试
```bash
npm run test -- --testPathPattern=integration
```

### 运行特定模块测试
```bash
# 运行 Label 模块的单元测试
npm run test -- tests/unit/modules/_global/label/

# 运行 Label 模块的集成测试
npm run test -- tests/integration/modules/_global/label/
```

### 运行带覆盖率报告的测试
```bash
npm run test:coverage
```

### 运行测试并监听文件变化
```bash
npm run test:watch
```

## 编写测试

### 单元测试
- 测试单个函数的输入输出
- 模拟外部依赖（如数据库、网络请求）
- 确保测试速度快且可靠

### 集成测试
- 测试模块内多个组件的交互
- 验证真实数据流
- 模拟真实的使用场景

## 测试命名约定

- `*.test.js` - Jest 测试文件
- `*.spec.js` - 规范测试文件（可选）

## Mock 对象

- 位于 `tests/__mocks__/` 目录
- 提供测试所需的模拟数据和对象
- 确保测试环境的一致性