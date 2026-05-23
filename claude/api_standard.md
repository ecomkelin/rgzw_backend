# 完整接口开发标准（以 Label 模块为例）

## 通用模块创建规范

### 模块复制开发模式
当创建新模块时（例如创建course模块），推荐采用现有模块的复制模式：
1. 复制现有相似模块的完整结构（如label模块）
2. 将所有label相关的标识符替换为新模块名（如course）
3. 修改数据模型定义以匹配新模块的业务需求
4. 调整验证规则、控制器逻辑和服务层方法以适应新模块特性
5. 保留原有架构模式（routes → validators → controllers → services → models）

此方法有助于：
- 提高开发效率
- 保证代码结构一致性
- 减少样板代码编写错误
- 维持统一的开发规范

## 1. 路由层（index.routes.js）
路由文件负责连接各个组件，包含以下部分：
- 引入必要的模块：Express Router、控制器、验证器中间件、权限中间件
- 按照 RESTful 设计模式定义路由：
  - POST /list: 获取列表
  - GET /:id: 获取详情
  - POST /create: 创建资源
  - PUT /:id: 更新资源
  - DELETE /:id: 删除资源
  - POST /deleteIds: 批量删除资源
- 集成认证和权限控制中间件
- 集成验证器中间件
- 映射路由到控制器方法
- 权限验证中间件应用：
  - `authenticate`: 基础身份验证，验证JWT令牌和会话有效性
  - `userAuthorize`: 用户权限验证，检查用户是否有访问特定API的权限
  - `studentAuthorize`: 学生权限验证，限制操作仅对学生账户开放

## 2. 验证器层（middlewares/validator.js）
验证器负责验证输入参数，包含以下标准：
- 使用 `commonBodyRules`、`commonParamRules`、`commonQueryRules` 定义验证规则
- 预定义验证规则：`createVD`（创建）、`updateVD`（更新）、`listVD`（列表）、`detailVD`（详情）、`deleteVD`（删除）、`deleteIdsVD`（批量删除）
- 对于创建操作：通常要求 Body 参数中包含必填字段
- 对于更新操作：验证路径参数和可选的 Body 参数
- 对于列表查询：验证 Query 参数并设置合理的默认值
- 对于详情、删除操作：主要验证路径参数的 ObjectId 格式
- 使用 `validatorErrorHandle` 统一处理验证错误
- **特殊说明（列表接口的复杂验证）**：
  - `regExp` 模糊查询：接受字符串类型的模糊搜索参数，验证长度限制
  - `options` 配置对象：包含分页、排序等参数，使用 `validatorOptions` 验证格式
  - 分页参数验证：page（页码）必须是 ≥1 的整数，pageSize（每页数量）必须在 [1, MAX_HANDLE_ITEM] 范围内
  - 排序参数验证：sortObj 必须是对象格式，键值对中的值只能是 1（升序）或 -1（降序）

## 3. 控制器层（controller.js）
控制器负责处理请求和响应，包含以下标准：
- 使用类结构封装控制器方法
- 使用 `asyncHandler` 包装所有异步方法
- 标准方法包括：`list`、`detail`、`create`、`update`、`delete`、`deleteIds`
- 正确处理各种 HTTP 状态码：
  - 200: 成功响应
  - 201: 创建成功
  - 400: 请求错误
  - 401: 未授权
  - 403: 禁止访问
  - 404: 资源不存在
  - 409: 冲突（如重复数据）
  - 500: 服务器内部错误
- 使用 `ApiResponse` 工具返回标准化响应
- 针对特定错误消息进行分类处理并返回适当的状态码

## 4. 服务层（service.js）
服务层负责业务逻辑处理，包含以下标准：
- 使用类结构封装业务方法
- 实现完整的 CRUD 操作：`list`、`detail`、`create`、`update`、`delete`、`deleteMany`
- 在查询时根据用户权限应用适当的过滤条件
- 处理分页和排序逻辑
- 对于创建和更新操作：设置必要的字段（如 `Org`、`createdBy`、`updatedBy`）
- 安全性措施：阻止用户修改关键字段（如 `_id`、`Org`、`createdAt`）
- 处理软删除和硬删除逻辑
- 返回填充后的完整文档信息
- 实现批量操作的安全限制（如最大数量限制）
- 使用 `deleteImmutableFront` 工具函数过滤前端传入的不可变字段
- 刷新令牌采用 Argon2 算法哈希存储以增强安全性
- **特殊说明（列表接口的复杂处理）**：
  - 使用 `formatOptions` 函数处理分页和排序参数
  - 从 `formatOptions` 返回 `pageSize`、`skip`、`sort` 参数
  - 处理 `regExp` 模糊搜索：将 `regExp` 参数转换为 MongoDB 正则表达式查询 `{ $regex: regExp, $options: 'i' }`
  - 应用权限过滤：非管理员用户只能查看自己组织的数据
  - 应用状态过滤：非管理员用户只能查看活跃数据（isActive: true）
  - 计算分页信息：包括当前页、每页数量、总数和总页数

## 5. 模型层（Model.model.js）
模型层定义数据结构，包含以下标准：
- 定义枚举类型并在模型上暴露以便验证器使用
- 设置必需字段和默认值
- 定义与其他模型的引用关系
- 创建合适的索引以提高查询性能
- 包含软删除支持字段（如 `deletedAt`）
- 使用 `timestamps: true` 自动管理创建和更新时间
- 暴露枚举值、文档结构和其他元数据供其他层使用
- 使用 `immutableFront: true` 标记前端不可修改的字段（如 `lastLoginAt`、`updatedBy` 等）
- 在服务层使用 `deleteImmutableFront` 工具函数来过滤前端传递的不可变字段