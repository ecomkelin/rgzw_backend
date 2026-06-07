# StudentCourse 学生选课模块 API 接口文档

> 本模块实现 `StudentCourse` 的 HTTP 接口。
> - 模型: [src/models/school/student/StudentCourse.model.js](../../../models/school/student/StudentCourse.model.js)
> - DAO:   [src/models/school/student/StudentCourse.dao.js](../../../models/school/student/StudentCourse.dao.js)
> - 模块: [src/modules/_school/studentCourse/](./)

## 概述

`StudentCourse` 记录学生报名了哪一个课程（班级），是课程消费的实际主体。

**业务背景**:
- 学生确认上课后, **由管理员在管理后台手动 add** 选课记录
- `StudentPack`（学生持有的课包）可在 add 时绑定, 也可在后续 edit 时绑定 / 更换 / 解绑
- 不可物理删除, 退课请把 `status` 改为 `'dropped'` 或 `'transferred'`

```
学生确认上课 → 管理员 add StudentCourse
                ├─ 必填: Student / Course
                └─ 可选: StudentPack (后续可绑定)
                                        ↓
                              排课: Course.lessons
                              消课: StudentPack.remainingLesson 递减
```

---

## 枚举

### 状态 (`statusEnums`)

| 值 | 含义 |
|---|---|
| `active`      | 在读中, 正常消课 |
| `finished`    | 已结课, 正常完成 |
| `dropped`     | 退课, 管理员手动改 |
| `transferred` | 转入其他课程, 管理员手动改 |

---

## 业务权限总览

| 操作 | Student | 普通老师 (`roleTemp=teacher`) | Manager (`roleTemp=manager`) | Admin (`isAdmin=true`) |
|---|---|---|---|---|
| 列表 (`list`) | 仅自己 | 仅自己主讲/助教课程 | 本 Org | 本 Org (业务数据 Org 隔离) |
| 详情 (`detail`) | 仅自己 | 仅自己主讲/助教课程 | 本 Org | 本 Org |
| 添加 (`add`) | ❌ | ❌ | ✅ | ✅ |
| 编辑 (`edit`) | ❌ | ❌ | ✅ | ✅ |

> **Org 隔离**: 业务数据一律 Org 隔离, 超管也只能看 / 改本公司, 避免 `createdBy` / `updatedBy` 跨公司引用。
> **普通老师**: 仅可看到自己主讲或助教课程 (`Course.mainTeacher` / `Course.assistantTeacher`) 的选课; DAO 通过 `CourseModel.find({$or:[mainTeacher, assistantTeacher]})` 拿到自己的 `courseIds`, 再用 `filter.Course = {$in: courseIds}` 过滤。
> **学生自助**: 当前未提供 `/self` 系列接口, 学生通过常规 `list`/`detail` 即可看自己的选课。

---

## 接口列表

### 1. 获取学生选课列表
- **路径**: `POST /api/studentCourse/list`
- **中间件链**: `authenticate` → `Permission.read` → `listVD` → `controller.list`
- **权限**:
  - Student: 放行(DAO 二次过滤 `filter.Student = currentStudent._id`)
  - Manager: 放行(DAO 自动 `filter.Org = currentUser.Org`)
  - Admin: 放行(DAO 自动 `filter.Org = currentUser.Org`, 业务数据 Org 隔离)
  - 普通老师: 放行(DAO 查 `CourseModel.find({mainTeacher/assistantTeacher: _id})` → `filter.Course = {$in: courseIds}`, 未授课则返回空集)
  - 其他: 403
- **请求参数**:
  - `filter` (可选):
    - `Student`   (可选): 学生 ObjectId
    - `Course`    (可选): 课程 ObjectId
    - `Account`   (可选): 家长账户 ObjectId
    - `StudentPack`(可选): 课包 ObjectId
    - `Org`       (可选): 组织 ObjectId
    - `status`    (可选): 状态枚举
  - `options` (可选): 分页/排序/填充
- **响应**:
  ```json
  { "code": 200, "success": true, "message": "操作成功",
    "data": { "total": 100, "items": [ /* StudentCourse */ ] } }
  ```

---

### 2. 获取学生选课详情
- **路径**: `POST /api/studentCourse/detail/:id`
- **中间件链**: `authenticate` → `Permission.read` → `detailVD` → `controller.detail`
- **权限**:
  - Student: `item.Student === currentStudent._id`, 否则 403
  - Manager: `item.Org === currentUser.Org`, 否则 403
  - Admin: `item.Org === currentUser.Org`, 否则 403 (业务数据 Org 隔离)
- **路径参数**: `id` (必填, ObjectId)

---

### 3. 添加学生选课 (学生确认上课后, 管理员填写)
- **路径**: `POST /api/studentCourse/add`
- **中间件链**: `authenticate` → `Permission.write` → `addVD` → `controller.add`
- **权限**:
  - **仅** User Manager (含 Admin): ✅
  - Student: 403
- **请求参数**:
  - `Student`         (必填): 学生 ObjectId
  - `Course`          (必填): 课程 ObjectId
  - `StudentPack`     (可选): 学生课包 ObjectId (add 时可后期绑定, 此时可空)
  - `StudentCourseDate`(可选): 报名日期, 默认 `new Date()`
  - `status`          (可选): 状态枚举, 默认 `'active'`
  - `remark`          (可选, ≤500): 备注(如特殊要求, 孩子需要特殊关注)
  - **禁字段**(传了会被 validator 拒绝):
    - `Account`   → 由后端从 `Student.Account` 推导
    - `Org`       → 由后端从 `currentUser.Org` 注入
    - `nameCourse`→ 由后端从 `Course.name` 冗余
    - `createdBy` / `updatedBy` → 由后端注入
