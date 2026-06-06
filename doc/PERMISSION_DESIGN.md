# 权限设计规范

> 本文档记录 **2026-06-06** 完成的重构后的权限模型。
> 所有新增模块 / DAO / 路由都必须遵循本文档。
>
> 相关文档:
> - [LOGIN_PAYLOAD_STRUCTURE.md](./LOGIN_PAYLOAD_STRUCTURE.md) - `req.payload` 流转与 `payloadChecker` 工具
> - [ARCHITECTURE.md](./ARCHITECTURE.md) - 四层架构（路由 / Controller / Service / DAO）

---

## 1. 设计原则

### 1.1 一句话

> **Org 隔离优先，角色检查兜底；route + DAO 双层防御。**

### 1.2 三条铁律

1. **Org 隔离是默认行为**：99% 的写操作都只能影响当前 `currentUser.Org` 内的数据。超管也不轻易跨公司。
2. **roleTemp === 'manager' 是业务权限位**：`isAdmin` 是超管标识（几乎不用），`roleTemp === 'manager'` 才是"管理员 / 经理"的业务判断。
3. **不信任 token 之外的任何东西**：业务关键字段（`Org`、`Account`、`roleTemp`）必须在 DAO 中用 `payload.currentUser.*` 重新校验，不能用请求体里传过来的值覆盖。

### 1.3 不变量（必须保证）

> **任何 `isAdmin === true` 的 Account，其关联的 User 一定 `roleTemp === 'manager'`。**

