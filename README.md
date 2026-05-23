# rgzw 项目文档

## 项目概述
这是一个基于 Express 和 MongoDB 的后端项目，包含完整的用户认证、权限管理、模型定义等功能。

## 环境配置
```bash
# 复制环境变量模板
cp .env.example .env

# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev
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
- 验证器放在各模块的 `utils/validator.js` 文件中
- 使用预定义的验证规则：`createVD`, `updateVD`, `listVD` 等

## 开发规范
详细开发规范请参见 [CODING_STANDARD.md](./CODING_STANDARD.md)

## 数据库脚本
- `npm run db:seeds` - 初始化数据库种子数据
- `npm run db:indexes` - 创建数据库索引

## 测试脚本
- `npm run test` - 运行单元测试
- `npm run test:coverage` - 生成覆盖率报告

## 部署
- `npm run pm2` - 使用 PM2 部署到生产环境