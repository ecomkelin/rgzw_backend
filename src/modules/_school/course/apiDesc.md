# Course 课程模块 API 接口文档

## 概述

Course 模块负责学校课程（班级）的管理。课程归属于科目(Subject)与组织(Org)，主讲老师必填，关联默认教室。学生通过选课进入课程，课程状态决定其可见性与可修改范围。

- **必传身份**: 登录账户（`User` 管理员/经理，或 `Student` 学生）
- **作用域**: 课程数据按 `Org`（所属机构）隔离
- **不可删**: 课程不可物理删除，禁用请使用 `edit` 接口将 `isActive` 置为 `false`
- **业务权限规则**: 课程模块只允许以下账户访问
  - `User` 账号且 `isAdmin === true`
  - `User` 账号且 `currentUser.roleTemp === 'manager'`
  - `Student` 账号（仅 `list / detail`）

## 状态枚举 (`statusEnums`)

| 值 | 含义 | 学生可见 | 主要信息可改 |
| --- | --- | --- | --- |
| `draft` | 草稿 | ❌ | ✅ |
| `enrolling` | 招生中 | ✅ | ⚠️ 仅管理员可在 DAO 内做精细控制（当前实现未按状态锁定字段，参考下方备注）|
| `ongoing` | 进行中 | ✅ | ⚠️ 同上 |
| `finished` | 已结束 | ❌ | ❌ |
| `cancelled` | 已取消 | ❌ | ❌ |

> ⚠️ 备注：v7.4.4 之前的 `filterUpdatableFields` 函数已被删除。当前 `edit` 接口在状态为 `enrolling / ongoing / finished / cancelled` 时，**任何字段都允许修改**（包括 name、price、mainTeacher）。若需恢复状态字段锁定，请参考本文档末尾「遗留问题」#1。

## 排课频率枚举 (`frequencyEnums`)

- `weekly`: 每周排课
- `daily`: 每日排课（默认周一到周五）
- `custom`: 自定义排课

## 接口列表

### 1. 获取课程列表
- **路径**: `POST /api/course/list`
- **描述**: 获取课程列表，支持分页、筛选与排序
- **认证要求**: 需有效访问令牌
- **中间件链**: `authenticate → listVD → list`
- **权限控制**（DAO 层强制）:
  - `Student` 身份: 仅返回 `enrolling / ongoing` 状态的课程
  - `User` 身份 + admin: 全部课程
  - `User` 身份 + manager: 仅本 `Org` 课程
  - `User` 其他角色（老师/普通员工）: 403
  - 默认按 `status NOT IN [finished, cancelled]` 过滤（除非 `filter.status` 显式指定）
- **请求参数**:
  - `filter` (可选): 筛选条件对象
    - `regExp` (可选): 模糊匹配关键字 (0-50位字符串，匹配 `name` 字段)
    - `isActive` (可选): 是否激活 (Boolean)
    - `status` (可选): 课程状态 (`draft` / `enrolling` / `ongoing` / `finished` / `cancelled`)
    - `Org` (可选): 组织 ObjectId
    - `frequency` (可选): 排课频率
  - `options` (可选): 分页和排序选项
    - `limit` (可选): 每页数量，默认 100，受 `MAX_HANDLE_ITEM` 限制
    - `skip` (可选): 跳过的记录数
    - `sort` (可选): 排序对象，格式 `{ fieldString: 1 | -1 }`
    - `populate` (可选): 关联填充数组 `[{ path: '', select: '', match: {}, options: { sort, limit, skip } }]`
- **响应**:
  ```json
  {
    "code": 200,
    "success": true,
    "data": {
      "total": 25,
      "items": [ { "...": "Course 文档" } ]
    }
  }
  ```

### 2. 获取课程详情
- **路径**: `POST /api/course/detail/:id`
- **描述**: 根据 ID 获取单个课程的详细信息
- **认证要求**: 需有效访问令牌
- **中间件链**: `authenticate → detailVD → detail`
- **权限控制**（DAO 层强制）:
  - `Student` 身份:
    - 状态为 `enrolling / ongoing`: 直接放行
    - 其他状态: 必须存在 `StudentCourse` 报名记录，否则 403
  - `User` 身份 + admin: 任意课程
  - `User` 身份 + manager: 仅本 `Org` 课程
  - `User` 其他角色: 403
- **路径参数**: `id` - 课程 ID（必填, ObjectId）
- **请求参数**:
  - `options` (可选): 查询选项对象
    - `populate` (可选): 关联填充数组
- **响应**:
  ```json
  {
    "code": 200,
    "success": true,
    "data": { "item": { "...": "Course 文档" } }
  }
  ```

