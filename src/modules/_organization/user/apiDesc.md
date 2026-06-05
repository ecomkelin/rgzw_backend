# User 模块 API 接口文档

## 概述

User 模块负责员工身份（管理员 / 经理 / 老师）的管理，包括员工的增删改查与当前用户自助操作。

- **必传身份**: 登录账号（`User` 账户类型）
- **作用域**: 数据按 `Org` 严格隔离（非 admin 只能看本 Org）
- **不可删**: User 模块**未提供** `/remove` 接口，禁用请改 `isActive = false`
- **同账号跨机构**: 一个 `Account` 可在不同 `Org` 持有多个 `User`（`{ Account:1, Org:1 }` 联合唯一保证同 Org 仅 1 个）

## 角色枚举 (`roleTemp`)

| 值 | 含义 |
|---|---|
| `manager` | 机构管理员（可读写本 Org 数据） |
| `teacher` | 教师（只读，DAO 强制） |

> 当前文档**不**再保留旧的 `'Admin' / 'Teacher' / 'Student' / 'Parent' / 'Guardian'` 等错误枚举——以 `User.model.js` 的 `roleSimpEnums` 为准。

## 接口列表

### 1. 获取用户列表
- **路径**: `POST /api/user/list`
- **描述**: 获取用户列表，支持分页、筛选、关联填充
- **认证要求**: 需登录 + `readPermission`
- **中间件链**: `authenticate` → `readPermission` → `listVD` → `controller.list`
- **请求参数**:
  - `filter` (可选): 筛选条件
    - `regExp` (可选): 模糊匹配 `nickname` (0-50位)
    - `isActive` (可选): Boolean
    - `Org` (可选): 组织 ObjectId
    - `Account` (可选): 账户 ObjectId
  - `options` (可选): 标准 list options（limit/skip/sort/populate）
- **响应**: `{ total, items }`

### 2. 获取用户详情
- **路径**: `POST /api/user/detail/:id`
- **描述**: 根据 ID 获取单个员工信息
- **认证要求**: 需登录 + `readPermission`
- **路径参数**: `id` (必填, ObjectId)
- **请求参数**:
  - `options.populate` (可选): 关联填充
- **响应**: `{ item }`

### 3. 创建用户
- **路径**: `POST /api/user/add`
- **描述**: 创建新员工，**同时**创建关联的 `Account`（账号事务可选）
- **认证要求**: 需登录 + `addPermission`
- **中间件链**: `authenticate` → `addPermission` → `addVD` → `controller.add`
- **请求参数**:
  - `user` (必填, Object):
    - `roleTemp` (必填): `'manager' | 'teacher'`
    - `nickname` (必填): 昵称 (2-26位)
    - `Org` (可选): 组织 ObjectId（**实际不生效**——DAO 强制取 `currentUser.Org`）
    - `Account` (可选): 关联现有账号 ObjectId
    - `isActive` / `sort` / `avatar` (可选)
  - `account` (可选, Object): 当 `user.Account` 未传时**必须**提供，用于新建账号
    - `code` (必填): 账号编码 (4-16位)
    - `password` (必填): 密码 (8-16位)，后端 argon2id 哈希
    - `name` (必填): 真实姓名 (2-50位)
    - `gender` / `phone` / `address` / `identityNo` (可选)
- **业务校验**:
  - 必须是 `User` 身份（Student 会被 `addPermission` 中间件 403）
  - `user.Account` 与 `account` 二选一
- **响应**:
  - `itemUser`: 新建员工
  - `itemAccount`: 新建账号（仅当新建时）
  - `itemUpdatedAccount`: 关联更新后的账号（仅当 `user.Account` 已有时）

### 4. 更新员工信息
- **路径**: `POST /api/user/edit/:id`
- **描述**: 管理员/经理更新员工
- **认证要求**: 需登录 + `editPermission`
- **路径参数**: `id` (必填, ObjectId)
- **请求参数** (所有字段可选):
  - `nickname` (可选): 2-26位
  - `roleTemp` (可选): `'manager' | 'teacher'`
  - `avatar` (可选): 头像
  - `isActive` (可选): Boolean
  - `sort` (可选): Number
