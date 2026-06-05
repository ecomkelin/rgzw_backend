# RGZW 后端 API 端点清单

> 本文档为 **后端全部 HTTP 端点的索引页**。每个端点的详细说明（请求/响应/权限/字段）请到对应模块的 `apiDesc.md` 查阅。
> 路径前缀：`/api`，全部走 `POST`（仅 `auth/refresh-token` 用 `GET`）。

## 1. 全局约定

### 1.1 认证
- 除 `POST /api/auth/login` 与 `GET /api/auth/refresh-token` 外，所有端点都需要 `Authorization: Bearer <accessToken>`。
- `refreshToken` 通过 **HttpOnly Cookie** 自动携带。
- 详细说明：[src/modules/_authorization/auth/apiDesc.md](../src/modules/_authorization/auth/apiDesc.md)

### 1.2 权限中间件
| 中间件 | 规则 |
|---|---|
| `authenticate` | 校验 accessToken 有效 + sessionId 一致 |
| `userAuthorize` | 仅 `User` 账户；非 admin 必须有 API 权限（详见 ApiPermission） |
| `readPermission` | 读权限（admin / manager） |
| `addPermission` | 写权限（admin / manager） |
| `editPermission` | 编辑权限（admin / manager） |
| `managePermission` | 删除权限（admin / manager） |

### 1.3 响应格式
```json
{ "code": 200, "success": true, "message": "操作成功", "data": { "item": {} } }
```
- 列表接口：`data = { total, items }`
- 详情接口：`data = { item }`
- 自定义场景：`data = { itemAccount, itemStudent }` 等

### 1.4 错误码
| `code` | 含义 |
|---|---|
| 200 | 成功 |
| 400 | 参数/业务校验失败 |
| 401 | 未登录 / token 过期 / session 失效 |
| 403 | 权限不足 / 跨 Org 操作 |
| 404 | 资源不存在 / 被禁用 |
| 500 | 服务器内部错误 |

---

## 2. 端点总表

