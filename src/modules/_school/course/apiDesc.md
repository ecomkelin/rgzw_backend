# Course 课程模块 API 接口文档

## 概述

Course 模块负责学校课程（班级）的管理，包括课程的增删改查。课程归属于科目(Subject)与组织(Org)，主讲老师必须存在，并关联默认教室。课程状态决定了字段的可修改范围和前端可见性。

## 状态枚举 (statusEnums)

- `draft` (草稿): 学生不可见，所有字段可改
- `enrolling` (招生中): 学生可见，主要信息不可变，仅状态与内容包装字段可改
- `ongoing` (进行中): 学生可见，主要信息不可变，仅状态与内容包装字段可改
- `finished` (已结束): 学生不可见，所有字段不可改，仅状态可改
- `cancelled` (已取消): 学生不可见，所有字段不可改，仅状态可改

## 排课频率枚举 (frequencyEnums)

- `weekly`: 每周排课
- `daily`: 每日排课（默认周一到周五）
- `custom`: 自定义排课

## 接口列表

### 1. 获取课程列表
- **路径**: `POST /api/course/list`
- **描述**: 获取课程列表，支持分页、筛选与排序
- **认证要求**: 需要有效的访问令牌及读取权限 (`readPermission`)
- **权限控制**:
  - 学生(Student) 只能查看 `enrolling` / `ongoing` 状态的课程
  - 普通老师 只能查看自己主讲或助教、且属于本组织(Org)的课程
  - 管理员 / manager 可查看本组织全部课程
  - 默认过滤掉 `finished` 和 `cancelled` 状态（除非 filter.status 显式指定）
- **请求参数**:
  - `filter` (可选): 筛选条件对象
    - `regExp` (可选): 正则表达式搜索 (0-50位字符串，模糊匹配 `name` 字段)
    - `isActive` (可选): 是否激活 (Boolean)
    - `status` (可选): 课程状态 ('draft' | 'enrolling' | 'ongoing' | 'finished' | 'cancelled')
    - `Org` (可选): 组织 ObjectId
    - `frequency` (可选): 排课频率 ('weekly' | 'daily' | 'custom')
  - `options` (可选): 分页和排序选项对象
    - `limit` (可选): 每页数量，默认100，最大值受 MAX_HANDLE_ITEM 限制
    - `skip` (可选): 跳过的记录数
    - `sortObj` (可选): 排序对象，格式 `{ fieldString: 1 | -1 }`
    - `populate` (可选): 关联填充数组 `[{ path: '', select: '', match: {}, options: { sort, limit, skip } }]`
- **响应**:
  - `total`: 总数
  - `items`: 课程列表

### 2. 获取课程详情
- **路径**: `POST /api/course/detail/:id`
- **描述**: 根据ID获取单个课程的详细信息
- **认证要求**: 需要有效的访问令牌及读取权限 (`readPermission`)
- **权限控制**:
  - 学生(Student) 只能查看 `enrolling` / `ongoing` 状态的课程，或自己已报名的课程
  - 普通老师 只能查看自己主讲或助教、且属于本组织(Org)的课程
  - 管理员 / manager 可查看本组织全部课程
- **路径参数**: `id` - 课程ID (必填, ObjectId)
- **请求参数**:
  - `options` (可选): 查询选项对象
    - `populate` (可选): 关联填充数组
- **响应**: `item` - 课程详细信息

### 3. 创建课程
- **路径**: `POST /api/course/add`
- **描述**: 创建新课程（班级）
- **认证要求**: 需要有效的访问令牌及创建权限 (`addPermission`)
- **权限控制**:
  - 必须是 User 身份（非学生）
  - 只有管理员(admin)或 manager 角色才能创建课程
  - 课程将自动归属于当前用户所在组织(Org)
  - `createdBy` 字段自动设置为当前用户
