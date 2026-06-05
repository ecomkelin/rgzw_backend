# src 目录结构说明

> 本目录是后端项目的核心源代码。**`v8.0.0` 整理**——架构、模块命名、工具函数均已与现状对齐。

## 1. 目录结构（实际项目）

```
src/
├── main.js                    # 入口：初始化 Express、加载中间件、注册路由、启动服务
│
├── models/                    # 数据模型层（model.js 定义 schema，dao.js 提供 CRUD）
│   ├── authorization/         #   - 账户、权限模型
│   │   ├── Account.model.js
│   │   ├── Account.dao.js
│   │   └── __roleApi/         #   - API 权限相关（__ 前缀，未启用）
│   │       ├── ApiPermission.model.js
│   │       ├── ApiRole.model.js
│   │       ├── DepartmentApiRole.model.js
│   │       ├── UserApiPermission.model.js
│   │       └── UserApiRole.model.js
│   │   └── __rolePage/        #   - 页面权限（__ 前缀，未启用）
│   ├── organization/          #   - 组织架构
│   │   ├── structure/         #     - Org / User
│   │   │   ├── Org.model.js
│   │   │   ├── Org.dao.js
│   │   │   ├── User.model.js
│   │   │   ├── User.dao.js
│   │   │   └── __Dept.model.js
│   │   ├── physical/          #     - 物理资源（Room）
│   │   │   └── Room.model.js + Room.dao.js
│   │   ├── __finance/         #     - 财务（__ 前缀，未启用）
│   │   └── __salary/          #     - 薪酬（__ 前缀，未启用）
│   ├── school/                #   - 学校核心
│   │   ├── course/            #     - Subject / Course
│   │   ├── lesson/            #     - Lesson / Attendance / Work / Evaluation
│   │   └── student/           #     - Student / StudentCourse / StudentPack
│   ├── pack/                  #   - 课包（Pack / OrderPack）
│   └── __global/              #   - 全局（Category / Label，__ 前缀）
│
├── modules/                   # 业务模块层（每个模块内部都是四层架构）
│   ├── _authorization/        #   - auth（登录/刷新/切换身份/登出）、account
│   │   ├── auth/
│   │   │   ├── index.routes.js
│   │   │   ├── index.routes.desc.js    # 端点清单（与 index.routes.js 一一对应）
│   │   │   ├── controller.js
│   │   │   ├── service.js
│   │   │   ├── apiDesc.md              # 该模块的 API 详细文档
│   │   │   ├── README.md               # 该模块的业务流程说明
│   │   │   ├── MODELS_AND_FEATURES.md  # 模型字段表 + 字段可写性
│   │   │   └── middlewares/validator.js
│   │   └── account/                     # 同上结构
│   ├── _organization/         #   - org / user / room
│   └── _school/               #   - course / student / pack / subject
│
├── middlewares/               # 通用中间件
│   ├── auth.js                #   - authenticate / userAuthorize
│   ├── error.js               #   - 全局错误处理
│   ├── logger.js              #   - 请求日志
│   └── monitor.js             #   - 监控指标
│
├── utils/                     # 通用工具
│   ├── JwtUtil.js             #   - JWT 生成 / 验证
│   ├── response.js            #   - ApiResponse 统一响应格式
│   ├── payloadChecker.js      #   - payload 完整性校验
│   ├── fieldAttributes.js     #   - deleteImmutableFront
│   ├── envValidator.js        #   - 启动期 ENV 校验
│   ├── sessionValidator.js    #   - session 检查开关
│   ├── validatorHandle.js     #   - 通用 validator 规则
│   ├── validatorModel.js      #   - validator 工厂
│   ├── formatOptions.js       #   - list options 格式化
│   ├── routeCollector.js      #   - 路由自动收集
│   ├── cache.js               #   - 缓存封装
│   └── common.js              #   - 公共函数
│
└── routers/                   # 路由系统
    ├── index.js               #   - 入口：自动加载 src/modules/**/*.routes.js
    └── __utils/               #   - 路由扫描工具
```

---

## 2. 设计理念

### 2.1 分层架构（**四层**）

```
┌──────────────────────────┐
│  Route  路由层            │  src/modules/*/index.routes.js
└──────────┬───────────────┘
           ↓
┌──────────────────────────┐
│  Controller  控制器层     │  src/modules/*/controller.js
└──────────┬───────────────┘
           ↓
┌──────────────────────────┐
│  Service  业务逻辑层      │  src/modules/*/service.js
└──────────┬───────────────┘
           ↓
┌──────────────────────────┐
│  DAO  数据访问层          │  src/models/*/*.dao.js
└──────────────────────────┘
```

