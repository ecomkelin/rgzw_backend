# Account 模块 API 接口文档

## 概述

Account 模块负责系统登录账号的管理。
账号分为两种类型:
- **`User`** —— 机构内部员工（管理员 / 经理 / 老师）
- **`Student`** —— 学生（家长）账号,Student 账号下可挂多个学生身份

账号模块**不负责**创建具体身份 (`User` / `Student`)——身份由各自模块的 `/add` 接口负责（创建身份时会同时创建账号）。

> ⚠️ **当前实现**: 本模块**不直接提供 `POST /add` 路由**。创建账号统一由 `User` / `Student` 模块在事务中调用 `AccountSV.add` 完成。如需单独建账号,使用 `UserCT.add` / `StudentCT.add`。

## 接口列表

### 1. 获取账号列表
- **路径**: `POST /api/account/list`
- **描述**: 获取账号列表,支持分页、筛选、关联填充
- **认证要求**: 需登录 + `readPermission`(仅管理员)
- **请求参数**:
  - `filter` (可选): 筛选条件对象
    - `isActive` (可选): 布尔,是否启用
    - `isAdmin` (可选): 布尔,是否管理员
    - `gender` (可选): `'male'` / `'female'`
    - `accountType` (可选): `'User'` / `'Student'`
    - `Nation` / `Province` / `City` / `Area` (可选): 行政区划 ObjectId
  - `options` (可选): 分页/排序/填充,结构同 Org 模块
    - `limit` (默认 12,最大 `MAX_HANDLE_ITEM`)
    - `skip` (≥ 0)
    - `sort`: `{ field: 1 | -1 }`
    - `populate`: 关联填充数组
- **响应**:
  - `total`: 账号总数
  - `items`: 账号列表(不含 `passwordHash` / `currentSessionId`)

### 2. 获取账号详情
- **路径**: `POST /api/account/detail/:id`
- **描述**: 根据 ID 获取单个账号信息
- **认证要求**: 需登录 + `readPermission`(仅管理员)
- **路径参数**:
  - `id` (必填): 账号 ObjectId
- **请求参数**:
  - `options` (可选): 关联填充
- **响应**: `item` - 账号详细信息

### 3. 更新账号
- **路径**: `POST /api/account/edit/:id`
- **描述**: 根据 ID 更新账号信息(管理员用)
- **认证要求**: 需登录 + `editPermission`(仅管理员)
- **路径参数**:
  - `id` (必填): 账号 ObjectId
- **请求参数** (可选):
  - `password` (可选): 明文密码 (8-16位字符串),后端会通过 `argon2id` 哈希后存入 `passwordHash`
  - `isActive` (可选): 布尔,是否启用
  - `sort` (可选): 排序权重
  - `name` (可选): 真实姓名 (2-50位字符串)
  - `phone` (可选): 联系电话 (10-15位字符串)
  - `address` (可选): 户籍地址 (5-200位字符串)
  - `identityNo` (可选): 证件号码 (15-18位字符串)
  - `gender` (可选): `'male'` / `'female'`
  - **注意**:`code` / `accountType` / `isAdmin` 均为 `immutable`,**不可通过此接口修改**;`Nation` / `Province` / `City` / `Area` 当前 validator 暂未启用,如需启用需取消 validator.js 中的注释
- **响应**: `item` - 更新后的账号(不含 `passwordHash` / `currentSessionId`)
- **失败返回**:
  - `400`: 手机号 / 身份证号 / 账号已被其他记录占用
  - `404`: 账号不存在
  - `403`: 当前账号不是管理员

### 4. 获取当前登录账号信息
- **路径**: `POST /api/account/self`
- **描述**: 获取当前 token 对应账号的信息
- **认证要求**: 需登录,无额外权限校验
- **请求参数**:
  - `options` (可选): 关联填充
- **响应**: `item` - 当前账号完整信息

### 5. 更新当前登录账号信息
- **路径**: `POST /api/account/edit/self`
- **描述**: 当前账号自助更新昵称或密码
- **认证要求**: 需登录,无额外权限校验
- **请求参数** (可选):
  - `password` (可选): 新密码 (8-16位字符串)
  - `nickname` (可选): 昵称 (2-50位字符串)
- **响应**: 更新后的账号
- **说明**: 通过 `AccountDAO.edit` 走事务时,`payloadChecker` 会校验权限;此处为当前账号改自己,DAO 内 `payload._id.toString() === _id.toString()` 一定成立

## 权限说明

| 中间件 | 用途 | 规则 |
|---|---|---|
| `readPermission` | `/list`、`/detail/:id` | 仅 `payload.isAdmin === true` |
| `addPermission` | (内部使用) | 仅 `payload.isAdmin === true` |
| `editPermission` | `/edit/:id` | 仅 `payload.isAdmin === true` |
| `managePermission` | 预留 | 仅 `payload.isAdmin === true` |

`/self` 与 `/edit/self` **未挂载权限中间件**,因为 controller 内已通过 `payload._id` 锁定为"自己改自己"。

## 模型字段速查

| 字段 | 类型 | 必填 | 可写 | 备注 |
|---|---|---|---|---|
| `code` | String | ✓ | ✕(`immutable`) | 账号编码,唯一索引 |
| `passwordHash` | String | ✓ | ✓(经 `password`) | argon2id,默认不返回 |
| `phone` | String | ✕ | ✓ | unique partial index |
| `name` | String | ✓ | ✓ | 真实姓名 |
| `identityNo` | String | ✕ | ✓ | unique partial index |
| `accountType` | `'User' \| 'Student'` | ✓ | ✕(`immutable`) | 决定账号是员工还是学生(家长) |
| `currentUser` | ObjectId | ✕ | ✕ | 指向 `User` 身份,`accountType=User` 时使用 |
| `currentStudent` | ObjectId | ✕ | ✕ | 指向 `Student` 身份,`accountType=Student` 时使用 |
| `isAdmin` | Boolean | ✕ | ✕(`immutable`) | 超级管理员,只有 `User` 类型可设 |
| `isActive` | Boolean | ✕ | ✓ | 控制是否可登录 |
| `gender` | `'male' \| 'female'` | ✕ | ✓ | |
| `birthday` | Date | ✕ | ✓ | |
| `address` | String | ✕ | ✓ | 户籍地址 |
| `nickname` | String | ✕ | ✓ | |
| `currentAddress` | String | ✕ | ✓ | 现居地址 |
| `Nation` / `Province` / `City` / `Area` | ObjectId | ✕ | ✓ | 行政区划 |
| `lastLoginAt` / `lastLoginIP` / `lastLogoutAt` | - | ✕ | ✕(`immutableFront`) | 登录信息 |
| `currentSessionId` | String | ✕ | ✗(不返回) | 防并发登录 |
| `sort` | Number | ✕ | ✓ | |
| `createdBy` | ObjectId | ✕ | ✕ | |
| `updatedBy` | ObjectId | ✕ | ✕(`immutableFront`) | |

## 通用响应

```json
{
  "code": 200,
  "success": true,
  "message": "操作成功",
  "data": { "item": {} }
}
```

## 关联

- **创建账号**:`UserCT.add` / `StudentCT.add` 在事务中调用 `AccountSV.add`
- **关联身份**: `User._id` ⇄ `Account.currentUser`,`Student._id` ⇄ `Account.currentStudent`
- **上层**:`Auth` 模块的登录接口会读取 `Account` 并附加 `currentUser` / `currentStudent` 到 JWT payload
