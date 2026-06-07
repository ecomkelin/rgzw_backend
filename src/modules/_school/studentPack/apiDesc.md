# StudentPack 学生持有课包模块 API 接口文档

> 本模块实现 `StudentPack` 的 HTTP 接口。
> - 模型: [src/models/school/student/StudentPack.model.js](../../../models/school/student/StudentPack.model.js)
> - DAO:   [src/models/school/student/StudentPack.dao.js](../../../models/school/student/StudentPack.dao.js)
> - 模块: [src/modules/_school/studentPack/](./)

## 概述

`StudentPack` 记录学生**实际持有**的课包，是消课模块操作的实体。

```
购买 Pack -> OrderPack (Pending -> Paid) -> 自动落地 StudentPack
                                            ↓
                                       排课消课: remainingLesson 递减
                                       Lesson 完成后 push LessonAttendances

非购买场景 -> 超管手动 add (resource='free', 赠送/活动/补偿)
```

来源枚举 (`resource`):
- `OrderPack`: 由 `OrderPack.dao.add` 在订单落库后自动创建
- `free`     : 由超管手动添加(赠送/活动/补偿等)

---

## 枚举

### 状态 (`statusEnums`)

| 值 | 含义 |
|---|---|
| `active`    | 激活中, 可正常消课 |
| `frozen`    | 已冻结, 暂不可消课(超管可恢复) |
| `exhausted` | 课时耗尽 (remainingLesson === 0 时由消课模块改) |
| `refunded`  | 已退费(超管手动改) |

### 来源 (`resourceEnums`)

| 值 | 含义 |
|---|---|
| `OrderPack` | 订单购买, 后端自动创建, 前端无 add 入口 |
| `free`      | 免费赠送, 仅超管可手动 add |

---

## 业务权限总览

| 操作 | Student | Manager (`roleTemp=manager`) | Admin (`isAdmin=true`) |
|---|---|---|---|
| 列表 (`list`) | 仅自己 | 本 Org | 全部 |
| 详情 (`detail`) | 仅自己 | 本 Org | 全部 |
| 创建 (`add`) | ❌ | ❌ | ✅(且学生与当前用户同 Org) |
| 编辑 (`edit`) | ❌ | ❌ | ✅(本 Org) |

> **Org 隔离**: 业务数据一律 Org 隔离, 超管也只能改本公司, 避免 `updatedBy` 跨公司引用。

> **学生自助**: 当前未提供 `/self` 系列接口, 学生通过常规 `list`/`detail` 即可。

> **创建入口**: OrderPack 来源的 StudentPack **不暴露** add 入口, 由 `OrderPack.dao.add` 内部调用 `StudentPackDAO.createFromOrderPack` 自动落地, 用 `OrderPack` 唯一稀疏索引防重复。

---

## 接口列表

### 1. 获取学生课包列表
- **路径**: `POST /api/school/studentPack/list`
- **中间件链**: `authenticate` → `Permission.read` → `listVD` → `controller.list`
- **权限**:
  - Student: 放行(DAO 二次过滤 `filter.Student = currentStudent._id`)
  - Manager: 放行(DAO 自动 `filter.Org = currentUser.Org`)
  - Admin: 放行, 看全平台
  - 其他: 403
- **请求参数**:
  - `filter` (可选):
    - `regExp`    (可选): 模糊匹配 `packName`
    - `Student`   (可选): 学生 ObjectId
    - `Account`   (可选): 家长账户 ObjectId
    - `OrderPack` (可选): 关联订单 ObjectId
    - `Pack`      (可选): 课包 ObjectId
    - `Org`       (可选): 组织 ObjectId
    - `status`    (可选): 状态枚举
    - `resource`  (可选): 来源枚举
  - `options` (可选): 分页/排序/填充

- **响应**:
  ```json
  { "code": 200, "success": true, "message": "操作成功",
    "data": { "total": 100, "items": [ /* StudentPack */ ] } }
  ```

---

