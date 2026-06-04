# Src 目录结构说明

本目录包含项目的源代码，按功能和业务领域进行组织。

## 目录结构

```
src/
├── __tests__/              # 单元测试文件
│   ├── setup.js            # 测试环境设置
│   ├── setup.local.js      # 本地测试环境设置
│   └── test.utils.js       # 测试工具函数
├── config/                 # 配置文件
│   └── permission.config.js # 权限配置
├── demo.js                 # 示例代码文件（待完善或删除）
├── e2e/                    # 端到端测试
│   ├── __tests__/          # E2E测试文件
│   └── setup.js            # E2E测试设置
├── main.js                 # 应用主入口文件
├── middlewares/            # Express 中间件
│   ├── auth.js             # 认证中间件
│   ├── error.js            # 错误处理中间件
│   ├── logger.js           # 日志中间件
│   └── monitor.js          # 监控中间件
├── models/                 # 数据模型层 (按业务领域分组)
│   ├── authorization/      # 授权相关模型
│   ├── business/           # 业务相关模型
│   ├── global/             # 全局模型
│   ├── organization/       # 组织模型
│   └── student/            # 学生模型
├── modules/                # 业务模块 (按功能模块分组)
│   ├── _authorization/     # 授权模块
│   ├── _global/            # 全局模块
│   └── _organization/      # 组织模块
├── routers/                # 路由器层
│   ├── __utils/            # 路由工具函数
│   └── index.js            # 路由主入口
└── utils/                  # 通用工具函数
    ├── JwtUtil.js          # JWT工具
    ├── cache.js            # 缓存工具
    ├── common.js           # 通用工具
    ├── envValidator.js     # 环境变量验证器
    ├── formatOptions.js    # 格式化选项
    ├── response.js         # 响应工具
    ├── routeCollector.js   # 路由收集器
    ├── sessionValidator.js # 会话验证器
    ├── validatorHandle.js  # 验证处理器
    └── validatorModel.js   # 验证模型
```

## 设计理念

### 1. Models 层 (按业务领域)
- `authorization/` - 授权、权限相关模型
- `business/` - 业务相关模型
- `global/` - 全局共享模型
- `organization/` - 组织架构相关模型
- `student/` - 学生相关模型

### 2. Modules 层 (按功能模块)
- `modules/_authorization/` - 认证授权功能模块
- `modules/_global/` - 全局功能模块
- `modules/_organization/` - 组织功能模块

### 3. 分层架构
- **Models**: 数据模型层，负责数据操作
- **Modules**: 业务逻辑层，实现具体业务功能
- **Routers**: 路由层，处理请求路由
- **Middlewares**: 中间件层，提供跨切面功能
- **Utils**: 工具层，提供通用工具函数

## 项目入口

`main.js` 是应用的入口文件，负责：
1. 初始化 Express 应用
2. 配置中间件
3. 连接数据库
4. 加载路由
5. 启动服务器

## 注意事项

- 目录名中的下划线前缀表示内部或私有模块
- 模块化设计使得功能隔离清晰
- 按业务领域组织模型便于维护
- 通用工具函数集中管理便于复用