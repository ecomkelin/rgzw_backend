# Student 学生模块 API 接口文档

## 概述

Student 模块负责学生档案的管理。一个 Account（家长/用户账号）下可以挂多个 Student（多个孩子或本人），Student 是学生选课、购买课包、上课消课的核心主体。

- **必传身份**: 当前登录账号（`User` 或 `Student` 账户）
- **作用域**: Student 数据天然按 `Org`（所属机构）隔离
- **不可删**: Student 不可物理删除，禁用请使用 `edit` 接口将 `isActive` 置为 `false`

## 枚举

### 性别 (`genderEnums`)
- `Male`: 男（默认值）
- `Female`: 女

### 来源类型 (`sourceTypeEnums`)
`地推` / `传单` / `活动` / `介绍` / `听说` / `路过` / `抖音` / `朋友圈` / `其他`（默认 `其他`）

### 账号类型 (`accountType`)
- `User`: 员工/管理员/经理等机构用户（管理学生用）
- `Student`: 学生本人账号（仅可读/改自己）

## 接口列表

### 1. 获取学生列表
- **路径**: `POST /api/student/list`
- **描述**: 获取学生列表，支持分页、筛选与排序
- **认证要求**: 需要有效的访问令牌及读取权限 (`readPermission`)
- **权限控制**（DAO 层强制）:
  - `User` 身份: 非 admin 必须 `roleTemp === 'manager'`，否则 403；非 admin 自动按 `Org` 过滤
  - `Student` 身份: 仅返回 `currentStudent._id` 自身一条
  - 默认按创建时间倒序
- **请求参数**:
  - `filter` (可选): 筛选条件对象
    - `regExp` (可选): 模糊匹配关键字 (0-50位字符串)
    - `isActive` (可选): 是否激活 (Boolean)
    - `Org` (可选): 组织 ObjectId
    - `Account` (可选): 家长账户 ObjectId
  - `options` (可选): 分页和排序选项对象
    - `limit` (可选): 每页数量，默认 100，受 `MAX_HANDLE_ITEM` 限制
    - `skip` (可选): 跳过的记录数
    - `sort` (可选): 排序对象，格式 `{ fieldString: 1 | -1 }`
    - `populate` (可选): 关联填充数组
- **响应**:
  ```json
  {
    "code": 200,
    "success": true,
    "data": {
      "total": 12,
      "items": [ { "...": "Student 文档" } ]
    }
  }
  ```

### 2. 获取学生详情
- **路径**: `POST /api/student/detail/:id`
- **描述**: 根据 ID 获取单个学生的详细信息
- **认证要求**: 需要有效的访问令牌及读取权限 (`readPermission`)
- **权限控制**（DAO 层强制）:
  - `Student` 身份: 只能查看自己 (`currentStudent._id === :id`)，否则 403
  - `User` 身份 + admin: 任意学生
  - `User` 身份 + 非 admin: 仅本 `Org` 学生
  - 未知身份: 403
- **路径参数**: `id` - 学生 ID（必填, ObjectId）
- **请求参数**:
  - `options` (可选): 查询选项对象
    - `populate` (可选): 关联填充数组
- **响应**:
  ```json
  {
    "code": 200,
    "success": true,
    "data": { "item": { "...": "Student 文档" } }
  }
  ```

### 3. 创建学生
- **路径**: `POST /api/student/add`
- **描述**: 创建新学生档案。可同时创建绑定的家长 `Account`（任选其一）
- **认证要求**: 需要有效的访问令牌及创建权限 (`addPermission`)
- **权限控制**（DAO 层强制）:
  - 必须是 `User` 身份（学生账户不能创建）
  - admin 可创建任意 `Org` 学生；manager 仅可创建自己 `Org` 学生
  - 非 admin 自动将 `Org` 设为当前用户所属机构
  - `createBy` 自动注入为当前用户
- **请求参数**:
  - `student` (必填): 学生对象
    - `name` (必填): 真实姓名 (2-50位)
    - `birthday` (可选): 出生日期 (Date)
    - `isActive` (可选): 是否激活 (Boolean, 默认 true)
    - `phone` (可选): 电话 (10-15位)
    - `identityNo` (可选): 身份证号 (15-18位)
    - `address` (可选): 证件地址 (5-200位)
    - `currentAddress` (可选): 现居住址 (5-200位)
    - `school` (可选): 就读学校 (2-100位)
    - `sourceType` (可选): 来源类型 (枚举)
    - `description` (可选): 备注描述 (≤500位)
    - `Nation` (可选): 国家 ObjectId
    - `Province` (可选): 省份 ObjectId
    - `City` (可选): 城市 ObjectId
    - `Area` (可选): 区县 ObjectId
    - `Org` (可选): 组织 ObjectId（不传则自动取当前用户 Org）
    - `Account` (可选): 家长账户 ObjectId（不传则必须提供 `account` 字段新创建）
  - `account` (可选): 新建家长账户对象（与 `student.Account` 二选一）
    - `code` (必填): 登录账号 (4-16位)
    - `password` (必填): 登录密码 (8-16位)
    - `name` (必填): 姓名 (2-50位)
    - `gender` (可选): 性别 (枚举)
    - `phone` (可选): 电话 (10-15位)
    - `address` (可选): 地址 (5-200位)
    - `identityNo` (可选): 身份证号 (15-18位)