### 2. 获取学生课包详情
- **路径**: `POST /api/school/studentPack/detail/:id`
- **中间件链**: `authenticate` → `Permission.read` → `detailVD` → `controller.detail`
- **权限**:
  - Student: `item.Student === currentStudent._id`, 否则 403
  - Manager: `item.Org === currentUser.Org`, 否则 403
  - Admin: 放行
- **路径参数**: `id` (必填, ObjectId)

---

### 3. 手动添加 free 赠送课包
- **路径**: `POST /api/school/studentPack/add`
- **中间件链**: `authenticate` → `Permission.add` → `addVD` → `controller.add`
- **权限**:
  - **仅** User Admin (`isAdmin=true`): ✅
  - User Manager / Student: 403
- **请求参数**:
  - `Student`        (必填): 学生 ObjectId
  - `totalLesson`    (必填): 赠送课时数 (Number, ≥ 1)
  - `packName`       (可选, ≤50): 课包名称, 默认 `'赠送课时'`
  - `description`    (可选, ≤500): 赠送说明 / 活动名称
  - `activeDate`     (可选): 激活日期, 默认当前时间
  - `expireDate`     (可选): 到期日, 默认 `activeDate + 365 天`
  - `remainingLesson`(可选, ≥ 0): 剩余课时, 默认等于 `totalLesson`
  - `status`         (可选): 状态枚举, 默认 `'active'`
  - **禁字段**(传了会被 validator 拒绝):
    - `Account` / `Org` / `Student`  → 由后端从 `Student` 推导
    - `OrderPack` / `Pack`          → 不允许(本接口仅 free)
    - `resource`                    → 固定 `'free'`
    - `LessonAttendances`           → 不可设置, 由消课模块维护
- **DAO 校验**:
  - 必须是 Admin (`isAdmin === true`)
  - 学生必须存在且 `isActive === true`
  - `student.Org === currentUser.Org` (否则 403, 防止跨校区赠送)
  - `remainingLesson ≤ totalLesson` (补发场景)

- **DAO 自动注入**:
  - `Account`     : `student.Account`
  - `Org`         : `student.Org`
  - `resource`    : `'free'`
  - `packName`    : 前端传入或 `'赠送课时'`
  - `remainingLesson`: 前端传入或 `totalLesson`
  - `activeDate`  : 前端传入或 `new Date()`
  - `expireDate`  : 前端传入或 `activeDate + 365 天`
  - `status`      : 前端传入或 `'active'`
  - `createdBy`   : `currentUser._id`

---

### 4. 编辑学生课包
- **路径**: `POST /api/school/studentPack/edit/:id`
- **中间件链**: `authenticate` → `Permission.edit` → `editVD` → `controller.edit`
- **权限**:
  - **仅** User Admin (`isAdmin=true`): ✅
  - User Manager / Student: 403
- **路径参数**: `id` (必填, ObjectId)
- **请求参数** (均可选):
  - `status`         : 状态枚举 (`active` / `frozen` / `exhausted` / `refunded`)
  - `activeDate`     : 激活日期
  - `expireDate`     : 到期日
  - `description`    : 赠送说明
  - `remainingLesson`: 剩余课时 (≤ `totalLesson`, ≥ 0)
- **禁字段**(传了会被 validator 拒绝):
  - `Student` / `Account` / `Org` / `OrderPack` / `Pack` / `resource` / `totalLesson` / `packName` / `LessonAttendances`
- **业务校验**:
  - 目标记录存在
  - `target.Org === currentUser.Org` (Org 隔离, 超管也只能改本公司)
  - `remainingLesson` 不能大于 `totalLesson`, 不能为负
- **自动注入**:
  - `updatedBy` = `currentUser._id`

---

## 字段说明

