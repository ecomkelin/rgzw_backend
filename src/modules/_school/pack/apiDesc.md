# Pack 课包模块 API 接口文档

> 本文档反映 **2026-06-04** 后的最终业务逻辑（含 `payloadChecker` 工具校验、Student 可购买课包等改动）。

## 概述

Pack 模块负责学校课包（课时套餐）的管理。课包是供学生/家长购买的产品形态：

- **学生购买场景**：`Pack` → `OrderPack`（订单）→ `StudentPack`（学生持有课包）→ 消课
- **本模块**只管理 `Pack`（课包定义），订单和持有课包分别在 `OrderPack`、`StudentPack` 模块

课包归属于组织(Org)，同一组织下名称必须唯一。

---

## 课包类型枚举 (`typeEnums`)

- `课时包`: 按课时数计费的常规课包
- `学期包`: 学期制课包
- `体验包`: 体验类低价课包
- `定制包`: 1对1 / 小班定制类课包

---

## 业务权限总览

| 操作 | User 管理员 | User Manager | User 普通老师 | Student |
|---|---|---|---|---|
| 列表 (`list`) | 全部 | 本 Org | 本 Org | **全平台 isActive=true**（购买场景）|
| 详情 (`detail`) | 全部 | 本 Org | 本 Org | 全平台 isActive=true（与本 Org 一致）|
| 创建 (`add`) | ✅ | ✅ | ❌ | ❌ |
| 编辑 (`edit`) | ✅ | ✅（限本 Org）| ❌ | ❌ |
| 删除 (`remove`) | ✅ | ✅（限本 Org）| ❌ | ❌ |

> **关键变更**（v 最新版）：
> - Student 拥有 `list` 与 `detail` 权限，**学生购买课包时可浏览所有 `isActive=true` 的课包**
> - Student `list` **不**按 `Org` 过滤（看全平台 `isActive` 课包）
> - Student `detail` **仍然校验 `Org` 匹配**，确保学生跨校买课时无法查看详情

---

## 接口列表

### 1. 获取课包列表
- **路径**: `POST /api/pack/list`
- **描述**: 获取课包列表，支持分页与筛选
- **认证要求**: 需要有效的访问令牌及 `readPermission`
- **中间件链**: `authenticate` → `userAuthorize()` → `readPermission` → `listVD` → `controller.list`
- **权限控制**:
  - **User（管理员/Manager/普通老师）**: 自动按 `payload.currentUser.Org` 过滤
  - **管理员（`isAdmin=true`）**: 看全平台
  - **Student**: 看全平台 `isActive=true` 的课包
- **请求参数**:
  - `filter` (可选): 筛选条件对象
    - `regExp` (可选): 模糊搜索关键字 (0-50位字符串，匹配 `name`)
    - `isActive` (可选): 是否激活 (Boolean)
    - `type` (可选): 课包类型 ('课时包' | '学期包' | '体验包' | '定制包')
    - `Org` (可选): 组织 ObjectId
  - `options` (可选): 分页/排序/填充选项
    - `limit` (可选): 每页数量，默认100
    - `skip` (可选): 跳过的记录数
    - `sort` (可选): 排序对象，格式 `{ field: 1 | -1 }`
    - `populate` (可选): 关联填充数组 `[{ path, select, match, options }]`
- **响应**:
  ```json
  {
    "code": 200,
    "success": true,
    "message": "操作成功",
    "data": {
      "total": 100,
      "items": [...]
    }
  }
  ```

---

### 2. 获取课包详情
- **路径**: `POST /api/pack/detail/:id`
- **描述**: 根据ID获取单个课包的详细信息
- **认证要求**: 需要有效的访问令牌及 `readPermission`
- **中间件链**: `authenticate` → `userAuthorize()` → `readPermission` → `detailVD` → `controller.detail`
- **权限控制**:
  - **User 管理员**: 可看任何课包
  - **User Manager / 普通老师**: 仅可看本 Org 课包（`item.Org` 需匹配 `currentUser.Org`）
  - **Student**: 仅可看 `isActive=true` 且本 Org 的课包
- **路径参数**: `id` - 课包ID (必填, ObjectId)
- **请求参数**:
  - `options.populate` (可选): 关联填充数组
- **错误响应**:
  - `403`: 学生访问 `isActive=false` 的课包
  - `403`: 跨 Org 访问

---