- **请求参数**:
  - `Subject` (必填): 科目 ObjectId （必须存在）
  - `name` (必填): 班级名称 (2-100位字符串)
  - `mainTeacher` (必填): 主讲老师 ObjectId （必须存在）
  - `defaultRoom` (必填): 默认教室 ObjectId （必须存在）
  - `totalSessions` (必填): 总课次 (Number, ≥0)
  - `frequency` (必填): 排课频率 ('weekly' | 'daily' | 'custom')
  - `maxStudents` (必填): 最大学生数 (Number, ≥0)
  - `price` (必填): 报名价格，单位：分 (Number, ≥0)
  - `status` (必填): 状态 ('draft' | 'enrolling' | 'ongoing' | 'finished' | 'cancelled')
  - `isActive` (必填): 是否激活 (Boolean)
  - `assistantTeacher` (可选): 助教 ObjectId
  - `startDate` (可选): 开班日期 (Date)
  - `endDate` (可选): 预计结课日期 (Date)
  - `publishDate` (可选): 对外发布/招生日期 (Date)
  - `scheduleRules` (可选): 排课规则数组
    - `scheduleRules.*.dayOfWeek` (必填): 星期 (Number, 0-6, 0=周日)
    - `scheduleRules.*.startTime` (必填): 开始时间 (String, 例: "18:30")
    - `scheduleRules.*.endTime` (必填): 结束时间 (String, 例: "20:00")
  - `features` (可选): 本期特色 (String, 0-500位)
  - `description` (可选): 详细描述 (String, 0-2000位)
  - `posterUrl` (可选): 海报URL (String, 0-500位)
  - `videoUrl` (可选): 整体课程视频URL (String, 0-500位)
  - `highlightVideoUrl` (可选): 精彩集锦视频URL (String, 0-500位)
  - `sort` (可选): 排序值 (Number)
  - `Org` (可选): 组织 ObjectId (若不传则自动设为当前用户所在组织)
- **业务校验**:
  - Subject 必须存在
  - defaultRoom 必须存在
  - mainTeacher 必须存在
- **响应**: `item` - 创建的课程信息

### 4. 更新课程信息
- **路径**: `POST /api/course/edit/:id`
- **描述**: 根据ID更新课程信息（带状态约束）
- **认证要求**: 需要有效的访问令牌及编辑权限 (`editPermission`)
- **权限控制**:
  - 必须是 User 身份（非学生）
  - 管理员 / manager: 可编辑本组织任意课程
  - 普通老师: 只能编辑自己主讲的、且属于本组织(Org)的课程
- **路径参数**: `id` - 课程ID (必填, ObjectId)
- **请求参数** (所有字段均可选，按状态决定是否生效):
  - `name` (可选): 班级名称 (2-100位字符串)
  - `mainTeacher` (可选): 主讲老师 ObjectId
  - `assistantTeacher` (可选): 助教 ObjectId
  - `startDate` (可选): 开班日期 (Date)
  - `endDate` (可选): 预计结课日期 (Date)
  - `totalSessions` (可选): 总课次 (Number, ≥0)
  - `frequency` (可选): 排课频率
  - `scheduleRules` (可选): 排课规则数组
  - `defaultRoom` (可选): 默认教室 ObjectId
  - `maxStudents` (可选): 最大学生数 (Number, ≥0)
  - `price` (可选): 报名价格 (Number, ≥0)
  - `status` (可选): 状态（可任意时刻修改，触发状态流转校验）
  - `publishDate` (可选): 对外发布/招生日期 (Date)
  - `features` (可选): 本期特色 (String)
  - `description` (可选): 详细描述 (String)
  - `posterUrl` (可选): 海报URL (String)
  - `videoUrl` (可选): 整体课程视频URL (String)
  - `highlightVideoUrl` (可选): 精彩集锦视频URL (String)
  - `isActive` (可选): 是否激活 (Boolean)
  - `sort` (可选): 排序值 (Number)
- **状态约束** (重要):

  | 当前状态 | 不可修改字段 | 仅可修改 |
  | --- | --- | --- |
  | `draft` | 无 (除 immutable 字段外) | 全部字段 |
  | `enrolling` / `ongoing` | Subject, name, mainTeacher, startDate, totalSessions, maxStudents, price | status, features, description, posterUrl, videoUrl, highlightVideoUrl, endDate, scheduleRules, defaultRoom, assistantTeacher, frequency, isActive, sort |
  | `finished` / `cancelled` | 除 status 外全部字段 | 仅 status |

- **业务校验**:
  - **取消课程限制**: 如果课程存在 `StudentCourse` 记录（状态为 `active` 或 `finished`），则不能将状态修改为 `cancelled`