- **DAO 校验**:
  - 必须是 Manager (含 Admin)
  - Student 必须存在且 `isActive === true`
  - `student.Org === currentUser.Org` (否则 403, 防止跨校区)
  - `student.Account` 必须存在, isActive, accountType='Student'
  - Course 必须存在且 `isActive === true`
  - `course.Org === currentUser.Org` (否则 403)
  - StudentPack (若提供) 必须存在, 同 Org, 且 Student 一致
  - 唯一索引冲突 (`code 11000`): 同一 Student+Course 已存在 → 400
- **DAO 自动注入**:
  - `Account`         : `student.Account`
  - `Org`             : `student.Org` (= currentUser.Org)
  - `nameCourse`      : `course.name`
  - `createdBy`       : `currentUser._id`
  - `status`          : `'active'`
  - `StudentCourseDate`: `new Date()`

---

### 4. 编辑学生选课
- **路径**: `POST /api/studentCourse/edit/:id`
- **中间件链**: `authenticate` → `Permission.write` → `editVD` → `controller.edit`
- **权限**:
  - **仅** User Manager (含 Admin): ✅
  - Student: 403
- **路径参数**: `id` (必填, ObjectId)
- **请求参数** (均可选):
  - `StudentPack`     : 课包 ObjectId (传新值=更换, 传 `null`=解绑, 不传=保持)
  - `StudentCourseDate`: 报名日期
  - `status`          : 状态枚举 (`active` / `finished` / `dropped` / `transferred`)
  - `remark`          : 备注
- **禁字段**(传了会被 validator 拒绝):
  - `Student` / `Account` / `Course` / `Org` / `nameCourse` / `createdBy` / `updatedBy`
- **业务校验**:
  - 目标记录存在
  - `target.Org === currentUser.Org` (Org 隔离, 超管也只能改本公司)
  - StudentPack (若提供) 必须存在, 同 Org, 且 Student 与 `target.Student` 一致
- **自动注入**:
  - `updatedBy` = `currentUser._id`

---

## 字段说明

| 字段 | 类型 | 必填 | 来源 | 说明 |
|---|---|---|---|---|
| `Student`         | ObjectId | ✅(auto) | 前端/auto | 学生, 不可修改 |
| `Account`         | ObjectId | ✅(auto) | auto | 家长账户, 由 `Student.Account` 推导 |
| `Course`          | ObjectId | ✅(auto) | 前端/auto | 课程, 不可修改 |
| `nameCourse`      | String   | ✅(auto) | auto | 课程名冗余, 不可修改 |
| `StudentPack`     | ObjectId | - | 前端/auto | 学生课包, add 时可空, edit 可绑定/更换/解绑 |
| `StudentCourseDate`| Date    | - | 前端/auto | 报名日期, 默认创建时间 |
| `status`          | Enum     | - | 前端 | `active` / `finished` / `dropped` / `transferred` |
| `remark`          | String   | - | 前端 | 备注, ≤500 |
| `Org`             | ObjectId | ✅(auto) | auto | 所属组织(不可变) |
| `createdBy`       | ObjectId | ✅(auto) | auto | 创建人(不可变) |
| `updatedBy`       | ObjectId | - | auto | 更新人 |

---

## 索引

```javascript
// StudentCourse.model.js
StudentCourseSchema.index({ Student: 1, Course: 1 }, { unique: true });
StudentCourseSchema.index({ Course: 1, status: 1 });
StudentCourseSchema.index({ Account: 1 });
```

| 索引 | 说明 |
|---|---|
| `{ Student: 1, Course: 1 }` unique | 同一学生不能重复报名同一门课程 |
| `{ Course: 1, status: 1 }`         | 查询某课程在读学生 |
| `{ Account: 1 }`                    | 家长快速查看所有孩子报名 |

---

## 错误码

| 状态码 | 触发场景 |
|---|---|
| `400` | validator 校验失败 / 必填字段缺失 / 同一 Student+Course 已存在(唯一索引) / StudentPack 不属于此学生 |
| `403` | Student 调用 list/detail 但不是自己 / Manager 跨 Org / 非 Manager 调用 add 或 edit / 添加选课时学生或课程与当前用户不同 Org / StudentPack 与当前用户不同 Org |
| `404` | StudentCourse 不存在 / 关联学生不存在或被禁用 / 学生关联的账户不存在或被禁用 / 课程不存在或被禁用 / StudentPack 不存在 |
| `500` | 服务器内部错误 |

---

## 关联模块

- **Student**     : 学员信息 ([src/modules/_school/student/](../student/))
- **Course**      : 课程定义 ([src/modules/_school/course/](../course/))
- **StudentPack** : 学生持有课包 ([src/modules/_school/studentPack/](../studentPack/))
- **Account**     : 家长账户 ([src/models/authorization/Account.dao.js](../../../models/authorization/Account.dao.js))
- **Lesson**      : 排课消课时, 通过 `Course._id` 关联, 完课 push 到 `StudentPack.LessonAttendances`
