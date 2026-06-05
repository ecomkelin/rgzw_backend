# 认证模块 — 模型与字段表

> 本文档列认证模块涉及的 **3 个核心模型**（Account / User / Student）的字段定义、字段保护规则，以及"一个 Account 多身份"的业务模型说明。
> 字段定义以 `src/models/**/*.model.js` 为准；本文档对每个字段标注 **可写性**、**immutable 标记**、**索引**。

---

## 1. 业务模型：Account ⇄ User / Student

### 1.1 关系图

```
┌──────────────┐
│   Account    │  ← 登录账号
│  (账号表)    │
└──────┬───────┘
       │ 1:N
       ├─→ 多个 User      (accountType === 'User')
       │     跨 Org 多个（一个员工可能在多个机构有身份）
       │     同一 Org 仅 1 个（{ Account:1, Org:1 } 唯一索引）
       │
       └─→ 多个 Student   (accountType === 'Student')
             跨机构多个（家长/兄弟姐妹/自己）
```

### 1.2 关键规则

- `Account.accountType` 决定一个账号是"员工账号"还是"学生账号"，**immutable**
- `Account.isAdmin` 仅 `User` 账号可设，**immutable**
- 同一 `Account` 下：
  - `User` 账号可关联 0..N 个 `User`（多 Org 切换）
  - `Student` 账号可关联 0..N 个 `Student`（多个孩子/自己）
- 当前激活身份存于 `Account.currentUser` / `Account.currentStudent`，JWT payload 也带这两字段

### 1.3 切换身份流程

```
POST /api/auth/switch-role/:id
  ↓
查 Account（+currentSessionId）
  ↓
查目标 User / Student，校验：
  - 必须存在且 isActive
  - 必须归属当前 Account（User.Account === Account._id）
  ↓
若 currentUser / currentStudent 与目标不同 → Account.save() 更新
  ↓
用新身份重新签发 accessToken + refreshToken（Cookie 覆盖）
```

> 当前会话（`currentSessionId`）**不**因切换身份而改变，无需重新登录。
> 跨 Org 切换会输出 `console.warn`（Student）或正常通过（User，因为切 User 必然切 Org）。

---

## 2. Account 模型 (`src/models/authorization/Account.model.js`)

> 登录账号表。密码经 `pre('save')` 中间件用 **Argon2id** 哈希后存入 `passwordHash`。

### 2.1 字段表

| 字段 | 类型 | 必填 | 可写性 | 默认 | 索引 | 说明 |
|---|---|---|---|---|---|---|
| `code` | String | ✓ | ✕ `immutable` | — | unique | 账号编码，登录用 |
| `passwordHash` | String | ✓ | ✓（经 `password`） | — | — | argon2id；DAO 默认 `select:false` 不返回 |
| `phone` | String | ✕ | ✓ | — | unique (partial) | 联系电话；`null/不存在` 不参与唯一 |
| `name` | String | ✓ | ✓ | — | — | 真实姓名 |
| `identityNo` | String | ✕ | ✓ | — | unique (partial) | 证件号/身份证；`null/不存在` 不参与唯一 |
| `accountType` | `'User' \| 'Student'` | ✓ | ✕ `immutable` | `'User'` | — | 账号类型 |
| `currentUser` | ObjectId(ref:User) | ✕ | ✕ | — | — | `accountType=User` 时指向当前身份 |
| `currentStudent` | ObjectId(ref:Student) | ✕ | ✕ | — | — | `accountType=Student` 时指向当前身份 |
| `isAdmin` | Boolean | ✕ | ✕ `immutable` | `false` | — | 超级管理员；仅 `User` 可设 true |
| `isActive` | Boolean | ✕ | ✓ | `true` | — | 是否启用（控制登录） |
| `gender` | `'male' \| 'female'` | ✕ | ✓ | `'male'` | — | |
| `birthday` | Date | ✕ | ✓ | — | — | 出生日期 |
| `address` | String | ✕ | ✓ | — | — | 户籍地址 |
| `nickname` | String | ✕ | ✓ | — | — | 昵称 |
| `currentAddress` | String | ✕ | ✓ | — | — | 现居地址 |
| `Nation` | ObjectId | ✕ | ✓ | — | — | 民族（冗余） |
| `Province` | ObjectId | ✕ | ✓ | — | — | 省份（冗余） |
| `City` | ObjectId | ✕ | ✓ | — | — | 城市（冗余） |
| `Area` | ObjectId | ✕ | ✓ | — | — | 区县（冗余） |
| `lastLoginAt` | Date | ✕ | ✕ `immutableFront` | — | — | 由 service 层 `login` 写入 |
| `lastLoginIP` | String | ✕ | ✕ `immutableFront` | — | — | 同上 |
| `lastLogoutAt` | Date | ✕ | ✕ `immutableFront` | — | — | 由 service 层 `logout` 写入 |
| `currentSessionId` | String | ✕ | ✕（不返回） | — | — | 当前会话 ID；`select:false` |
| `sort` | Number | ✕ | ✓ | `0` | — | 排序权重 |
| `createdBy` | ObjectId(ref:Account) | ✕ | ✕ `immutable` | — | — | 创建人 |
| `updatedBy` | ObjectId(ref:Account) | ✕ | ✕ `immutableFront` | — | — | 最后修改人；service 注入 |
| `createdAt` | Date | auto | — | — | — | Mongoose timestamps |
| `updatedAt` | Date | auto | — | — | — | Mongoose timestamps |