- **业务校验**:
  - 若 `Account` 字段未传 → 必须传 `account` 对象，否则 400
  - `Account` 必须存在、`isActive === true`、`accountType === 'Student'`，否则 404
  - `Org` 必须存在且 `isActive === true`，否则 400
  - 若未传 `displayName`，自动以 `name` 填充
- **事务**: 当 `process.env.ACID === 'true'` 时，创建 Account 与 Student 处于同一事务
- **响应**:
  ```json
  {
    "code": 200,
    "success": true,
    "data": {
      "itemAccount": { "...": "Account 文档" },
      "itemStudent": { "...": "Student 文档" }
    }
  }
  ```

### 4. 更新学生信息
- **路径**: `POST /api/student/edit/:id`
- **描述**: 根据 ID 更新学生档案
- **认证要求**: 需要有效的访问令牌及编辑权限 (`editPermission`)
- **权限控制**（DAO 层强制）:
  - `Student` 身份: 只能编辑自己 (`currentStudent._id === :id`)，否则 403
  - `User` 身份 + admin: 任意学生
  - `User` 身份 + 非 admin: 必须同 `Org` 且 `roleTemp === 'manager'`
  - 未知身份: 403
- **路径参数**: `id` - 学生 ID（必填, ObjectId）
- **请求参数**（所有字段均可选）:
  - `isActive` (可选): 启用/禁用 (Boolean)
  - `phone` (可选): 电话
  - `identityNo` (可选): 身份证号
  - `name` (可选): 真实姓名
  - `birthday` (可选): 出生日期
  - `gender` (可选): 性别
  - `address` (可选): 证件地址
  - `currentAddress` (可选): 现居住址
  - `school` (可选): 就读学校
  - `sourceType` (可选): 来源类型
  - `description` (可选): 备注
  - `Nation` / `Province` / `City` / `Area` (可选): 行政区划 ObjectId
- **业务校验**:
  - `Account`、`Org` 为 `immutable` 字段，会被 `deleteImmutableFront` 自动剔除（前端传了也无效）
  - 若 `description` 等空值传入，对应字段会被 `delete` 清除（如 `doc.Nation` 不存在则 `delete doc.Nation`）
  - 若未传 `displayName`，自动以 `name` 填充（仅当 `name` 存在）
- **错误响应**:
  - `404`: 学生不存在
  - `403`: 跨 Org 编辑 / 角色不足 / 身份类型非法
- **响应**: `item` - 更新后的学生文档

### 5. 学生编辑自己 (计划中 ⏳)
- **路径**: `POST /api/student/edit/self`（**当前路由未启用**）
- **描述**: 学生本人修改自己的展示信息（不涉及证件、来源、Org、Account 等敏感字段）
- **状态**: 计划启用，对应 controller 中 `selfUpdate` 方法（当前为注释代码）
- **权限控制**:
  - 必须是 `Student` 身份
  - 服务端使用 `payload.currentStudent._id` 自动定位目标
- **请求参数**:
  - `displayName` (可选): 展示名称 (2-26位)
- **响应**: `item` - 更新后的学生文档

### 6. 学生查看自己 (计划中 ⏳)
- **路径**: `POST /api/student/self`（**当前路由未启用**）
- **描述**: 学生本人获取自己的详细信息
- **状态**: 计划启用，对应 controller 中 `selfDetail` 方法（当前为注释代码）
- **响应**: `item` - 当前学生文档

## 字段说明（Student 模型）