- **不可编辑字段**（`immutable`）: `Account` / `Org` / `createdBy` / `createdAt`
- **响应**: `{ item }`

### 5. 当前用户自助编辑
- **路径**: `POST /api/user/self`
- **描述**: 当前登录用户修改自己的 `nickname` / `avatar`（**无获取自己详情接口**——使用 `POST /api/user/detail/:id` 传 `currentUser._id` 即可）
- **认证要求**: 需登录 + `userAuthorize` + `selfEditVD`
- **中间件链**: `authenticate` → `userAuthorize()` → `selfEditVD` → `controller.selfEdit`
- **业务逻辑**: 服务端从 `payload.currentUser._id` 锁定目标，**前端无法越权改他人**
- **请求参数** (所有字段可选):
  - `nickname` (可选): 2-26位
  - `avatar` (可选): 2-26位（**注意**：当前 validator 限制为 2-26 位，与 addVD 的 4-50 位不一致——后续对齐）
- **响应**: `{ item }`

## 字段说明（User 模型）

| 字段 | 类型 | 必填 | 可写性 | 默认 | 索引 | 说明 |
|---|---|---|---|---|---|---|
| `Account` | ObjectId(ref:Account) | ✓ | ✕ `immutable` | — | (联合) | 关联账号 |
| `Org` | ObjectId(ref:Org) | ✓ | ✕ `immutable` | — | (联合) | 所属组织 |
| `Depts` | [ObjectId(ref:Dept)] | ✕ | ✓ | `[]` | — | 所属部门 |
| `roleTemp` | `'manager' \| 'teacher'` | ✓ | ✓ | `'teacher'` | — | 简化角色 |
| `nickname` | String | ✓ | ✓ | — | — | 昵称 |
| `avatar` | String | ✕ | ✓ | — | — | 头像 URL |
| `isActive` | Boolean | ✕ | ✓ | `true` | — | 是否启用 |
| `sort` | Number | ✕ | ✓ | `0` | — | 排序权重 |
| `createdBy` | ObjectId(ref:Account) | ✕ | ✕ `immutable` | — | — | 创建人 |
| `updatedBy` | ObjectId(ref:Account) | ✕ | ✕ `immutableFront` | — | — | 最后修改人 |
| `createdAt` / `updatedAt` | Date | auto | — | — | — | Mongoose timestamps |

### 索引

```js
{ Account: 1, Org: 1 }   // unique —— 一个 Org 下同账号只能有一个员工身份
```

## 权限说明

| 中间件 | 用途 | 规则 |
|---|---|---|
| `readPermission` | `/list`、`/detail/:id` | 详见各模块（admin / manager） |
| `addPermission` | `/add` | admin / manager |
| `editPermission` | `/edit/:id` | admin / manager |
| `userAuthorize` | `/self` | 必须是 User 账户（Student 直接 403） |

## 业务约束

1. **`Account` / `Org` 不可变**: 创建后这两个字段永远不可改（`immutable: true`），换账号或换机构必须新建 User
2. **同 Org 唯一**: `{ Account:1, Org:1 }` 联合唯一索引保证同一账号在同一 Org 仅 1 个 User
3. **跨 Org 隔离**: 非 admin 只能看本 Org 数据，DAO 强制
4. **不可删**: User 模块未提供 `remove` 接口，禁用请改 `isActive = false`
5. **roleTemp 决定数据范围**: `manager` 可读写本 Org，`teacher` 仅只读（DAO 内强制）

## 响应格式

```json
{
  "code": 200,
  "success": true,
  "message": "操作成功",
  "data": { "item": {} }
}
```

## 关联文档

- [apiDesc.md](../../_authorization/account/apiDesc.md) - Account 模块（创建员工时同步创建账号）
- [../../_authorization/auth/MODELS_AND_FEATURES.md](../../_authorization/auth/MODELS_AND_FEATURES.md) - 模型字段表
- [User.model.js](../../../../models/organization/structure/User.model.js) - 字段定义源文件
