# 测试指南

## 测试结构
测试文件按照功能模块组织，存放在 `tests/` 目录下：

```
tests/
├── unit/                    # 单元测试
│   └── modules/
│       └── _global/
│           └── label/
│               ├── service.test.js      # 服务层单元测试
│               ├── controller.test.js   # 控制器层单元测试
│               └── softDeleteUtils.test.js # 软删除工具单元测试
├── integration/            # 集成测试
│   └── modules/
│       └── _global/
│           └── label/
│               ├── api.test.js          # API 接口集成测试
│               └── e2e.test.js          # 端到端测试
├── jest.setup.js           # Jest 测试设置
├── __mocks__/              # Mock 文件
├── README.md               # 测试说明文档
├── GUIDE.md                # 测试指南
└── overview.md             # 测试概览
```

## 单元测试模式
单元测试针对每个层级进行，确保各个组件的独立功能正常工作：

**服务层测试 (service.test.js)**:
- 验证业务逻辑的正确性
- 模拟数据库操作和外部依赖
- 验证输入参数处理
- 验证权限控制逻辑
- 验证错误处理机制

**控制器测试 (controller.test.js)**:
- 验证HTTP请求和响应处理
- 验证对服务层方法的正确调用
- 验证错误响应格式
- 验证HTTP状态码

**工具函数测试**:
- 验证工具函数的各个功能分支
- 验证边界条件和错误处理

## 集成测试模式
集成测试验证整个API端点的功能：

**API 测试**:
- 验证完整的API请求-响应周期
- 验证认证和授权机制
- 验证数据持久化
- 验证跨模块交互

**端到端测试**:
- 模拟真实用户场景
- 验证完整的业务流程

## 测试编写最佳实践
1. **Mock 对象**: 使用 Jest 的 mock 功能模拟外部依赖
2. **测试数据**: 使用一致的测试数据结构
3. **测试覆盖**: 务必覆盖成功和失败两种情况
4. **清理**: 在测试结束后清理测试数据
5. **命名**: 使用清晰的测试用例命名约定

## 运行测试
```bash
# 运行所有测试
npm test

# 运行特定模块的测试
npm test -- --testPathPattern="tests/unit/modules/_global/label/"

# 运行单个测试文件
npm test -- --testPathPattern="tests/unit/modules/_global/label/service.test.js"

# 生成测试覆盖率报告
npm run test:coverage
```

## Mock 和测试工具
- 使用 `@utils/response` 模拟响应格式
- 使用 `mongoose.Types.ObjectId()` 生成测试ID
- 使用 `supertest` 进行HTTP请求测试
- 配置 `moduleNameMapper` 处理模块别名