### 2.2 索引

```js
{ code: 1 }                                            // unique
{ phone: 1 }                                           // unique (partial)
{ identityNo: 1 }                                      // unique (partial)
```

### 2.3 关键保护

- `immutable` 字段：MongoDB 写入即拒绝修改（Mongoose 抛错）
- `immutableFront` 字段：`deleteImmutableFront` 在 service 层剔除后由 service/DAO 重新注入
- `passwordHash`：默认 `select: false`，所有返回接口会从 `account` 对象中 `delete` 掉
- `currentSessionId`：默认 `select: false`，登录态管理核心，防并发登录

---

## 3. User 模型 (`src/models/organization/structure/User.model.js`)

> 公司员工身份。`roleTemp` 简化权限（manager / teacher），完整 RBAC 暂未启用（见 `__roleApi/`）。

### 3.1 字段表

| 字段 | 类型 | 必填 | 可写性 | 默认 | 索引 | 说明 |
|---|---|---|---|---|---|---|
| `Account` | ObjectId(ref:Account) | ✓ | ✕ `immutable` | — | (联合) | 关联账号 |
| `Org` | ObjectId(ref:Org) | ✓ | ✕ `immutable` | — | (联合) | 所属组织 |
| `Depts` | [ObjectId(ref:Dept)] | ✕ | ✓ | `[]` | — | 所属部门列表 |
| `roleTemp` | `'manager' \| 'teacher'` | ✓ | ✓ | `'teacher'` | — | 简化角色 |
| `nickname` | String | ✓ | ✓ | — | — | 昵称 |
| `avatar` | String | ✕ | ✓ | — | — | 头像 URL |
| `isActive` | Boolean | ✕ | ✓ | `true` | — | 是否启用 |
| `sort` | Number | ✕ | ✓ | `0` | — | 排序权重 |
| `createdBy` | ObjectId(ref:Account) | ✕ | ✕ `immutable` | — | — | 创建人 |
| `updatedBy` | ObjectId(ref:Account) | ✕ | ✕ `immutableFront` | — | — | 最后修改人 |
| `createdAt` / `updatedAt` | Date | auto | — | — | — | Mongoose timestamps |

### 3.2 索引

```js
{ Account: 1, Org: 1 }   // unique —— 一个公司一个账号只能有一个员工身份
```

### 3.3 关键保护

- `Account` / `Org` 均为 `immutable`：员工换账号/换机构必须新建 User，不能改
- `roleTemp` 决定数据范围：`manager` 可管本 Org 数据，`teacher` 只读

---

## 4. Student 模型 (`src/models/school/student/Student.model.js`)

