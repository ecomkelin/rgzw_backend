# 项目开发规范

## 项目概述
这是一个基于 Express 和 MongoDB 的后端项目，包含完整的用户认证、权限管理、模型定义等功能。

## 环境配置
```bash
# 复制环境变量模板
cp .env.example .env

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

## 目录结构
```
src/
├── models/           # 数据模型定义
├── modules/          # 功能模块
├── middlewares/      # 中间件
├── utils/            # 工具函数
└── routers/          # 路由
```

## 项目约定

### 模型规范
- 模型文件使用 `.model.js` 后缀
- 枚举值通过 `modelEnums` 统一访问
- 模型中定义的枚举可通过 `Model.modelEnums` 访问

### 路由约定
- 路由文件使用 `.routes.js` 后缀
- 自动扫描 `modules` 目录下的路由文件
- `__` 开头的目录会被忽略, 不会扫描
- `_` 开头的目录, 路由加载的时候 会忽略目录名称

### 验证器规范
- 验证器放在各模块的 `middlewares/validator.js` 文件中
- 使用预定义的验证规则：`createVD`, `updateVD`, `listVD` 等

## 编程模式

### 控制器模式
控制器扩展类并使用 asyncHandler 包装器进行错误处理：
- 方法定义为带有 `asyncHandler` 包装器的类方法
- 响应使用 `ApiResponse` 实用程序进行一致性格式化
- 通过中间件进行标准化错误处理

### 服务模式
业务逻辑封装在服务类中：
- 服务处理业务逻辑，与请求处理分离
- 使用代码和消息进行一致的错误抛出

### 响应模式
所有 API 响应遵循使用 `ApiResponse` 的一致格式：
- 成功响应: `{ code: 200, success: true, message: "...", data: {...} }`
- 错误响应具有标准化的代码和格式

### 错误处理模式
- 错误通过 `asyncHandler` 中间件捕获
- 服务层使用统一的错误格式抛出：`throw({code: Number, message: String})`
- 控制器层接收错误并使用 `ApiResponse.error()` 根据 code 返回适当响应
- 开发环境中详细记录，在生产环境中精简响应
- 自定义错误对象带有 `code` 属性用于正确处理

## 模块结构

`src/modules` 中的每个模块都遵循此结构：
```
_module_name/
├── index.routes.js          # 主路由文件
├── controller.js            # 请求处理程序
├── service.js               # 业务逻辑
├── middlewares/             # 模块特定中间件
│   └── validator.js         # 请求验证
```

## 测试方法

测试位于 `tests` 目录并使用 Jest：
- 单元测试用于单个函数和模块
- API 端点的集成测试
- 完整工作流程的端测试
- 数据库设置/拆卸的测试实用程序

## 数据库播种

数据库初始化通过播种系统处理：
- 位于 `scripts/db/seeds/`
- 支持账户和其他基本数据的初始化
- 使用 `pnpm db:seeds` 运行

## 命令脚本

开发的关键 pnpm 脚本：

- `pnpm dev` - 启动开发服务器并自动重启
- `pnpm test` - 运行单元测试
- `pnpm test:watch` - 在监视模式下运行测试
- `pnpm test:coverage` - 生成测试覆盖报告
- `pnpm test:e2e` - 运行端到端测试
- `pnpm db:seeds` - 使用种子数据初始化数据库
- `pnpm pm2` - 使用 PM2 部署到生产环境
- `pnpm test:load:quick` - 使用 autocannon 快速负载测试

## 代码标准

### 命名规范
- 文件命名：使用小写字母和连字符（如 `user-service.js`）
- 变量和函数：使用驼峰命名法（如 `getUserInfo`）
- 类名：使用帕斯卡命名法（如 `UserService`）
- 常量：使用大写字母和下划线（如 `MAX_RETRY_COUNT`）

### 注释规范
- 使用 JSDoc 风格注释公共方法和类
- 重要的业务逻辑需要注释说明
- 避免冗余注释，代码本身应该是自解释的

### 代码风格
- 使用 ESLint 和 Prettier 保持代码风格一致
- 行长度不超过 100 个字符
- 适当使用空行分隔逻辑块
- 避免深层嵌套，尽量提前返回