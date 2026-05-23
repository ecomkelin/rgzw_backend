# 项目概述

这是一个基于 Express.js 和 MongoDB 的后端应用程序，具有完整的身份验证、授权和模块化架构。该项目采用模块化方法并具有自动路由加载功能，包括完整 CRUD 功能以及适当的错误处理和验证。

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