| 字段 | 类型 | 必填 | 来源 | 说明 |
|---|---|---|---|---|
| `resource` | Enum | ✅(auto) | schema | `'OrderPack'` / `'free'`, 由 DAO 决定 |
| `OrderPack` | ObjectId | - | 订单/auto | 仅 `resource='OrderPack'` 时有值, 唯一稀疏索引防重复 |
| `Student` | ObjectId | ✅(auto) | 前端/auto | 学生, 不可修改 |
| `Account` | ObjectId | ✅(auto) | auto | 由 `Student.Account` 推导 |
| `Pack` | ObjectId | - | auto | 仅 `resource='OrderPack'` 时有值, 来自订单快照 |
| `packName` | String | ✅ | 前端/auto | free 时前端可填, OrderPack 来源由订单冗余 |
| `totalLesson` | Number | ✅ | 前端/auto | free 时前端必填, OrderPack 来源由订单冗余 |
| `LessonAttendances` | [ObjectId] | - | auto | 已上课程列表, 消课时 push |
| `remainingLesson` | Number | ✅(auto) | 前端/auto | 剩余课时, 初始化等于 `totalLesson`, 不可前端覆盖(补发场景 free 可改) |
| `activeDate` | Date | - | 前端/auto | 激活日期, 默认创建时间 |
| `expireDate` | Date | - | 前端/auto | 到期日, OrderPack 来源由 `validDays` 推导, free 默认 +365 天 |
| `status` | Enum | - | 前端 | `active` / `frozen` / `exhausted` / `refunded` |
| `description` | String | - | 前端 | 赠送说明, 仅 free 来源有意义 |
| `Org` | ObjectId | ✅(auto) | auto | 所属组织(不可变) |
| `createdBy` | ObjectId | ✅(auto) | auto | 创建人(不可变) |
| `updatedBy` | ObjectId | - | auto | 更新人 |

---

## 索引

```javascript
// StudentPack.model.js
studentPackSchema.index({ Student: 1, status: 1 });
studentPackSchema.index({ Account: 1 });
studentPackSchema.index({ Org: 1, createdAt: -1 });
// OrderPack 来源时强制唯一, 防止重复落地
studentPackSchema.index(
  { OrderPack: 1 },
  { unique: true, partialFilterExpression: { resource: 'OrderPack' } }
);
```

---

## 自动创建流程

`OrderPack.dao.add` 在订单落库后, 调用 `StudentPackDAO.createFromOrderPack(item, payload, options)`:

1. 查重: `findOne({ OrderPack: orderPack._id })`, 已存在则返回现有记录并 `skipped: true` (不抛错)
2. 构造 StudentPack doc:
   - `resource = 'OrderPack'`
   - 拷贝 `Student` / `Account` / `Org` / `Pack` / `packName` / `totalLesson` 来自订单
   - `remainingLesson = orderPack.totalLesson`
   - `activeDate = new Date()`
   - `expireDate = orderPack.validDays ? activeDate + validDays 天 : null`
   - `status = 'active'`
   - `createdBy = payload.currentUser._id`
3. 落库; 唯一索引冲突 (`code 11000`) 兜底返回现有记录

> OrderPack 创建失败时, StudentPack 不会创建; OrderPack 成功但 StudentPack 失败时, 订单已落库 (控制台记录错误), 业务上可由 admin 后续手动 add 修复 (注意需先删除遗留唯一索引冲突)。

---

## 错误码

| 状态码 | 触发场景 |
|---|---|
| `400` | validator 校验失败 / 必填字段缺失 / `remainingLesson > totalLesson` / `remainingLesson < 0` |
| `403` | Student 调用 list/detail 但不是自己 / Manager 跨 Org / 非 Admin 调用 add 或 edit / 添加 free 时学生与当前用户不同 Org |
| `404` | StudentPack 不存在 / 关联学生不存在或被禁用 / 学生关联的账户不存在或被禁用 |
| `500` | 服务器内部错误 |

---

## 关联模块

- **OrderPack** : 课包订单, 落地后自动触发 StudentPack 创建 ([src/modules/order/orderPack/](../order/orderPack/))
- **Pack**      : 课包定义 ([src/modules/_school/pack/](../pack/))
- **Student**   : 学员信息 ([src/modules/_school/student/](../student/))
- **Account**   : 家长账户 ([src/models/authorization/Account.dao.js](../../../models/authorization/Account.dao.js))
- **LessonAttendance** : 课时出勤, 完成后 push 到 `LessonAttendances` 数组(消课模块, 未实现)
