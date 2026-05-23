# 技术栈和开发规范

## 关键技术与模式

### 身份验证与授权
- 基于 JWT 的身份验证，刷新令牌存储在 HttpOnly Cookie 中
- 基于角色的权限，具有用户特定的 API 访问控制
- 会话验证防止并发登录
- 多级授权（authenticate、user、student）

### 响应处理
- 使用 ApiResponse 实用程序的标准 API 响应
- 用 asyncHandler 包装的异步处理器，避免在控制器中使用 try/catch
- 集中化的错误处理中间件

### 验证
- 使用 express-validator 进行请求验证
- 预定义验证规则：`createVD`、`updateVD`、`listVD`、`detailVD`、`deleteVD`
- 使用模型定义的枚举进行枚举验证

### 模型规范
- 模型文件使用 `.model.js` 后缀，例如：`User.model.js`、`Account.model.js`
- 模型文件放置于 `src/models/` 目录下，按功能模块分组
- 枚举值通过 `Model.modelEnums` 统一访问，不直接访问模型上的枚举数组
- 模型中包含适当索引定义以优化查询性能
- 使用 `timestamps: true` 自动管理创建和更新时间
- 软删除支持字段（如 `deletedAt`）
- 使用 `immutable: true` 定义创建后不可修改的字段
- 使用 `select: false` 隐藏敏感字段（如密码）
- 使用 `immutableFront: true` 标记前端不可传递的字段

### 服务层规范
- 服务文件使用 `SV` 后缀，如 `UserSV`
- 服务类包含标准 CRUD 方法：`list`, `detail`, `create`, `update`, `delete`
- 包含适当的错误处理和日志记录

### 控制器规范
- 控制器文件使用 `CT` 后缀，如 `UserCT`
- 使用 `asyncHandler` 包装异步函数
- 包含统一错误处理机制

## 命名约定

### 文件
- 模型：`ModelName.model.js`
- 路由：`*.routes.js`
- 控制器：`FeatureCT`（带 CT 后缀）
- 服务：`FeatureSV`（带 SV 后缀）
- 验证器：`validator.js` 在模块的 middlewares 或 utils 文件夹中

### 变量
- 类：PascalCase（`UserService`）
- 函数/变量：camelCase（`getUserById`）
- 常量：UPPER_SNAKE_CASE（`MAX_LENGTH`）

### 路由
- 从目录结构自动生成
- 目录名中的 `_` 前缀从路由路径中删除
- `__` 前缀忽略整个目录

## 关键实用程序

- `asyncHandler.js`: 包装异步函数以处理错误
- `response.js`: 标准化 API 响应格式
- `envValidator.js`: 验证必需的环境变量
- `JwtUtil.js`: JWT 令牌操作
- `sessionValidator.js`: 管理会话以防止并发登录
- `formatOptions.js`: 处理分页和排序参数
- `validatorHandle.js`: 处理请求参数验证
- `routeCollector.js`: 收集和管理路由信息

## 安全特性

- CORS 针对生产和开发环境配置不同
- HttpOnly Cookie 用于刷新令牌
- 全面的输入验证
- 防止并发登录的会话管理
- 基于角色的 API 权限
- 安全的令牌存储和处理
- 刷新令牌使用 Argon2 算法哈希存储
- 并发登录预防机制，确保同一账号不能在多设备同时登录

### 前端安全字段
- 使用 `immutableFront: true` 在模型中标识前端不可修改的字段
- 在服务层使用 `deleteImmutableFront` 工具函数过滤前端传入的不可变字段
- 用于保护系统关键字段（如 `lastLoginAt`、`lastLoginIP`、`updatedBy` 等）不被前端恶意修改

### 权限验证系统
- **认证中间件 (`authenticate`)**: 验证 JWT 令牌的有效性，检查会话状态，防止并发登录
- **用户授权中间件 (`userAuthorize`)**: 检查用户是否有访问特定 API 的权限，非管理员用户需要特定权限才能访问受保护的资源
- **学生授权中间件 (`studentAuthorize`)**: 限制特定操作仅限学生账户使用
- **会话管理**: 通过 `currentSessionId` 字段管理用户会话，确保账号安全
- **权限层级**: 管理员拥有完全访问权限，普通用户和学生账户受到相应限制

## 开发命令

### 运行应用程序
```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 运行测试
pnpm run test                    # 单元测试
pnpm run test:watch            # 监视模式
pnpm run test:coverage         # 覆盖率报告
pnpm run test:e2e              # 端到端测试
pnpm run test:all              # 所有测试

# 数据库操作
pnpm run db:seeds              # 种子数据填充
pnpm run db:seeds:test         # 测试数据库种子数据填充

# 负载测试
pnpm run test:load             # 负载测试脚本
pnpm run test:load:quick       # 快速 autocannon 测试

# 使用 PM2 进行生产部署
pnpm run pm2                   # 使用 PM2 部署
pnpm run pm2:restart           # 重启 PM2 应用
pnpm run pm2:stop              # 停止 PM2 应用
```

### 环境变量
必需的环境变量（参见 `.env.example`）：
- `NODE_ENV`: 环境（dev/test/production）
- `MONGODB_URI`: MongoDB 连接字符串
- `ACCESS_TOKEN_SECRET`: JWT 访问令牌密钥
- `REFRESH_TOKEN_SECRET`: JWT 刷新令牌密钥
- `PORT`: 服务器端口（默认：8000）

## API 文档

- 健康检查可在 `/` 访问
- API 文档可在 `/api` 访问
- 完整 API 列表在 `/api/list`
- 通过路由收集器自动生成 API 文档