### 3. 创建课程
- **路径**: `POST /api/course/add`
- **描述**: 创建新课程（班级）
- **认证要求**: 需有效访问令牌及创建权限 (`addPermission`)
- **中间件链**: `authenticate → addPermission → addVD → add`
- **权限控制**:
  - 必须是 `User` 身份（学生账户会被 `addPermission` 中间件 403 拒绝）
  - admin: 可创建
  - manager: 可创建（`Org` 自动取自身所属）
  - 其他: 403
- **请求参数**:
  - `Subject` (必填): 科目 ObjectId（必须存在）
  - `name` (必填): 班级名称 (2-100位字符串，**immutable**)
  - `mainTeacher` (必填): 主讲老师 ObjectId（必须存在）
  - `frequency` (必填): 排课频率 (`weekly` / `daily` / `custom`)
  - `totalSessions` (必填): 总课次（Number, ≥0，**immutable**）
  - `defaultRoom` (必填): 默认教室 ObjectId（必须存在）
  - `maxStudents` (必填): 最大学生数（Number, ≥0）
  - `price` (必填): 报名价格，单位：分（Number, ≥0，**immutable**）
  - `status` (必填): 状态 (`draft` / `enrolling` / `ongoing` / `finished` / `cancelled`)
  - `isActive` (必填): 是否激活 (Boolean)
  - `assistantTeacher` (可选): 助教 ObjectId
  - `startDate` (可选): 开班日期 (Date)
  - `endDate` (可选): 预计结课日期 (Date)
  - `scheduleRules` (可选): 排课规则数组
    - `scheduleRules.*.dayOfWeek` (必填): 星期 (Number, 0-6, 0=周日)
    - `scheduleRules.*.startTime` (必填): 开始时间 (String, 如 "18:30")
    - `scheduleRules.*.endTime` (必填): 结束时间 (String, 如 "20:30")
  - `publishDate` (可选): 对外发布/招生日期 (Date)
  - `features` (可选): 本期特色 (0-500位)
  - `description` (可选): 详细描述 (0-2000位)
  - `posterUrl` (可选): 海报URL (0-500位)
  - `videoUrl` (可选): 整体课程视频URL (0-500位)
  - `highlightVideoUrl` (可选): 精彩集锦视频URL (0-500位)
  - `sort` (可选): 排序值 (Number)
  - `Org` (可选): 组织 ObjectId（**实际不生效**——DAO 无条件覆盖为 `currentUser.Org`）
- **业务校验**（DAO 层执行）:
  - `Subject` 必须存在，否则 404
  - `defaultRoom` 必须存在，否则 404
  - `mainTeacher` 必须存在，否则 404
  - `Org` 自动注入为当前用户所属 `Org`
  - `createdBy` 自动注入为当前用户
  - `displayName` 等其他字段无校验
- **响应**:
  ```json
  {
    "code": 200,
    "success": true,
    "data": { "item": { "...": "Course 文档" } }
  }
  ```

### 4. 更新课程信息
- **路径**: `POST /api/course/edit/:id`
- **描述**: 根据 ID 更新课程
- **认证要求**: 需有效访问令牌及编辑权限 (`editPermission`)
- **中间件链**: `authenticate → editPermission → editVD → edit`
- **权限控制**:
  - 必须是 `User` 身份
  - admin: 可编辑任意课程
  - manager: 仅可编辑本 `Org` 课程
  - 其他: 403
- **路径参数**: `id` - 课程 ID（必填, ObjectId）
- **请求参数**（所有字段均可选）:
  - `mainTeacher` (可选): 主讲老师 ObjectId
  - `assistantTeacher` (可选): 助教 ObjectId
  - `startDate` (可选): 开班日期 (Date)
  - `endDate` (可选): 预计结课日期 (Date)
  - `frequency` (可选): 排课频率
  - `scheduleRules` (可选): 排课规则数组
  - `defaultRoom` (可选): 默认教室 ObjectId
  - `maxStudents` (可选): 最大学生数 (Number)
  - `status` (可选): 状态（**注意：状态字段无任何约束**——见下方备注）
  - `publishDate` (可选): 对外发布/招生日期 (Date)
  - `features` (可选): 本期特色
  - `description` (可选): 详细描述
  - `posterUrl` (可选): 海报URL
  - `videoUrl` (可选): 整体课程视频URL
  - `highlightVideoUrl` (可选): 精彩集锦视频URL
  - `isActive` (可选): 是否激活
  - `sort` (可选): 排序值
- **业务校验**（DAO 层执行）:
  - **取消课程限制**: 若 `doc.status === 'cancelled'` 且课程当前状态不是 `cancelled`，并且存在 `StudentCourse` 记录（状态为 `active` 或 `finished`），则 400
  - `updatedBy` 自动注入为当前用户