> 学生档案。一个 `Account`（家长）下可挂多个 `Student`（多个孩子，或自己）。

### 4.1 字段表

| 字段 | 类型 | 必填 | 可写性 | 默认 | 索引 | 说明 |
|---|---|---|---|---|---|---|
| `Account` | ObjectId(ref:Account) | ✓ | ✕ `immutable` | — | — | 关联家长/本人账号 |
| `name` | String | ✓ | ✓ | — | — | 真实姓名 |
| `description` | String | ✕ | ✓ | — | — | 备注 |
| `identityNo` | String | ✕ | ✓ | — | unique (partial) | 身份证号 |
| `birthday` | Date | ✕ | ✓ | — | — | 出生日期 |
| `gender` | `'Male' \| 'Female'` | ✕ | ✓ | `'Male'` | — | 性别 |
| `address` | String | ✕ | ✓ | — | — | 证件地址 |
| `currentAddress` | String | ✕ | ✓ | — | — | 现居地址 |
| `phone` | String | ✕ | ✓ | — | — | 电话 |
| `Nation` | ObjectId | ✕ | ✓ | — | — | 国家 |
| `Province` | ObjectId | ✕ | ✓ | — | — | 省份 |
| `City` | ObjectId | ✕ | ✓ | — | — | 城市 |
| `Area` | ObjectId | ✕ | ✓ | — | — | 区县 |
| `school` | String | ✕ | ✓ | — | — | 就读学校 |
| `displayName` | String | ✕ | ✓ | — | — | 展示名（默认 = name） |
| `avatar` | String | ✕ | ✓ | — | — | 头像 URL |
| `sourceType` | String (Enum) | ✕ | ✓ | `'其他'` | — | 来源渠道 |
| `isActive` | Boolean | ✕ | ✓ | `true` | — | 是否启用 |
| `createBy` | ObjectId(ref:User) | ✕ | ✕ `immutable` | — | — | 创建人（User） |
| `updateBy` | ObjectId(ref:User) | ✕ | ✓ | — | — | 最后修改人（DAO ⚠️ 未自动注入） |
| `Org` | ObjectId(ref:Org) | ✓ | ✕ `immutable` | — | — | 所属组织 |
| `createdAt` / `updatedAt` | Date | auto | — | — | — | Mongoose timestamps |

### 4.2 索引

```js
{ identityNo: 1 }   // unique (partial)
```

### 4.3 关键保护

- `Account` / `Org` / `createBy` 均为 `immutable`
- 创建时若未传 `displayName`，自动以 `name` 填充

### 4.4 sourceType 枚举

`地推` / `传单` / `活动` / `介绍` / `听说` / `路过` / `抖音` / `朋友圈` / `其他`

---

## 5. 字段可写性总览

| 标记 | 写入路径 |
|---|---|
| `immutable: true` | **任何位置都不可改**（MongoDB 抛 ValidationError） |
| `immutableFront: true` | **前端不可改**；service 层 `deleteImmutableFront` 剔除后由 DAO/service 重新注入 |
| 无标记 | 任何位置都可以改（DAO 会按 payload 写入） |
| `select: false` | 不返回（密码、会话 ID） |
| `unique (partial)` | 仅当字段存在且非空时参与唯一约束 |

> ⚠️ 注意：Mongoose 的 `immutable: true` 只在 `save()` / `update()` 路径生效；如果使用 `findOneAndUpdate` 的 `$set`，**部分版本**可能绕过该检查。当前项目统一走 `model.set(doc)` + `save()` 模式，安全。

---

## 6. 关联文档

- [apiDesc.md](./apiDesc.md) - 认证模块 API 接口
- [README.md](./README.md) - 认证模块业务流程
- [Account.model.js](../../../../models/authorization/Account.model.js) - 字段定义源文件
- [User.model.js](../../../../models/organization/structure/User.model.js)
- [Student.model.js](../../../../models/school/student/Student.model.js)
- [../../../../doc/LOGIN_PAYLOAD_STRUCTURE.md](../../../../doc/LOGIN_PAYLOAD_STRUCTURE.md) - **Login Payload 结构 ⭐**
