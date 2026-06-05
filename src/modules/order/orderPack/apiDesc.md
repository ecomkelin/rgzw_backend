# OrderPack 课包订单模块 API 接口文档

> 本模块实现 `OrderPack` 课包订单的 HTTP 接口。模型与 DAO 已存在：
> - 模型: `src/models/pack/OrderPack.model.js`
> - DAO:   `src/models/pack/_OrderPack.dao.js`
> - 模块: `src/modules/order/orderPack/`

## 概述

课包订单（`OrderPack`）记录家长/学生购买课包（`Pack`）的成交信息。

业务流程:
```
学生选 Pack -> 创建 OrderPack (Pending) -> 支付 -> 状态变更为 Paid -> 落地 StudentPack
                                                                     -> 排课消课
```

课包订单归属于组织(`Org`),由 `currentUser.Org` 自动注入。

---

## 枚举

### 支付状态 (`payStatusEnums`)

- `Pending`  : 待支付
- `Paid`     : 已支付
- `Cancelled`: 已取消
- `Refunded` : 已退款

### 支付方式 (`payMethodEnums`)

- `wechat`  : 微信
- `alipay`  : 支付宝
- `cash`    : 现金
- `card`    : 刷卡
- `transfer`: 转账

---

## 业务权限总览

| 操作 | User 管理员 (`isAdmin=true`) | User 经理 (`roleTemp=manager`) | User 普通老师 | Student |
|---|---|---|---|---|
| 列表 (`list`) | 全部 | 本 Org | ❌ | 仅自己(走 DAO 内置过滤) |
| 详情 (`detail`) | 全部 | 本 Org | ❌ | 仅自己 |
| 创建 (`add`) | ✅ | ✅(本 Org) | ❌ | ❌ |
| 编辑 (`edit`) | ✅ | ❌(经理不能改) | ❌ | ❌ |

> **Student 走读接口**: `list / detail` 路由不挂 `userAuthorize`,改由 `readPermission`
> 放行 Student;DAO 在 `list` 时会注入 `filter.Student = currentStudent._id`,
> 在 `detail` 时会比对 `item.Student === currentStudent._id`,确保学生只能看自己。
>
> **User 走读接口**: `list / detail` 由 `readPermission` + DAO 二次过滤共同把控
> 范围(`filter.Org = currentUser.Org`)。
>
> **edit 只允许管理员**: `editPermission` 严格判断 `isAdmin === true`,
> 即便是经理也不能改订单;若需变更支付状态/支付方式等,需走管理员账号。

---

## 接口列表

### 1. 获取订单列表
- **路径**: `POST /api/order/orderPack/list`
- **中间件链**: `authenticate` → `readPermission` → `listVD` → `controller.list`
- **权限**:
  - Student: 放行(DAO 二次过滤 `filter.Student = currentStudent._id`)
  - User 管理员 (`isAdmin=true`): 放行,看全平台
  - User 经理 (`roleTemp=manager`): 放行,DAO 二次过滤 `filter.Org = currentUser.Org`
  - 其他: 403
- **请求参数**:
  - `filter` (可选):
    - `regExp`   (可选): 模糊匹配 `packName`
    - `payStatus`(可选): 支付状态枚举
    - `Account`  (可选): 家长账户 ObjectId
    - `Student`  (可选): 学生 ObjectId
    - `Pack`     (可选): 课包 ObjectId
    - `Org`      (可选): 组织 ObjectId
  - `options` (可选): 分页/排序/填充

- **响应**:
  ```json
  { "code": 200, "success": true, "message": "操作成功",
    "data": { "total": 100, "items": [ /* OrderPack */ ] } }
  ```

---

### 2. 获取订单详情
- **路径**: `POST /api/order/orderPack/detail/:id`
- **中间件链**: `authenticate` → `readPermission` → `detailVD` → `controller.detail`
- **权限**:
  - Student: 放行(DAO 比对 `item.Student === currentStudent._id`)
  - User 管理员: 放行,看全平台
  - User 经理: 放行,DAO 比对 `item.Org === currentUser.Org`
  - 其他: 403
- **路径参数**: `id` (必填, ObjectId)

---