- **错误响应**:
  - `400`: 尝试修改被状态锁定的字段时，会列出具体被阻止的字段名
  - `404`: 课程不存在
  - `403`: 无权修改该课程
- **响应**: `item` - 更新后的课程信息

### 5. 删除课程 (暂未启用)
- **路径**: `POST /api/course/remove/:id`
- **描述**: 根据ID删除课程
- **状态**: 暂未启用（路由已注释）
- **路径参数**: `id` - 课程ID (必填, ObjectId)
- **业务校验**:
  - 若存在 `StudentCourse` 记录，则无法删除
  - 物理删除（建议改用 `isActive: false` 软删除）

## 字段说明

| 字段名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `Subject` | ObjectId | 是 (immutable) | 所属科目 ID，创建后不可修改 |
| `name` | String | 是 | 班级名称，如"2026春Python初级班" |
| `mainTeacher` | ObjectId | 是 | 主讲老师 |
| `assistantTeacher` | ObjectId | 否 | 助教 |
| `startDate` | Date | 否 | 开班日期 |
| `endDate` | Date | 否 | 预计结课日期 |
| `totalSessions` | Number | 是 | 总课次（默认从 Subject.default_lesson_count 带入，可覆盖） |
| `frequency` | String (Enum) | 是 | 排课频率: weekly / daily / custom |
| `scheduleRules` | Array | 否 | 排课规则数组 |
| `scheduleRules[].dayOfWeek` | Number | 是 | 星期 (0-6, 0=周日) |
| `scheduleRules[].startTime` | String | 是 | 开始时间，如 "18:30" |
| `scheduleRules[].endTime` | String | 是 | 结束时间，如 "20:00" |
| `defaultRoom` | ObjectId | 是 | 默认教室 |
| `maxStudents` | Number | 是 | 最大学生数 (默认 8) |
| `price` | Number | 是 | 报名价格，单位：分 |
| `status` | String (Enum) | 是 | 课程状态 (默认 draft) |
| `publishDate` | Date | 否 | 对外发布/招生日期 |
| `features` | String | 否 | 本期特色 |
| `description` | String | 否 | 详细描述 |
| `posterUrl` | String | 否 | 海报URL |
| `videoUrl` | String | 否 | 整体课程视频URL |
| `highlightVideoUrl` | String | 否 | 精彩集锦视频URL |
| `isActive` | Boolean | 是 | 是否激活 (默认 true) |
| `sort` | Number | 否 | 排序值 (默认 0) |
| `Org` | ObjectId | 是 (auto) | 所属组织（自动从当前用户注入） |
| `createdBy` | ObjectId | 是 (auto, immutable) | 创建者 (自动注入) |
| `updatedBy` | ObjectId | 是 (immutableFront) | 更新者（自动注入，前端不可传）|

## 权限说明

- `readPermission`: 需要读取权限才能访问列表和详情接口
- `addPermission`: 需要创建权限才能添加课程
- `editPermission`: 需要编辑权限才能更新课程信息
- `managePermission`: 需要管理权限才能删除课程

## 业务约束

1. **Subject 不可变**: 创建后 `Subject` 字段永远不可修改（若需调整科目只能复制新建）
2. **Org 自动归属**: 课程自动归属于当前用户所在组织(Org)
3. **状态锁定机制**: 课程状态决定了哪些字段可修改（详见状态约束表格）
4. **取消课程限制**: 存在学生报名记录（`active` 或 `finished` 状态）的课程不能设置为 `cancelled`
5. **删除限制**: 存在 `StudentCourse` 关联的课程不能物理删除
6. **学生可见性**:
   - `draft` / `finished` / `cancelled`: 学生不可见
   - `enrolling` / `ongoing`: 学生可见
7. **索引优化**:
   - `{ Subject: 1, status: 1 }`
   - `{ Org: 1, status: 1 }`
   - `{ mainTeacher: 1, status: 1 }`

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

| 状态码 | 含义 |
| --- | --- |
| `200` | 操作成功 |
| `400` | 请求参数错误（如修改被锁定的字段、尝试取消有学生的课程）|
| `403` | 无权限（如学生尝试创建课程、普通老师修改非自己的课程）|
| `404` | 资源不存在（如 Subject/Room/Teacher 找不到、课程不存在）|
| `500` | 服务器内部错误 |