### 2.1 认证模块 — `_authorization/auth` （前缀 `/api/auth`）
| 方法 | 路径 | 鉴权 | 详细 |
|---|---|---|---|
| POST | `/login` | 公开 | [apiDesc.md](../src/modules/_authorization/auth/apiDesc.md#1-用户登录) |
| GET  | `/refresh-token` | Cookie | [apiDesc.md](../src/modules/_authorization/auth/apiDesc.md#2-刷新访问令牌) |
| POST | `/switch-role/:id` | authenticate | [apiDesc.md](../src/modules/_authorization/auth/apiDesc.md#3-切换身份) |
| POST | `/logout` | authenticate | [apiDesc.md](../src/modules/_authorization/auth/apiDesc.md#4-用户登出) |

### 2.2 账户模块 — `_authorization/account` （前缀 `/api/account`）
| 方法 | 路径 | 鉴权 | 详细 |
|---|---|---|---|
| POST | `/list` | authenticate + readPermission | [apiDesc.md](../src/modules/_authorization/account/apiDesc.md#1-获取账号列表) |
| POST | `/detail/:id` | authenticate + readPermission | [apiDesc.md](../src/modules/_authorization/account/apiDesc.md#2-获取账号详情) |
| POST | `/edit/:id` | authenticate + editPermission | [apiDesc.md](../src/modules/_authorization/account/apiDesc.md#3-更新账号) |
| POST | `/self` | authenticate | [apiDesc.md](../src/modules/_authorization/account/apiDesc.md#4-获取当前登录账号信息) |
| POST | `/edit/self` | authenticate | [apiDesc.md](../src/modules/_authorization/account/apiDesc.md#5-更新当前登录账号信息) |
| — | `/add` | 内部 | 不提供独立路由，由 `user/add` / `student/add` 在事务内调用 |

### 2.3 机构模块 — `_organization/org` （前缀 `/api/org`）
| 方法 | 路径 | 鉴权 | 详细 |
|---|---|---|---|
| POST | `/list` | authenticate + readPermission | [apiDesc.md](../src/modules/_organization/org/apiDesc.md#1-获取机构列表) |
| POST | `/detail/:id` | authenticate + readPermission | [apiDesc.md](../src/modules/_organization/org/apiDesc.md#2-获取机构详情) |
| POST | `/add` | authenticate + addPermission | [apiDesc.md](../src/modules/_organization/org/apiDesc.md#3-创建机构) |
| POST | `/edit/:id` | authenticate + editPermission | [apiDesc.md](../src/modules/_organization/org/apiDesc.md#4-更新机构) |
| POST | `/self` | authenticate | [apiDesc.md](../src/modules/_organization/org/apiDesc.md#5-获取当前用户所属机构) |

### 2.4 用户模块 — `_organization/user` （前缀 `/api/user`）
| 方法 | 路径 | 鉴权 | 详细 |
|---|---|---|---|
| POST | `/list` | authenticate + readPermission | [apiDesc.md](../src/modules/_organization/user/apiDesc.md#1-获取用户列表) |
| POST | `/detail/:id` | authenticate + readPermission | [apiDesc.md](../src/modules/_organization/user/apiDesc.md#2-获取用户详情) |
| POST | `/add` | authenticate + addPermission | [apiDesc.md](../src/modules/_organization/user/apiDesc.md#3-创建用户) |
| POST | `/edit/:id` | authenticate + editPermission | [apiDesc.md](../src/modules/_organization/user/apiDesc.md#4-更新用户信息) |
| POST | `/self` | authenticate + userAuthorize + selfEditVD | [apiDesc.md](../src/modules/_organization/user/apiDesc.md#5-当前用户自助操作) |

### 2.5 教室模块 — `_organization/room` （前缀 `/api/room`）
| 方法 | 路径 | 鉴权 | 详细 |
|---|---|---|---|
| POST | `/list` | authenticate + userAuthorize + readPermission | [apiDesc.md](../src/modules/_organization/room/apiDesc.md#1-获取教室列表) |
| POST | `/detail/:id` | authenticate + userAuthorize + readPermission | [apiDesc.md](../src/modules/_organization/room/apiDesc.md#2-获取教室详情) |
| POST | `/add` | authenticate + userAuthorize + addPermission | [apiDesc.md](../src/modules/_organization/room/apiDesc.md#3-创建教室) |
| POST | `/edit/:id` | authenticate + userAuthorize + editPermission | [apiDesc.md](../src/modules/_organization/room/apiDesc.md#4-更新教室信息) |
| — | `/remove/:id` | 当前路由已注释 | 暂未启用 |

### 2.6 课程模块 — `_school/course` （前缀 `/api/course`）
| 方法 | 路径 | 鉴权 | 详细 |
|---|---|---|---|
| POST | `/list` | authenticate | [apiDesc.md](../src/modules/_school/course/apiDesc.md#1-获取课程列表) |
| POST | `/detail/:id` | authenticate | [apiDesc.md](../src/modules/_school/course/apiDesc.md#2-获取课程详情) |
| POST | `/add` | authenticate + addPermission | [apiDesc.md](../src/modules/_school/course/apiDesc.md#3-创建课程) |
| POST | `/edit/:id` | authenticate + editPermission | [apiDesc.md](../src/modules/_school/course/apiDesc.md#4-更新课程信息) |
| — | `/remove/:id` | 当前路由已注释 | 暂未启用 |

### 2.7 科目模块 — `_school/subject` （前缀 `/api/subject`）
| 方法 | 路径 | 鉴权 | 详细 |
|---|---|---|---|
| POST | `/list` | authenticate + userAuthorize + readPermission | [apiDesc.md](../src/modules/_school/subject/apiDesc.md#1-获取科目列表) |
| POST | `/detail/:id` | authenticate + userAuthorize + readPermission | [apiDesc.md](../src/modules/_school/subject/apiDesc.md#2-获取科目详情) |
| POST | `/add` | authenticate + userAuthorize + addPermission | [apiDesc.md](../src/modules/_school/subject/apiDesc.md#3-创建科目) |
| POST | `/edit/:id` | authenticate + userAuthorize + editPermission | [apiDesc.md](../src/modules/_school/subject/apiDesc.md#4-更新科目信息) |
| — | `/remove/:id` | 当前路由已注释 | 暂未启用 |

### 2.8 学生模块 — `_school/student` （前缀 `/api/student`）
| 方法 | 路径 | 鉴权 | 详细 |
|---|---|---|---|
| POST | `/list` | authenticate + readPermission | [apiDesc.md](../src/modules/_school/student/apiDesc.md#1-获取学生列表) |
| POST | `/detail/:id` | authenticate + readPermission | [apiDesc.md](../src/modules/_school/student/apiDesc.md#2-获取学生详情) |
| POST | `/add` | authenticate + addPermission | [apiDesc.md](../src/modules/_school/student/apiDesc.md#3-创建学生) |
| POST | `/edit/:id` | authenticate + editPermission | [apiDesc.md](../src/modules/_school/student/apiDesc.md#4-更新学生信息) |
| — | `/self`、`/self/edit` | 当前路由已注释 | 计划启用 |

### 2.9 课包模块 — `_school/pack` （前缀 `/api/pack`）
| 方法 | 路径 | 鉴权 | 详细 |
|---|---|---|---|
| POST | `/list` | authenticate + userAuthorize + readPermission | [apiDesc.md](../src/modules/_school/pack/apiDesc.md#1-获取课包列表) |
| POST | `/detail/:id` | authenticate + userAuthorize + readPermission | [apiDesc.md](../src/modules/_school/pack/apiDesc.md#2-获取课包详情) |
| POST | `/add` | authenticate + userAuthorize + addPermission | [apiDesc.md](../src/modules/_school/pack/apiDesc.md#3-创建课包) |
| POST | `/edit/:id` | authenticate + userAuthorize + editPermission | [apiDesc.md](../src/modules/_school/pack/apiDesc.md#4-更新课包信息) |
| POST | `/remove/:id` | authenticate + userAuthorize + managePermission | [apiDesc.md](../src/modules/_school/pack/apiDesc.md#5-删除课包) |

---

## 3. 模块—目录索引

| 模块目录 | 对应 URL 前缀 | 入口路由 | apiDesc.md |
|---|---|---|---|
| `src/modules/_authorization/auth/` | `/api/auth` | [index.routes.js](../src/modules/_authorization/auth/index.routes.js) | [apiDesc.md](../src/modules/_authorization/auth/apiDesc.md) |
| `src/modules/_authorization/account/` | `/api/account` | [index.routes.js](../src/modules/_authorization/account/index.routes.js) | [apiDesc.md](../src/modules/_authorization/account/apiDesc.md) |
| `src/modules/_organization/org/` | `/api/org` | [index.routes.js](../src/modules/_organization/org/index.routes.js) | [apiDesc.md](../src/modules/_organization/org/apiDesc.md) |
| `src/modules/_organization/user/` | `/api/user` | [index.routes.js](../src/modules/_organization/user/index.routes.js) | [apiDesc.md](../src/modules/_organization/user/apiDesc.md) |
| `src/modules/_organization/room/` | `/api/room` | [index.routes.js](../src/modules/_organization/room/index.routes.js) | [apiDesc.md](../src/modules/_organization/room/apiDesc.md) |
| `src/modules/_school/course/` | `/api/course` | [index.routes.js](../src/modules/_school/course/index.routes.js) | [apiDesc.md](../src/modules/_school/course/apiDesc.md) |
| `src/modules/_school/subject/` | `/api/subject` | [index.routes.js](../src/modules/_school/subject/index.routes.js) | [apiDesc.md](../src/modules/_school/subject/apiDesc.md) |
| `src/modules/_school/student/` | `/api/student` | [index.routes.js](../src/modules/_school/student/index.routes.js) | [apiDesc.md](../src/modules/_school/student/apiDesc.md) |
| `src/modules/_school/pack/` | `/api/pack` | [index.routes.js](../src/modules/_school/pack/index.routes.js) | [apiDesc.md](../src/modules/_school/pack/apiDesc.md) |

---

## 4. 数据库模型速查（按业务模块分组）

> 完整字段定义见 `src/models/**/*.model.js`。

### 4.1 授权模块
| 模型 | 路径 | 说明 |
|---|---|---|
| `Account` | `models/authorization/Account.model.js` | 登录账号，可挂 User 或 Student 身份 |
| `ApiPermission` / `ApiRole` / `UserApiPermission` / `UserApiRole` / `DepartmentApiRole` | `models/authorization/__roleApi/` | RBAC 权限（**`__` 前缀，未启用**） |
| `PageRole` / `UserPagePermissions` / `UserPageRoles` | `models/authorization/__rolePage/` | 前端页面级权限（**`__` 前缀，未启用**） |

### 4.2 组织模块
| 模型 | 路径 | 说明 |
|---|---|---|
| `Org` | `models/organization/structure/Org.model.js` | 机构/公司/学校（数据隔离根） |
| `User` | `models/organization/structure/User.model.js` | 员工（管理员/经理/老师） |
| `Room` | `models/organization/physical/Room.model.js` | 教室 |
| `FinanceAccount` / `FinanceRecord` / `FinanceInvoice` / `FinanceAdjustment` | `models/organization/__finance/` | 财务（**`__` 前缀，未启用**） |
| `salary` / `reimburse` | `models/organization/__salary/` | 薪酬（**`__` 前缀，未启用**） |
| `Dept` | `models/organization/structure/__Dept.model.js` | 部门（**`__` 前缀，未启用**） |

### 4.3 学校模块
| 模型 | 路径 | 说明 |
|---|---|---|
| `Subject` | `models/school/course/Subject.model.js` | 科目 |
| `Course` | `models/school/course/Course.model.js` | 课程（班级） |
| `Lesson` | `models/school/lesson/Lesson.model.js` | 课次 |
| `LessonAttendance` | `models/school/lesson/LessonAttendance.model.js` | 课堂考勤 |
| `LessonWork` | `models/school/lesson/LessonWork.model.js` | 课堂作品 |
| `LessonEvaluation` | `models/school/lesson/LessonEvaluation.model.js` | 课堂评价 |
| `Student` | `models/school/student/Student.model.js` | 学生档案 |
| `StudentCourse` | `models/school/student/StudentCourse.model.js` | 学生选课 |
| `StudentPack` | `models/school/student/StudentPack.model.js` | 学生持有课包 |

### 4.4 课包模块
| 模型 | 路径 | 说明 |
|---|---|---|
| `Pack` | `models/pack/Pack.model.js` | 课包产品定义 |
| `OrderPack` | `models/pack/OrderPack.model.js` | 课包订单 |

### 4.5 全局
| 模型 | 路径 | 说明 |
|---|---|---|
| `Category` | `models/__global/Category.model.js` | 全局分类（**`__` 前缀**） |
| `Label` | `models/__global/Label.model.js` | 全局标签（**`__` 前缀**） |

---

## 5. 关键工具

| 工具 | 路径 | 用途 |
|---|---|---|
| `JwtUtil` | `src/utils/JwtUtil.js` | JWT 生成 / 验证，常量 `REFRESH_TTL_DAYS` |
| `ApiResponse` | `src/utils/response.js` | 统一响应格式 |
| `payloadChecker` / `userPayloadChecker` / `studentPayloadChecker` | `src/utils/payloadChecker.js` | DAO 层 payload 完整性校验 |
| `deleteImmutableFront` | `src/utils/fieldAttributes.js` | service 层剔除前端不可改字段 |
| `envValidator` | `src/utils/envValidator.js` | 启动期环境变量强校验 |
| `sessionValidator` | `src/utils/sessionValidator.js` | `SESSION_CHECK` 开关控制 session 严格性 |

---

## 6. 跨模块业务流（参考）

```
[1] 登录
POST /api/auth/login → 写入 Account.currentSessionId → 返回 accessToken + Cookie refreshToken

[2] 切换身份（同一 Account 下 User ⇄ User / Student ⇄ Student）
POST /api/auth/switch-role/:id → 更新 currentUser / currentStudent → 重新签发 token

[3] 创建员工（同时建账号）
POST /api/user/add → service 调用 AccountSV.add (事务可选) → 返回 User + Account

[4] 创建学生（同时建家长账号）
POST /api/student/add → service 调用 AccountSV.add (事务可选) → 返回 Student + Account

[5] 学生在 Org 内购买课包（业务流，跨模块）
Student 调 /api/pack/list（看全平台 isActive=true）
→ /api/pack/detail/:id（确认 Org 匹配）
→ （订单模块 — 当前未启用）OrderPack 落地
→ StudentPack 发放
```

---

## 7. 相关文档

- [README.md](../README.md) - 项目根入口
- [doc/ARCHITECTURE.md](../doc/ARCHITECTURE.md) - 四层架构
- [doc/DATABASE_ARCHITECTURE.md](../doc/DATABASE_ARCHITECTURE.md) - 数据库实体关系
- [doc/DEVELOPMENT_STANDARD.md](../doc/DEVELOPMENT_STANDARD.md) - 开发规范
- [doc/LOGIN_PAYLOAD_STRUCTURE.md](../doc/LOGIN_PAYLOAD_STRUCTURE.md) - **登录 Payload 结构 ⭐**