代码层强制：见 [User.dao.add](../src/models/organization/structure/User.dao.js#L83-L85) 与 [User.dao.edit](../src/models/organization/structure/User.dao.js#L141-L143)。

> 当 Account 升级为超管时，对应 User 的 `roleTemp` 被强制覆盖为 `'manager'`，反之亦然。

---

## 2. 身份与角色

### 2.1 三种 Account 类型

| `accountType` | 含义 | 关联实体 |
|---|---|---|
| `User` | 公司员工（老师 / 经理 / 超管）| `User` 文档 |
| `Student` | 学生 | `Student` 文档 |
| (其他) | 非法 | — |

### 2.2 四种 helper（[src/utils/payloadChecker.js](../src/utils/payloadChecker.js#L77-L85)）

```javascript
isStudent(payload)   // accountType === 'Student'
isUser(payload)      // accountType === 'User'
isManager(payload)   // accountType === 'User' && roleTemp === 'manager'
isAdmin(payload)     // accountType === 'User' && isAdmin === true
```

### 2.3 关键派生关系

```
isAdmin   ⇒  isManager   ⇒  isUser
                              ⇓
                           isStudent (互斥)
```

含义：
- `isAdmin` 是 `isManager` 的真子集（超管一定是经理）
- `isManager` 是 `isUser` 的真子集
- `isUser` 与 `isStudent` **互斥**（一个 Account 同一时刻只能是其中之一）

### 2.4 三类业务角色

| 业务角色 | 判定 | 典型场景 |
|---|---|---|
| **超管** | `isAdmin(payload)` | 跨公司操作（极少）|
| **经理** | `isManager(payload)` | 本公司内的所有管理操作 |
| **普通员工 / 老师** | `isUser(payload) && !isManager(payload)` | 仅看自己教的数据；修改自己 |
| **学生** | `isStudent(payload)` | 仅自助操作（`/self`、`/self/edit`） |

---

## 3. 两层防御（route + DAO）

权限检查**必须**在两层都做，缺一不可：

```
请求  ──►  route middleware (粗粒度)  ──►  Controller  ──►  Service  ──►  DAO (细粒度)
            │                              │                            │
            └─ isAdmin / isManager        └─ 参数校验                  └─ Org 隔离 + 角色判断
```

### 3.1 Route 中间件（粗粒度）

每个模块的 `middlewares/permission.js` 用 `checkPermission(permType)` 工厂函数导出 `read` / `add` / `edit` / `selfXxx`：

```javascript
// src/modules/_organization/user/middlewares/permission.js
const { isManager } = require('@utils/payloadChecker');

case 'read':  hasPermission = isManager(payload); break;
case 'add':   hasPermission = isManager(payload); break;
case 'edit':  hasPermission = isManager(payload); break;
```

特点：
- **快失败**：401/403 早返回
- **粗粒度**：只看角色，不查具体记录
- **不读 DB**：纯 payload 判断

### 3.2 DAO（细粒度）

DAO 拿到 `_id` 后做**记录级**检查：

```javascript
// 例：User.dao.edit
const targetUser = await UserModel.findById(_id);

// 同公司校验
if (targetUser.Org.toString() !== payload.currentUser.Org.toString()) {
  throw ({ code: 403, message: "没有权限修改其他公司的用户" });
}

// 角色校验：普通用户只能改自己
if (payload.currentUser.roleTemp !== 'manager' &&
    payload.currentUser._id.toString() !== targetUser._id.toString()) {
  throw ({ code: 403, message: "没有权限修改此用户" });
}
```

特点：
- **慢、准**：必须先 `findById`
- **细粒度**：跨 Org 隔离、是否本人、是否本人公司
- **最终防御**：即使 route 中间件被绕过，DAO 也会兜住

---

## 4. Org 隔离

### 4.1 默认行为

> 99% 的 DAO 写操作都**强制** `target.Org === currentUser.Org`。

```javascript
// 通用模板
if (target.Org.toString() !== payload.currentUser.Org.toString()) {
  throw ({ code: 403, message: "无权操作其他机构的数据" });
}
```

### 4.2 创建时强制写入 `doc.Org`

```javascript
// 不要相信前端传来的 Org —— 一律从 token 拿
doc.Org = payload.currentUser.Org;
```

### 4.3 不可变字段：Org / Account

`User` 的 `Account` / `Org` 在 schema 上是 `immutable: true`。DAO 中也显式拒绝：

```javascript
// src/models/organization/structure/User.dao.js
if (doc.Account !== undefined || doc.Org !== undefined) {
  throw ({ code: 400, message: 'Account 与 Org 为不可变字段，不允许修改' });
}
```

### 4.4 超管跨公司的"白名单"

只有以下场景**允许**超管跨公司操作：

| 场景 | 原因 |
|---|---|
| `Org` 的 list / add / edit（包括禁用公司）| 公司是隔离的根；新公司必须由超管创建 |
| `User.add` 时给新公司指定 `Org` | 新公司没有用户时必须先有用户才能登录 |
| `User.edit` 修改跨公司的 `isActive` | 封禁跨公司账号 |

其它场景（Order / Course / Pack / Subject / Room）**全部强制 Org 隔离**，超管也不例外。理由见 §6。

### 4.5 自我保护：不能禁用自己的 Org / User

```javascript
// Org.dao.edit：不能禁用自己的公司
if (doc.isActive === false &&
    payload.currentUser.Org.toString() === _id.toString()) {
  throw ({ code: 400, message: "不能禁用当前用户的公司, 要换到另外的身份禁用此公司" });
}

// User.dao.edit：不能禁用自己
if (doc.isActive === false && payload.currentUser._id.toString() === _id.toString()) {
  throw ({ code: 400, message: "不能禁用 自己的当前的用户" });
}
```

---

## 5. 各模块的权限规则

### 5.1 速查表

| 模块 | list | detail | add | edit | 特殊 |
|---|---|---|---|---|---|
| **Account** | 超管 | 自己 or 超管 | 经理 | 自己 or 超管 | 改自己密码需 `originalPassword` |
| **User** | 经理 | 经理 or 自己 | 经理 | 经理 or 自己（且同 Org）| `Account` / `Org` 不可改 |
| **Org** | 超管 | 自己 or 超管 | 超管 | 超管 | 不能禁用自己的公司 |
| **Student** | 经理 | 经理（同 Org）| 经理 | 经理（同 Org）| 学生自助 `/self` `/self/edit` |
| **OrderPack** | 学生（自己）or 经理 | 学生（自己）or 经理 | 学生 or 经理 | **仅超管** | `Student` / `Account` / `Org` 由 DAO 强制注入 |
| **Course / Subject / Pack / Room** | 经理 | 经理（同 Org）| 经理 | 经理（同 Org）| Org 字段不可改 |

> 速记口诀：**"Account 看超管，User 看经理，Org 死守超管，业务数据全 Org 隔离"**

### 5.2 Account 详细

- **list**：仅 `isAdmin`（看全公司账号清单）
- **add**：仅 `isManager`（经理可加，但默认 `isAdmin=false`；超管可显式置 `isAdmin=true`）
- **edit**：
  - 自己改自己：可改 `nickname` / `password`（需 `originalPassword`）
  - 超管改别人：可改 `isActive` / `code` / `phone` / `identityNo` 等
  - 非超管不能改别人
  - **不能禁用自己**

### 5.3 User 详细

- **list**：仅 `isManager`；非超管自动 `filter.Org = currentUser.Org`
- **detail**：经理可看本公司任意 User，普通员工只能看自己
- **add**：
  - 仅 `isManager`
  - 非超管：`doc.Org = currentUser.Org`（前端不能指定）
  - 超管：可指定 `doc.Org`（用于新公司初始化）
  - Account 必须存在且 `isActive=true` 且 `accountType='User'`
  - 若 `Account.isAdmin === true`，强制 `doc.roleTemp = 'manager'`
  - 同一 `(Account, Org)` 不能重复
- **edit**：
  - 经理可改本公司任意 User
  - 普通员工只能改自己
  - **不能禁用自己**
  - **`Account` / `Org` 不可改**（DAO 显式拒绝）

### 5.4 Org 详细

- **list / add / edit**：仅 `isAdmin`
- **edit** 不能禁用自己所在的公司（否则立即登出）

### 5.5 Student 详细

- **list**：仅 `isManager`；非超管自动按 Org 过滤
- **add**：仅 `isManager`；`doc.Org = currentUser.Org`（不可指定）
- **edit**：
  - 经理可改本公司学生
  - 学生自助 `/self/edit` 仅能改自己
  - 学生自助接口禁传 `isActive: false`
- **selfDetail / selfEdit**：学生自助（`/self`、`/self/edit`）

### 5.6 OrderPack 详细

- **list**：
  - 学生：仅看自己（`filter.Account = payload._id`）
  - 经理（含超管）：全公司；非超管自动 Org 过滤
- **add**：
  - 学生：以 `payload.currentStudent` 自动注入 `Student` / `Org` / `Account`，不能传 `Student`
  - 经理：`doc.Org = currentUser.Org`
  - **跨 Org 兜底**：Student / Pack / Course 必须与 `doc.Org` 同公司
- **edit**：**仅 `isAdmin`**，且 `target.Org === currentUser.Org`（即超管也只能改自己公司的订单 —— 这是设计上有意为之，见 §6）

### 5.7 业务数据（Course / Subject / Pack / Room）

- **list**：仅 `isManager`；非超管自动 Org 过滤
- **add**：仅 `isManager`；`doc.Org = currentUser.Org`（不可指定）
- **edit**：仅 `isManager`；必须 `target.Org === currentUser.Org`

> 这条对超管也适用 —— 超管改 Course 时，若 Course 不在自己公司，会被 403。

---

## 6. 跨公司操作的"反直觉"决策

### 6.1 为什么超管不能跨公司改业务数据？

`Course` / `Subject` / `Pack` / `Room` / `OrderPack` 这些业务数据**强依赖 Org 上下文**：
- 课程教室属于某校区
- 订单的 `Account` 必须与 Student 同 Org
- 修改时若 `populate('updatedBy')` 跨公司会污染审计字段

> **设计取舍**：宁可让超管多切几次公司身份（`/api/auth/switch-company`），也不要让 `updatedBy` / `createdBy` 出现跨公司引用。

### 6.2 三个例外（白名单）

1. **`Org` CRUD**：公司本身是隔离的根
2. **`User.add` 时指定新公司的 Org**：新公司冷启动时必须用超管账号"播种"
3. **`User.edit` 修改 `isActive`**：封禁跨公司账号（不影响 `updatedBy` 跨公司引用）

### 6.3 学生的"账号"是另一回事

`Student` 记录的 `Org` 字段在 `add` 时**强制**为 `currentUser.Org`（不可指定）。即使超管 add 学生，也只能加到超管自己所在的公司 —— 想加到别的公司？请用该公司的经理账号。

---

## 7. 自我修改接口

### 7.1 模式：URL 后缀 `/self` / `/self/edit`

```javascript
// src/modules/_school/student/controller.js
selfDetail = async (req, res) => {
  const { item } = await StudentSV.detail(payload, payload.currentStudent._id, options);
  //              ^^^^^^^^ 强制用 currentStudent._id,不信任 URL 参数
};

selfEdit = async (req, res) => {
  const { item } = await StudentSV.edit(payload, payload.currentStudent._id, doc);
};
```

### 7.2 安全要点

1. **URL 参数不可信**：强制用 `payload.currentStudent._id` / `payload.currentUser._id`
2. **禁字段**：`isActive`、`Account`、`Org`、`roleTemp` 等敏感字段必须在校验链里被显式 reject（不是 silently ignored）
3. **改密码流程**：Account.dao.edit 在改自己密码时要求传 `originalPassword`（超管改别人不需要）

### 7.3 推荐：validator 层禁字段

> **W8 优化建议**：在 `student/middlewares/validator.js` 的 `selfEditVD` 里加：

```javascript
body('isActive').custom((value, { req }) => {
  if (value === false || value === 'false' || value === 0) {
    throw new Error('学生不能通过此接口修改账号的激活状态');
  }
  return true;
}),
```

配合 `toBoolean()` 做类型归一化，让 DAO 中 `=== false` 判断稳定命中。

---

## 8. 常见代码模板

### 8.1 列表 + Org 过滤

```javascript
const list = async (payload = {}, filter, options) => {
  userPayloadChecker(payload);
  if (payload.currentUser.roleTemp !== 'manager') {
    throw ({ code: 403, message: "只有管理员才能查看" });
  }
  if (!payload.isAdmin) {
    filter.Org = payload.currentUser.Org;
  }
  const { items, total } = await DAO.list(Model, filter, options);
  return { items, total };
};
```

### 8.2 详情 + 同 Org 校验

```javascript
const detail = async (payload = {}, _id, options) => {
  const { item } = await DAO.detail(Model, _id, options);
  if (!item) throw ({ code: 404, message: "..." });

  userPayloadChecker(payload);
  if (payload.currentUser.Org.toString() !== item.Org.toString()) {
    throw ({ code: 403, message: "无权访问其他机构的数据" });
  }
  return { item };
};
```

### 8.3 编辑 + 角色 + Org

```javascript
const edit = async (payload = {}, _id, doc, options) => {
  userPayloadChecker(payload);
  const target = await Model.findById(_id);
  if (!target) throw ({ code: 404, message: "..." });

  // 角色
  if (payload.currentUser.roleTemp !== 'manager' &&
      payload.currentUser._id.toString() !== target._id.toString()) {
    throw ({ code: 403, message: "无权修改" });
  }
  // Org
  if (payload.currentUser.Org.toString() !== target.Org.toString()) {
    throw ({ code: 403, message: "无权操作其他机构的数据" });
  }
  // 不可变字段
  delete doc.Account;
  delete doc.Org;

  target.set(doc);
  return DAO.edit(target, options);
};
```

### 8.4 创建 + 强制写入 Org

```javascript
const add = async (payload, doc, options) => {
  userPayloadChecker(payload);
  if (payload.currentUser.roleTemp !== 'manager') {
    throw ({ code: 403, message: "只有管理员才能创建" });
  }
  doc.Org = payload.currentUser.Org;     // ← 一律从 token 拿
  doc.createdBy = payload.currentUser._id;
  return DAO.add(Model, doc, options);
};
```

---

## 9. 易踩的坑

| 坑 | 正确做法 |
|---|---|
| `item.Org !== payload.currentUser.Org` | 必须 `item.Org.toString() !== payload.currentUser.Org.toString()` |
| `payload.currentUser.Org.toString() === _id` | `_id` 是字符串时 `===` 也能过，但是 `ObjectId` 必须先 `.toString()` |
| `if (doc.isActive === false)` 漏判 `0` / `"false"` | validator 层用 `toBoolean()` 归一化 |
| 信任 `req.body.Org` 写入数据库 | 一律从 `payload.currentUser.Org` 拿，前端可忽略 |
| `switch` 的 `case` 漏 `break` | 必加 `break`（曾导致 `selfStudent` 落空到 `default: false`）|
| route 中间件 `isAdmin(payload)` 但 DAO 用 `roleTemp==='manager'` | 由于 §1.3 不变量，两者是等价的；但要明白 DAO 才是终局 |
| 跨公司 `updatedBy` 引用 | 业务数据一律 Org 隔离，避免 populate 出问题 |

---

## 10. 变更记录

| 日期 | 变更 | 影响 |
|---|---|---|
| 2026-06-06 | 新增 `isStudent` / `isUser` / `isManager` / `isAdmin` 四个 helper | route 中间件统一使用 |
| 2026-06-06 | route 中间件 + DAO 双层防御模式确立 | 所有模块统一 |
| 2026-06-06 | OrderPack 区分 Student / Manager 入参路径 | `Student` / `Account` / `Org` 由 DAO 强制注入 |
| 2026-06-06 | 业务数据（Course / Subject / Pack / Room / OrderPack.edit）Org 隔离对超管也生效 | 避免 `updatedBy` 跨公司 |
| 2026-06-06 | User.dao 显式拒绝 `Account` / `Org` 修改 | 配合 schema `immutable:true` 双重保护 |
| 2026-06-06 | User.dao.list 错误文案修正为"只有管理员" | 与代码判断一致 |
| 2026-06-06 | 不变量：`isAdmin === true` ⇒ `roleTemp === 'manager'` | User.dao.add / edit 强制对齐 |

---

## 11. 关联文档

- [LOGIN_PAYLOAD_STRUCTURE.md](./LOGIN_PAYLOAD_STRUCTURE.md) - `payload` 流转与 `payloadChecker`
- [ARCHITECTURE.md](./ARCHITECTURE.md) - 四层架构
- [src/utils/payloadChecker.js](../src/utils/payloadChecker.js) - 四个 helper 的实现
- [src/models/organization/structure/User.dao.js](../src/models/organization/structure/User.dao.js) - 不变量强制点
- [src/models/pack/OrderPack.dao.js](../src/models/pack/OrderPack.dao.js) - Student/Manager 双路径示例
- [src/modules/_organization/user/middlewares/permission.js](../src/modules/_organization/user/middlewares/permission.js) - route 中间件范式