### 3. 创建课包
- **路径**: `POST /api/pack/add`
- **描述**: 创建新课包
- **认证要求**: 需要有效的访问令牌及 `addPermission`
- **中间件链**: `authenticate` → `userAuthorize()` → `addPermission` → `addVD` → `controller.add`
- **权限控制**:
  - **必须是 User**（Student 拒绝）
  - **管理员**: 可建任何课包，`Org` 由系统自动设置为 `currentUser.Org`
  - **Manager** (`roleTemp === 'manager'`): 可建本 Org 课包
  - **普通老师**: 拒绝
- **请求参数**:
  - `name` (必填): 课包名称 (2-100位字符串)
  - `type` (必填): 课包类型枚举值
  - `description` (必填): 课包描述 (2-100位字符串)
  - `totalLesson` (必填): 课包总课时 (Number, ≥0, 默认 16)
  - `priceOrigin` (必填): 原价，单位：分 (Number, ≥0)
  - `priceRegular` (必填): 常规售价，单位：分 (Number, ≥0)
  - `priceSale` (必填): 活动价，单位：分 (Number, ≥0)
  - `applicableSubjects` (必填): 适用科目描述 (2-100位字符串)
  - `applicableLevels` (必填): 适用级别描述 (2-100位字符串)
  - `isActive` (必填): 是否激活 (Boolean)
  - `validDays` (可选): 购买后有效天数 (Number)
  - `expireDate` (可选): 固定到期日 (Date)
  - `sort` (可选): 排序值 (Number)
  - `Org` (可选): 组织 ObjectId（系统会自动设置为 `currentUser.Org`）
- **自动注入字段**:
  - `Org`: 当前用户所在组织
  - `createdBy`: 当前用户ID

---

### 4. 更新课包信息
- **路径**: `POST /api/pack/edit/:id`
- **描述**: 根据ID更新课包信息
- **认证要求**: 需要有效的访问令牌及 `editPermission`
- **中间件链**: `authenticate` → `userAuthorize()` → `editPermission` → `editVD` → `controller.edit`
- **权限控制**:
  - **必须是 User**（Student 拒绝）
  - **管理员**: 可编辑任何课包
  - **Manager** (`roleTemp === 'manager'`): 仅可编辑本 Org 课包
  - **普通老师**: 拒绝
- **路径参数**: `id` - 课包ID (必填, ObjectId)
- **请求参数** (所有字段均可选):
  - `name` (可选): 课包名称 (2-100位字符串)
  - `type` (可选): 课包类型
  - `description` (可选): 课包描述
  - `totalLesson` (可选): 课包总课时 (Number, ≥0)
  - `priceOrigin` / `priceRegular` / `priceSale` (可选): 价格
  - `applicableSubjects` / `applicableLevels` (可选): 适用范围
  - `isActive` (可选): 是否激活
  - `sort` (可选): 排序值
- **自动注入字段**:
  - `updatedBy`: 当前用户ID

---

### 5. 删除课包
- **路径**: `POST /api/pack/remove/:id`
- **描述**: 根据ID删除课包
- **认证要求**: 需要有效的访问令牌及 `managePermission`
- **中间件链**: `authenticate` → `userAuthorize()` → `managePermission` → `removeVD` → `controller.remove`
- **权限控制**:
  - **必须是 User**（Student 拒绝）
  - **管理员**: 可删除任何课包
  - **Manager** (`roleTemp === 'manager'`): 仅可删除本 Org 课包
  - **普通老师**: 拒绝
- **业务校验**:
  - 若 `OrderPack` 中存在 `Pack === _id` 的订单记录 → **拒绝删除**（使用 `countDocuments` 统计）
- **路径参数**: `id` - 课包ID (必填, ObjectId)

---

## 字段说明表