| 字段名 | 类型 | 必填 | 可变 | 说明 |
| --- | --- | --- | --- | --- |
| `Account` | ObjectId (ref: Account) | ✅ | ❌ immutable | 关联家长/本人账户 |
| `name` | String | ✅ | ✅ | 真实姓名 |
| `identityNo` | String | ❌ | ✅ | 身份证号，**全表唯一**（`partialFilterExpression`） |
| `birthday` | Date | ❌ | ✅ | 出生日期 |
| `gender` | String (Enum) | ❌ | ✅ | `Male` / `Female`（默认 `Male`） |
| `address` | String | ❌ | ✅ | 证件地址 |
| `currentAddress` | String | ❌ | ✅ | 现居住址 |
| `phone` | String | ❌ | ✅ | 电话 |
| `Nation` | ObjectId | ❌ | ✅ | 国家 |
| `Province` | ObjectId | ❌ | ✅ | 省份（从 City 冗余） |
| `City` | ObjectId | ❌ | ✅ | 城市 |
| `Area` | ObjectId | ❌ | ✅ | 区县 |
| `school` | String | ❌ | ✅ | 就读学校 |
| `displayName` | String | ❌ | ✅ | 展示名（默认 = `name`） |
| `avatar` | String | ❌ | ✅ | 头像 URL（**当前 validator 未校验**） |
| `sourceType` | String (Enum) | ❌ | ✅ | 来源渠道（默认 `其他`） |
| `isActive` | Boolean | ❌ | ✅ | 是否启用（默认 `true`） |
| `createBy` | ObjectId (ref: User) | ❌ (auto) | ❌ immutable | 创建人 |
| `updateBy` | ObjectId (ref: User) | ❌ (auto) | ✅ | 最后修改人（DAO 未自动注入，⚠️ 待补） |
| `Org` | ObjectId (ref: Org) | ✅ | ❌ immutable | 所属组织 |
| `createdAt` / `updatedAt` | Date | auto | — | Mongoose timestamps |

## 权限矩阵

| 接口 | Student 身份 | User + admin | User + manager | User + 其他 |
| --- | --- | --- | --- | --- |
| `POST /list` | 仅自己 1 条 | 全部 | 全部 | 403 |
| `POST /detail/:id` | 仅自己 | 任意学生 | 同 Org | 同 Org (403 自己跨 Org) |
| `POST /add` | 403 | ✅ | ✅ | 403 |
| `POST /edit/:id` | 仅自己 | ✅ | 同 Org | 403 |
| `POST /edit/self` (计划) | ✅ | 403 | 403 | 403 |
| `POST /self` (计划) | ✅ | 403 | 403 | 403 |

> ⚠️ 当前 `readPermission` / `editPermission` 中间件**已放行所有用户**（v7.4.4 临时调整），实际权限完全靠 DAO 层校验。强烈建议恢复中间件策略：`read/edit` 限制为 `admin || manager`，与 `user / course / subject / pack` 模块保持一致；学生自编辑走独立路由。

## 索引

| 索引 | 类型 | 说明 |
| --- | --- | --- |
| `{ identityNo: 1 }` | unique (partial) | 身份证号去重（仅当 `identityNo` 存在且非空） |

## 业务约束

1. **Account / Org 不可变**: 创建后这两字段永远不可修改（`immutable: true`），`service.edit` 会通过 `deleteImmutableFront` 自动剔除
2. **Org 自动归属**: 非 admin 用户创建学生时，`Org` 自动取当前用户所属组织
3. **Account 二选一**: 创建学生时必须提供 `student.Account` 或 `account` 对象之一
4. **唯一性**: 同一 `identityNo` 不允许重复
5. **不可删**: Student 模块未提供 `remove` 接口，禁用请改 `isActive = false`
6. **displayName 默认值**: 未指定时自动以 `name` 填充
7. **跨 Org 隔离**: 任何身份（包括 admin 之外）修改/查看非本 Org 学生都会被 403

## 响应格式

```json
{
  "code": 200,
  "success": true,
  "status": "OK",
  "message": "操作成功",
  "data": {}
}
```

## 错误码说明

| 状态码 | 含义 | 触发场景 |
| --- | --- | --- |
| `200` | 成功 | — |
| `400` | 参数/业务校验失败 | 缺少 `account` 信息、Org 不存在/被禁用、字段值非法 |
| `403` | 权限不足 | 非 manager 访问 list/edit、跨 Org 编辑、学生身份非法操作 |
| `404` | 资源不存在 | 学生/Account/Org 找不到 |
| `500` | 服务器内部错误 | 兜底错误 |

---

## ⚠️ 已知问题（需后续修复）

1. **`description` 字段**: validator 接收但 model 中**无此字段**，传值会被 Mongoose 静默丢弃
2. **`avatar` 字段**: model 中存在但 validator **未校验**，可绕过长度/格式限制
3. **`updateBy` 字段**: model 中存在但 DAO `edit` **未自动注入**当前用户为更新人
4. **`Nation/Province/City/Area` 仅在 `add` 时可传**（`addVD` 有校验），但 `editVD` 也放开了——DAO 内部用 `delete doc.X` 清空方式处理，注意：传 `null` 也会被 `delete`（与传空字符串表现不一致）
5. **permission 中间件放空**: 详见「权限矩阵」下方注释
6. **学生自编辑路由未启用**: `selfUpdate` / `selfDetail` 在 controller 中仍为注释代码