- **不可编辑字段**（在 service 层通过 `deleteImmutableFront` 剔除）:
  - `updatedBy` 字段（`immutableFront: true`）会被剔除，由 DAO 重新注入
- **错误响应**:
  - `404`: 课程不存在
  - `403`: 跨 `Org` 编辑 / 角色不足
  - `400`: 存在学生报名时不能修改为 `cancelled`
- **响应**: `item` - 更新后的课程文档

### 5. 删除课程（暂未启用 ⏳）
- **路径**: `POST /api/course/remove/:id`（**当前路由已注释**）
- **状态**: 暂未启用。controller、service、DAO、validator 中的 `remove` 全部已注释
- **设计意图**（参考，未生效）:
  - 若存在 `StudentCourse` 关联记录则不可删
  - 仅 admin 可跨 `Org` 删；manager 仅可删本 `Org`；老师仅可删自己主讲的

## 字段说明（Course 模型）

| 字段名 | 类型 | 必填 | 可变 | 说明 |
| --- | --- | --- | --- | --- |
| `Subject` | ObjectId (ref: Subject) | ✅ | ❌ immutable | 所属科目 ID |
| `name` | String | ✅ | ❌ immutable | 班级名称，如 "2026春Python初级班" |
| `mainTeacher` | ObjectId (ref: User) | ✅ | ✅ | 主讲老师 |
| `assistantTeacher` | ObjectId (ref: User) | ❌ | ✅ | 助教 |
| `startDate` | Date | ❌ | ✅ | 开班日期 |
| `endDate` | Date | ❌ | ✅ | 预计结课日期 |
| `totalSessions` | Number | ✅ | ❌ immutable | 总课次（创建后不可改） |
| `frequency` | String (Enum) | ❌ (default: `weekly`) | ✅ | 排课频率 |
| `scheduleRules` | Array | ❌ | ✅ | 排课规则 |
| `scheduleRules[].dayOfWeek` | Number | ✅ | ✅ | 星期 (0-6, 0=周日) |
| `scheduleRules[].startTime` | String | ✅ | ✅ | 开始时间，如 "18:30" |
| `scheduleRules[].endTime` | String | ✅ | ✅ | 结束时间，如 "20:30" |
| `defaultRoom` | ObjectId (ref: Room) | ✅ | ✅ | 默认教室 |
| `maxStudents` | Number | ❌ (default: 8) | ✅ | 最大学生数 |
| `price` | Number | ✅ | ❌ immutable | 报名价格，单位：分（immutable） |
| `status` | String (Enum) | ❌ (default: `draft`) | ✅ | 课程状态 |
| `publishDate` | Date | ❌ | ✅ | 对外发布/招生日期 |
| `features` | String | ❌ | ✅ | 本期特色 |
| `description` | String | ❌ | ✅ | 详细描述 |
| `posterUrl` | String | ❌ | ✅ | 海报URL |
| `videoUrl` | String | ❌ | ✅ | 整体课程视频URL |
| `highlightVideoUrl` | String | ❌ | ✅ | 精彩集锦视频URL |
| `isActive` | Boolean | ❌ (default: true) | ✅ | 是否激活 |
| `sort` | Number | ❌ (default: 0) | ✅ | 排序值 |
| `Org` | ObjectId (ref: Org) | ✅ | ❌ immutable | 所属组织（DAO 自动注入） |
| `createdBy` | ObjectId (ref: User) | ✅ (auto) | ❌ immutable | 创建者（DAO 自动注入） |
| `updatedBy` | ObjectId (ref: User) | ❌ (auto) | ❌ immutableFront | 最后修改人（DAO 自动注入） |
| `createdAt` / `updatedAt` | Date | auto | — | Mongoose timestamps |

## 权限矩阵

| 接口 | Student | User + admin | User + manager | User + 其他 |
| --- | --- | --- | --- | --- |
| `POST /list` | ✅ 仅 enrolling/ongoing | ✅ 全部 | ✅ 本 Org | ❌ 403 |
| `POST /detail/:id` | ✅ enrolling/ongoing 直接通过；其他状态需已报名 | ✅ 任意 | ✅ 本 Org | ❌ 403 |
| `POST /add` | ❌ 403 | ✅ | ✅ | ❌ 403 |
| `POST /edit/:id` | ❌ 403 | ✅ | ✅ 本 Org | ❌ 403 |
| `POST /remove/:id` | 暂未启用 | 暂未启用 | 暂未启用 | 暂未启用 |

## 索引