| 字段名 | 类型 | 必填 | 默认 | 说明 |
|---|---|---|---|---|
| `name` | String | ✅ | - | 课包名称，如"Python 16课时常规包" |
| `type` | String (Enum) | ✅ | `'课时包'` | 课包类型 |
| `description` | String | 否 | - | 课包描述 |
| `totalLesson` | Number | ✅ | `16` | 课包总课时（消课按次扣，1次课消耗1课时）|
| `validDays` | Number | 否 | - | 购买后有效天数，如 365 表示一年 |
| `expireDate` | Date | 否 | - | 固定到期日（一般不用）|
| `priceOrigin` | Number | ✅ | - | 原价（单位：分）|
| `priceRegular` | Number | ✅ | - | 常规售价（单位：分）|
| `priceSale` | Number | 否 | - | 活动价（可配合活动/优惠券）|
| `applicableSubjects` | String | 否 | - | 适用科目描述，如"Python、C++" |
| `applicableLevels` | String | 否 | - | 适用级别，如"初级、中级" |
| `isActive` | Boolean | 否 | `true` | 是否激活（学生 `list` 时此字段为 `true`）|
| `sort` | Number | 否 | `0` | 排序值 |
| `Org` | ObjectId | ✅ (auto) | - | 所属组织（自动从当前用户注入）|
| `createdBy` | ObjectId | ✅ (auto) | - | 创建者 (自动注入) |
| `updatedBy` | ObjectId | 否 (auto) | - | 更新者 (自动注入) |

---

## 权限说明

- `readPermission`: 读取权限
  - **超管**: 可读所有
  - **manager**: 读本 Org
  - **普通老师**: 读本 Org
  - **学生**: 读全平台 isActive=true 的课包（购买场景）
- `addPermission`: 创建权限
  - **超管 / manager**: 可建本 Org 课包
  - **普通老师 / 学生**: 无权
- `editPermission`: 编辑权限
  - **超管**: 编辑任意
  - **manager**: 仅本 Org
  - **普通老师 / 学生**: 无权
- `managePermission`: 删除权限
  - **超管**: 删除任意
  - **manager**: 仅本 Org
  - **普通老师 / 学生**: 无权

---

## 业务约束

1. **同组织课包名唯一**: `name` 字段在 `Org` 范围内唯一（`{ name: 1, Org: 1 }` 联合唯一索引）
2. **Org 自动归属**: 课包创建时 `Org` 自动设置为当前用户的 Org
3. **价格单位**: 所有价格字段单位均为**分**
4. **学生可购买场景**:
   - `list` 时学生看**全平台** `isActive=true` 的课包（不限 Org）
   - `detail` 时学生**仍然校验 Org 匹配**（防止跨校查看详情）
   - 业务上：学生列表浏览 → 选择 → 跳详情 → 确认购买
5. **删除保护**: 课包若已产生 `OrderPack` 订单，禁止物理删除（建议用 `isActive=false` 软删除）
6. **createdBy / updatedBy**: 由系统在 DAO 层自动注入，前端无需传

---

## 索引

```javascript
// Pack.model.js
packSchema.index({ Org: 1, isActive: 1 });             // 列表查询优化
packSchema.index({ name: 1, Org: 1 }, { unique: true }); // 同机构下课包名不重复
```

---

## 响应格式

所有接口均采用统一的响应格式：

```json
{
  "code": 200,
  "success": true,
  "message": "操作成功",
  "data": {}
}
```

## 错误码说明

| 状态码 | 含义 | 触发场景 |
|---|---|---|
| `200` | 操作成功 | - |
| `400` | 请求参数错误 | validator 校验失败 |
| `401` | 未授权 | 缺少 token、token 过期、session 失效 |
| `403` | 无权限 | Student 调用 add/edit/remove；普通老师调用 add/edit/remove；manager 跨 Org 操作；学生访问非 isActive 课包 |
| `404` | 课包不存在 | 详情/编辑/删除时未找到 |
| `500` | 服务器内部错误 | - |

---

## 关联模块

- **OrderPack**: 课包订单（购买时落地）
- **StudentPack**: 学生持有课包（消课时使用）
- **Course**: 课程（未来 Pack 可指定适用课程）
- **Subject**: 科目（通过 `applicableSubjects` 描述关联）

---

## 实现说明

### Service 层 (`service.js`)

- 在 `add` / `edit` 操作前调用 `deleteImmutableFront(doc, PackDOC)` 移除前端不可变字段
- `remove` 仅调用 DAO，**不在 service 层做关联检查**（由 DAO 完成）

### DAO 层 (`Pack.dao.js`)

- 使用 `payloadChecker` 工具校验 payload 完整性
- `list` 中:
  - User 非管理员自动加 `filter.Org = currentUser.Org`
  - Student 加 `filter.isActive = true`（看全平台可购买课包）
- `remove` 中使用 `countDocuments` 统计关联订单（>0 则拒绝）
- 所有操作通过 `userPayloadChecker` / `studentPayloadChecker` 强制类型检查
