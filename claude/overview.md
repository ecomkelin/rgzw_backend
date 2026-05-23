# 项目概述

## 项目简介
这是一个基于 Express 和 MongoDB 的后端项目，包含完整的用户认证、权限管理、模型定义等功能。该项目采用模块化方法并具有自动路由加载功能，包括完整 CRUD 功能以及适当的错误处理和验证。

## 目录结构
```
src/
├── models/              # 按领域组织的数据模型
│   ├── authorization/   # 认证相关模型
│   ├── organization/    # 组织相关模型
│   └── global/          # 全局模型
├── modules/             # 功能模块（按业务领域组织）
│   ├── _authorization/  # 认证模块
│   ├── _organization/   # 组织模块
│   └── _global/         # 全局功能
├── middlewares/         # Express 中间件
├── utils/              # 工具函数
└── routers/            # 主路由入口
```

## 模块结构
每个模块遵循以下模式：
```
module-name/
├── controller.js       # 使用 asyncHandler 包装的控制器
├── service.js          # 业务逻辑层
├── index.routes.js     # 路由定义
├── middlewares/        # 验证和权限中间件
│   └── validator.js    # 验证规则
└── utils/
    └── validator.js    # 验证规则（旧版本位置）
```

## 自动路由加载
- 路由自动从 `src/modules/` 目录加载
- 后缀为 `.routes.js` 的文件被识别为路由文件
- 名称以 `__` 开头的目录在扫描时被忽略
- 名称以 `_` 开头的目录包含在代码库中，但在路由前缀中排除

## 项目约定

### 模型规范
- 模型文件使用 `.model.js` 后缀
- 枚举值通过 `modelEnums` 统一访问
- 模型中定义的枚举可通过 `Model.modelEnums` 访问

### 路由约定
- 路由文件使用 `.routes.js` 后缀
- 自动扫描 `modules` 目录下的路由文件
- `__` 开头的目录会被忽略，不会扫描
- `_` 开头的目录，路由加载的时候会忽略目录名称

### 验证器规范
- 验证器放在各模块的 `middlewares/validator.js` 文件中
- 使用预定义的验证规则：`createVD`, `updateVD`, `listVD` 等

## 运行项目
```bash
# 复制环境变量模板
cp .env.example .env

# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev
```

## 部署和脚本
- `pnpm run db:seeds` - 初始化数据库种子数据
- `pnpm run db:indexes` - 创建数据库索引
- `pnpm run test` - 运行单元测试
- `pnpm run test:coverage` - 生成覆盖率报告
- `pnpm run pm2` - 使用 PM2 部署到生产环境