# 科技培训学校管理系统

基于 Node.js/Express 的科技培训学校管理系统，采用四层架构设计（路由 → 控制器 → 服务 → DAO）。

## 项目结构

- `src/` - 主要源代码
  - `models/` - 数据库模型和数据访问对象 (DAO)
  - `modules/` - 功能模块 (认证、组织、学校等)
  - `routers/` - Express 路由系统
  - `controllers/` - 请求处理逻辑
  - `services/` - 业务逻辑处理
  - `middlewares/` - 中间件函数
  - `utils/` - 实用函数

## 主要特性

- **JWT 认证系统** - 基于访问令牌和刷新令牌的安全认证
- **四层架构** - 清晰的职责分离
- **模块化路由** - 自动化路由加载系统
- **权限控制** - 基于角色的访问控制
- **数据安全** - 字段级别安全控制，NoSQL注入防护

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 运行测试
pnpm test

# 生成测试覆盖率报告
pnpm test:coverage
```

## 详细文档

- [项目架构](./doc/ARCHITECTURE.md)
- [开发规范](./CLAUDE.md)
- [版本历史](./version.md)
- [测试指南](./tests/docs/TESTING_GUIDE.md)
- [测试解决方案](./tests/docs/TESTING_SOLUTIONS.md)

## 项目规范

- **编程语言**: JavaScript (ES6+)
- **框架**: Node.js + Express
- **数据库**: MongoDB + Mongoose
- **测试**: Jest + Supertest
- **包管理**: pnpm

## 贡献

请参阅 [CLAUDE.md](./CLAUDE.md) 文件了解项目开发规范和编码约定。