每层职责：

| 层 | 职责 | 不可做的事 |
|---|---|---|
| **Route** | URL 映射 + 中间件链编排 | 业务逻辑 |
| **Controller** | 解析请求 / 调用 service / 返回响应 | 业务逻辑、数据库操作 |
| **Service** | 业务逻辑编排 / 权限校验 / `deleteImmutableFront` | 直接操作 DB |
| **DAO** | 纯 CRUD / `payloadChecker` / 业务规则落地 | 跨实体协调 |

### 2.2 自动路由扫描规则

`src/routers/index.js` 启动时扫描 `src/modules/**/*.routes.js`：

- ✅ 扫描所有以 `.routes.js` 结尾的文件
- ❌ **`__` 前缀的目录/文件不扫描**（如 `src/modules/__test/`、`src/models/authorization/__roleApi/`）
- ⚠️ **`_` 前缀的目录收录，但路径里跳过目录名**
  - 例：`src/modules/_authorization/auth/` → URL `/api/auth`
  - 例：`src/modules/_organization/org/` → URL `/api/org`

### 2.3 Models 层（按业务领域组织）

- `authorization/` - 账户、权限
- `organization/` - 机构、用户、教室
- `school/` - 课程、学员、课次
- `pack/` - 课包产品

每个 model 通常有 2 个文件：
- `Xxx.model.js` - Mongoose schema + enums + DOC 导出
- `Xxx.dao.js` - CRUD + 业务规则（`list` / `detail` / `add` / `edit` / `remove`）

### 2.4 Modules 层（按功能模块组织）

- `_authorization/` - 认证授权（auth、account）
- `_organization/` - 组织管理（org、user、room）
- `_school/` - 学校业务（course、student、pack、subject）

---

## 3. 入口启动流程（`main.js`）

```
1. 加载 .env
   ↓
2. envValidator 校验必需环境变量（缺则启动失败）
   ↓
3. 连接 MongoDB
   ↓
4. 初始化 Express app
   ↓
5. 注册全局中间件（cookie-parser / cors / logger / error）
   ↓
6. 注册路由（自动扫描 src/modules/**/*.routes.js）
   ↓
7. 启动 HTTP 监听（PORT，默认 8000）
```

---

## 4. 关键约定

### 4.1 错误抛出

```javascript
// DAO / Service 层：抛业务错误
throw ({ code: 404, message: '账户不存在' });

// Controller 层：捕获 + 转换为响应
try { ... } catch (e) {
  return res.status(e.code || 500).json(ApiResponse.error(e));
}
```

### 4.2 响应格式

```json
{ "code": 200, "success": true, "message": "操作成功", "data": {} }
```

- 列表：`data = { total, items }`
- 详情：`data = { item }`
- 自定义：`data = { itemAccount, itemStudent }`（参考 student/add 响应）

### 4.3 字段保护

| 标记 | 含义 | 行为 |
|---|---|---|
| `immutable: true` | 服务端任何位置都不允许改 | MongoDB 写入时会拒绝 |
| `immutableFront: true` | 前端不可改，但 service / DAO 可改 | `deleteImmutableFront` 会在 service 层剔除 |

### 4.4 软删除

统一通过 `isActive: false` 实现；**不**提供物理删除端点（除 Pack 模块有 `/remove` 但拒绝有 OrderPack 的）。

### 4.5 事务

`process.env.ACID === 'on'` 时启用 Mongoose 事务（仅 student/add、user/add 等少数端点）。当前项目**未上线**，事务暂未启用。

---

## 5. 常用导入路径

`package.json` `_moduleAliases` 定义的别名：

| 别名 | 指向 |
|---|---|
| `@/` | `src/` |
| `@models/` | `src/models/` |
| `@modules/` | `src/modules/` |
| `@middlewares/` | `src/middlewares/` |
| `@utils/` | `src/utils/` |
| `@routers/` | `src/routers/` |
| `@config/` | `src/config/` |

---

## 6. 关联文档

- [README.md](../README.md) - 项目根入口
- [doc/ARCHITECTURE.md](../doc/ARCHITECTURE.md) - 四层架构详细规范
- [doc/DEVELOPMENT_STANDARD.md](../doc/DEVELOPMENT_STANDARD.md) - 编码规范
- [DOCS/API_DOCUMENTATION.md](../DOCS/API_DOCUMENTATION.md) - API 端点索引