### 3. 创建订单
- **路径**: `POST /api/order/orderPack/add`
- **中间件链**: `authenticate` → `userAuthorize()` → `addPermission` → `addVD` → `controller.add`
- **权限**:
  - User 管理员: ✅
  - User 经理: ✅
  - Student / 普通老师: 403
- **请求参数**:
  - `Student`  (必填): 学生 ObjectId
  - `Pack`     (必填): 课包 ObjectId
  - `finalPrice`(必填): 实付金额,单位:分 (Number, ≥0)
  - `Course`   (可选, **强烈建议填写**): 关联课程 ObjectId(直接报名班级场景)
  - `payStatus`(可选): 默认 `Pending`
  - `payMethod`(可选): 支付方式枚举
  - `transactionId` (可选): 第三方流水号 (≤100)
  - `paidAt`   (可选): 支付时间
  - `remark`   (可选): 备注 (≤500)
- **DAO 自动注入 / 推导**:
  - `Account` : 从 `Student.Account` 自动推导(前端不需要也不应该传)
  - `packName` / `totalLesson` / `validDays` / `priceOrigin` / `priceRegular` / `priceSale`: 从 `Pack` 拉取快照
  - `Org`     : `currentUser.Org`
  - `createdBy`: `currentUser._id`

---

### 4. 更新订单
- **路径**: `POST /api/order/orderPack/edit/:id`
- **中间件链**: `authenticate` → `userAuthorize()` → `editPermission` → `editVD` → `controller.edit`
- **权限**:
  - **仅** User 管理员 (`isAdmin=true`): ✅
  - User 经理: ❌(经理不能改订单)
  - Student / 普通老师: 403
- **路径参数**: `id` (必填, ObjectId)
- **请求参数** (均可选):
  - `payStatus` / `payMethod` / `transactionId` / `paidAt` / `remark`
- **业务逻辑**:
  - 当 `payStatus` 变为 `Paid` 且 `paidAt` 未设置时,DAO 自动写入当前时间为 `paidAt`

---

## 字段说明

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `Account` | ObjectId | ✅(auto) | 家长账户,关联 `Account`;**由后端从 `Student.Account` 自动推导**,前端不需要传 |
| `Student` | ObjectId | ✅ | 学员,关联 `Student` |
| `Pack`    | ObjectId | ✅ | 课包,关联 `Pack` |
| `packName`| String   | ✅ | 课包名称快照 |
| `totalLesson` | Number | ✅ | 购买课时数(快照) |
| `validDays`   | Number | -  | 有效天数(快照) |
| `priceOrigin` / `priceRegular` / `priceSale` | Number | - | 价目快照(单位:分) |
| `finalPrice`  | Number | ✅ | 实付金额(单位:分) |
| `payStatus`   | Enum   | -  | `Pending` / `Paid` / `Cancelled` / `Refunded` |
| `payMethod`   | Enum   | -  | 支付方式 |
| `transactionId` | String | - | 第三方流水号 |
| `paidAt`      | Date   | -  | 支付时间 |
| `Course`      | ObjectId | - | 关联班级(直接报名班级场景);**强烈建议填写** |
| `remark`      | String | -  | 备注 |
| `Org`         | ObjectId | ✅ | 所属组织(自动注入) |
| `createdBy`   | ObjectId | ✅ | 创建人(自动注入) |
| `updatedBy`   | ObjectId | -  | 更新人(自动注入) |

---

## 索引

```javascript
// OrderPack.model.js
orderPackSchema.index({ Account: 1, payStatus: 1 });
orderPackSchema.index({ Student: 1 });
orderPackSchema.index({ Org: 1, createdAt: -1 });
```

---

## 错误码

| 状态码 | 触发场景 |
|---|---|
| `400` | validator 校验失败 |
| `403` | Student 调用 / 普通老师调用 / manager 跨 Org 操作 |
| `404` | 订单不存在 / 关联 Account/Student/Pack 不存在 |
| `500` | 服务器内部错误 |

---

## 关联模块

- **Pack**       : 课包定义 (`src/modules/_school/pack`)
- **Student**    : 学员信息 (`src/modules/_school/student`)
- **Account**    : 家长账户 (`src/models/authorization/Account.dao`)
- **StudentPack**: 学生持有课包 (规划中)
- **Course**     : 课程,可作为 OrderPack 的关联对象
