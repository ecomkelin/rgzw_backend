# rgzw_backend 项目四层架构规范

## 概述

本项目采用四层架构模式：路由层(Router) → 控制器层(Controller) → 服务层(Service) → 数据访问层(DAO)，每一层都有明确的职责和边界。

## 架构层级说明

### 1. 路由层 (Router)
- **职责**：定义API端点、请求方法和路径映射
- **位置**：`src/modules/*/*.routes.js`
- **规范**：
  - 只负责路由映射，不处理业务逻辑
  - 必须使用认证和授权中间件
  - 只调用对应的控制器方法
  - 路由路径采用复数名词形式，如 `/users`、`/organizations`

### 2. 控制器层 (Controller)
- **职责**：处理HTTP请求/响应、调用服务层
- **位置**：`src/modules/*/*controller.js`
- **规范**：
  - 只负责请求参数传递给服务层，响应服务层结果
  - 不直接操作数据库
  - 统一使用 `asyncHandler` 包装异步函数
  - 统一使用 `ApiResponse` 返回响应
  - 不进行复杂的业务逻辑处理

### 3. 服务层 (Service)
- **职责**：处理业务逻辑、调用DAO层
- **位置**：`src/modules/*/*service.js`
- **规范**：
  - 包含核心业务逻辑和计算
  - 调用DAO层进行数据操作
  - 对敏感字段进行安全处理
  - 在服务层末尾调用 `deleteImmutableFront` 移除前端不可修改字段

### 4. 数据访问层 (DAO)
- **职责**：直接与数据库交互
- **位置**：`src/models/*/*.dao.js`
- **规范**：
  - 只负责数据库CRUD操作
  - 不包含业务逻辑
  - 使用统一的错误处理模式
  - 提供标准化的数据访问接口

## 安全机制

### 字段级安全控制 (`immutableFront` 属性)

在模型定义中使用 `immutableFront` 属性标记不允许从前端修改的字段：

```javascript
// 示例模型定义
const UserDOC = {
  // 正常可修改字段
  name: { type: String, required: true },
  
  // 前端不可修改字段（如创建时间、更新人等）
  createdBy: { type: ObjectId, ref: 'Account', immutable: true },
  updatedBy: { type: ObjectId, ref: 'Account', immutableFront: true },
  lastLoginAt: { type: Date, immutableFront: true }
};
```

### `deleteImmutableFront` 函数使用规范

- **目的**：在服务层移除前端不应修改的字段，防止恶意修改
- **位置**：`src/utils/fieldAttributes.js`
- **使用时机**：
  - 在 `service` 层执行数据更新操作前
  - 用于处理来自前端的更新请求数据

```javascript
// 在 service 文件中使用示例
const { deleteImmutableFront } = require('@/utils/fieldAttributes');
const { UserDOC } = require('@models/organization/structure/User.dao');

async edit(payload, _id, doc) {
  // 在更新前移除前端不应修改的字段
  deleteImmutableFront(doc, UserDOC);
  
  // 继续处理更新逻辑
  const { item } = await UserDAO.edit(payload, _id, doc);
  return { item };
}
```

## 错误处理规范

### 统一错误格式
- 所有错误对象格式：`{ code: Number, message: String }`
- 在 service 层抛出业务错误
- 在 controller 层使用 `ApiResponse.error()` 处理错误响应

### 错误处理流程
1. Service 层：`throw { code: XXX, message: "..." }`
2. Controller 层：通过 `asyncHandler` 捕获并使用 `ApiResponse.error()` 返回响应

## 输入验证规范

### 验证器层级
1. **路由层**：使用 `express-validator` 中间件
2. **控制器层**：通过 `req.validData` 获取验证后的数据

### 验证器定义位置
- 验证器定义在：`src/modules/*/*/middlewares/validator.js`
- 通用验证规则在：`src/utils/validatorHandle.js`

## 依赖注入和模块引用规范

### 别名路径
- `@/` - 指向 `src/`
- `@models/` - 指向 `src/models/`
- `@utils/` - 指向 `src/utils/`
- `@routers/` - 指向 `src/routers/`
- `@middlewares/` - 指向 `src/middlewares/`
- `@modules/` - 指向 `src/modules/`
- `@config/` - 指向 `src/config/`

### 引用规范
- 模块间引用使用别名路径，避免相对路径
- 优先使用绝对路径引用而非相对路径

## 命名规范

### 文件命名
- 路由文件：`index.routes.js`
- 控制器文件：`controller.js`
- 服务文件：`service.js`
- 验证器文件：`middlewares/validator.js`

### 函数命名
- 控制器方法：采用动词 + 名词形式，如 `list`, `detail`, `add`, `edit`
- 服务方法：与控制器保持一致
- 验证器：动词 + `VD` 后缀，如 `listVD`, `addVD`

## 数据库操作安全规范

### NoSQL 注入防护
- DAO 层已实现基础过滤机制
- Service 层构建查询条件时遵循安全规范
- 不直接使用用户输入构造查询对象

### 查询条件安全处理
- 在 service 层验证查询条件的合法性
- 使用白名单机制限制可查询字段
- 防止深度嵌套查询造成的性能问题

## 最佳实践

### 安全性
1. 在 service 层使用 `deleteImmutableFront` 过滤前端不可修改字段
2. 验证器必须验证所有用户输入
3. 使用 JWT 进行认证，实现会话管理
4. 敏感操作实施授权检查

### 性能
1. 在 DAO 层合理使用索引
2. 控制查询结果的数量（分页）
3. 适当使用数据填充（populate）避免 N+1 查询

### 可维护性
1. 保持各层职责清晰分离
2. 统一错误处理模式
3. 完善注释和文档
4. 遵循 DRY 原则

## 示例代码结构

```javascript
// Service 层安全处理示例
async edit(payload, _id, doc) {
  try {
    // 1. 移除前端不应修改的字段
    deleteImmutableFront(doc, UserDOC);
    
    // 2. 权限检查
    if (!payload.isAdmin && payload.currentUser._id.toString() !== _id.toString()) {
      throw { code: 403, message: "无权修改他人信息" };
    }
    
    // 3. 调用 DAO 层
    const { item } = await UserDAO.edit(payload, _id, doc);
    
    return { item };
  } catch (e) {
    console.error('UserSV edit error:', e);
    throw e;
  }
}
```

## 审计和监控

1. 重要操作记录日志
2. 异常情况详细记录
3. 定期审查安全配置
4. 监控数据库查询性能