| 索引 | 说明 |
| --- | --- |
| `{ Subject: 1, status: 1 }` | 按科目查询某状态课程 |
| `{ Org: 1, status: 1 }` | 按机构查询某状态课程 |
| `{ mainTeacher: 1, status: 1 }` | 按主讲老师查询某状态课程 |

## 业务约束

1. **Subject 不可变**: 创建后 `Subject` 永远不可修改（`immutable: true`）
2. **name / totalSessions / price 不可变**: 创建后这三字段不可修改（`immutable: true`）
3. **Org 自动归属**: `Org` 字段在 `add` 时由 DAO 无条件覆盖为 `currentUser.Org`（**忽略前端传入的 `Org`**）
4. **createdBy / updatedBy 自动注入**: 由 DAO 注入，前端无法传
5. **跨 Org 隔离**: 任何身份（包括 admin 之外）修改/查看非本 Org 课程都会被 403
6. **取消课程限制**: 存在 `StudentCourse` 关联（状态为 `active` 或 `finished`）的课程不能将状态修改为 `cancelled`
7. **不可删**: Course 模块未提供 `remove` 接口，禁用请改 `isActive = false`
8. **状态字段无锁定**: 详见「遗留问题」#1

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
| `400` | 参数/业务校验失败 | 必填字段缺失、Subject/Room/Teacher 找不到、存在学生报名时取消课程 |
| `403` | 权限不足 | 非 manager 访问 list/edit/edit、跨 Org 编辑、非管理员以外的角色调 `add` |
| `404` | 资源不存在 | Subject/Room/Teacher 找不到、课程不存在 |
| `500` | 服务器内部错误 | 兜底错误 |

---

## 📋 遗留问题（需后续修复）

### 1. ⚠️ 状态字段锁定已失效

v7.4.4 之前实现的 `filterUpdatableFields` 函数（按状态锁定 `name / price / mainTeacher` 等字段）**已在最近一次重构中删除**。当前 `edit` 接口在状态为 `enrolling / ongoing / finished / cancelled` 时，**任何字段都允许修改**。

**影响**：
- 课程已开班（enrolling/ongoing）后，admin/manager 仍可改 `name`、`price`、`mainTeacher`、`maxStudents`
- 已结束/已取消的课程也可任意改字段

**恢复方案**（如需）：
```js
// Course.dao.js edit 函数中, 在 targetCourse.set(doc) 之前:
const updatableDoc = filterUpdatableFields(targetCourse.status, doc);
targetCourse.set(updatableDoc);
```
（需把 `filterUpdatableFields` 函数重新加回来，参考 git 历史 v7.4.3 及之前版本）

### 2. ⚠️ `add` 路由层 `Org` 字段无意义

`addVD` 中允许 `Org` 字段（`optionalObjectId`），但 DAO `add` 函数中：
```js
doc.Org = payload.currentUser.Org;  // 无条件覆盖
```
会无条件覆盖为 `currentUser.Org`。前端传的 `Org` 永远无效。**建议从 `addVD` 中删除该字段**或在 DAO 中加 warning。

### 3. ⚠️ `Subject.Org` 与 `doc.Org` 一致性无校验

admin 创建课程时，可传一个属于 OrgA 的 `Subject`，但课程本身属于 OrgB。建议在 DAO `add` 中加：
```js
if (subject.Org?.toString() !== payload.currentUser.Org.toString() && !payload.isAdmin) {
  throw ({ code: 400, message: "Subject 不属于本机构" });
}
```

### 4. ⚠️ `updatedBy` 写入顺序脆弱

`updatedBy` 在 model 中标记为 `immutableFront: true`，会在 `service.edit` 中被 `deleteImmutableFront` 剔除，然后由 `dao.edit` 重新注入。流程可工作但脆弱：
- 若有别的代码路径绕过 service 直调 DAO，`updatedBy` 会丢失
- **建议**：把 model 中 `updatedBy` 改为 `immutableFront: false`（让 `deleteImmutableFront` 不剔除），由 DAO 端继续注入

### 5. ⚠️ `permission.js` 仍 export 未被路由使用的 `readPermission` / `managePermission`

[index.routes.js](src/modules/_school/course/index.routes.js) 只 import 了 `addPermission, editPermission`。`readPermission` 和 `managePermission` 是死代码。功能不受影响，下次清理时一起删。

### 6. ⚠️ 路由层无 `accountType` / `userAuthorize` 校验

`list / detail` 路由只有 `authenticate`，没有 `userAuthorize()`。完全靠 DAO 做权限判断。如果未来某个新接口忘了在 DAO 加判断，会全部裸奔。`add / edit` 还有 `addPermission / editPermission` 兜底。建议考虑统一加一道中间件。
