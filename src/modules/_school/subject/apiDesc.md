# Subject 科目模块 API 接口文档

## 概述

Subject模块负责学校科目的管理，包括科目的增删改查功能。科目归属于组织(Org)，同一组织下科目名称必须唯一。

## 科目分类枚举 (categoryEnums)

- `C++`: C++课程
- `Python`: Python课程
- `Scratch`: Scratch课程
- `Spike`: Spike课程
- `电子智慧大颗粒`: 电子智慧大颗粒课程

## 中间件链说明

> 所有路由都挂载 `authenticate` + `userAuthorize()` + 对应 `*Permission`。
> `userAuthorize` 限制必须是 `User` 账户（Student 直接 403），`readPermission` 进一步要求 admin/manager。
> 文档旧版未声明 `userAuthorize`，与实际代码不一致——本版本已修正。

## 接口列表

### 1. 获取科目列表
- **路径**: `POST /api/subject/list`
- **描述**: 获取科目列表，支持分页和筛选功能
- **认证要求**: 需要有效的访问令牌 + `userAuthorize()` + `readPermission`
- **权限控制**:
  - 学生(Student)只能查看激活且展示的科目（**注意**：本路由有 `userAuthorize()` 拦截 Student，理论上 Student 永远拿不到 list——DAO 中的 Student 分支是死代码）
  - 用户(User)需要管理员或manager角色，并且只能查看本组织(Org)的科目
- **请求参数**:
  - `filter` (可选): 筛选条件对象
    - `regExp` (可选): 正则表达式搜索 (0-50位字符串，模糊匹配name字段)
    - `isActive` (可选): 是否激活
    - `isShow` (可选): 是否展示
    - `Org` (可选): 组织 ObjectId
    - `category` (可选): 科目分类 ('C++', 'Python', 'Scratch', 'Spike', '电子智慧大颗粒')
  - `options` (可选): 分页和排序选项对象
    - `limit` (可选): 每页数量，默认100，最大值受MAX_HANDLE_ITEM限制
    - `skip` (可选): 跳过的记录数
    - `sort` (可选): 排序对象，格式 { field: 1/-1 }
    - `populate` (可选): 关联填充数组
      - `path` (必填): 填充路径
      - `select` (可选): 选择字段
      - `match` (可选): 过滤条件对象
      - `options` (可选): 附加选项
        - `sort` (可选): 排序
        - `limit` (可选): 限制数量
        - `skip` (可选): 跳过数量
- **响应**:
  - `total`: 总数
  - `items`: 科目列表

### 2. 获取科目详情
- **路径**: `POST /api/subject/detail/:id`
- **描述**: 根据ID获取单个科目的详细信息
- **认证要求**: 需要有效的访问令牌 + `userAuthorize()` + `readPermission`
- **权限控制**:
  - 学生(Student)只能查看激活且展示的科目（**同上，本路由有 `userAuthorize()` 拦截 Student**）
  - 用户(User)需要管理员或本组织(Org)的科目
- **路径参数**: `id` - 科目ID (必填, ObjectId)
- **请求参数**:
  - `options` (可选): 查询选项对象
    - `populate` (可选): 关联填充数组
      - `path` (必填): 填充路径
      - `select` (可选): 选择字段
      - `match` (可选): 过滤条件对象
      - `options` (可选): 附加选项
- **响应**: `item` - 科目详细信息

### 3. 创建科目
- **路径**: `POST /api/subject/add`
- **描述**: 创建新科目
- **认证要求**: 需要有效的访问令牌 + `userAuthorize()` + `addPermission`
- **权限控制**: 只有管理员或manager角色才能创建科目；科目将自动归属于当前用户所在组织
- **请求参数**:
  - `category` (必填): 科目分类 ('C++', 'Python', 'Scratch', 'Spike', '电子智慧大颗粒')
  - `name` (必填): 科目名称 (2-100位字符串)
  - `price` (必填): 每堂课价格，单位：分 (数字，最小值为0)
  - `duration_minutes` (必填): 课程时长，单位：分钟 (数字，最小值为0)
  - `default_lesson_count` (必填): 标准课时数 (数字，最小值为0)
  - `isActive` (必填): 是否激活
  - `isShow` (必填): 是否展示
  - `syllabus` (可选): 教学大纲数组
    - `syllabus.*.title` (必填): 教学大纲标题 (1-100位字符串)
    - `syllabus.*.description` (必填): 教学大纲描述 (1-500位字符串)
  - `sort` (可选): 排序
  - `Org` (可选): 组织 ObjectId
- **响应**: `item` - 创建的科目信息

### 4. 更新科目信息
- **路径**: `POST /api/subject/edit/:id`
- **描述**: 根据ID更新科目信息
- **认证要求**: 需要有效的访问令牌 + `userAuthorize()` + `editPermission`
- **权限控制**: 只有管理员或manager角色才能修改科目；非管理员只能修改本组织(Org)的科目
- **路径参数**: `id` - 科目ID (必填, ObjectId)
- **请求参数** (可选):
  - `category` (可选): 科目分类 ('C++', 'Python', 'Scratch', 'Spike', '电子智慧大颗粒')
  - `name` (可选): 科目名称 (2-100位字符串)
  - `price` (可选): 每堂课价格，单位：分 (数字，最小值为0)
  - `duration_minutes` (可选): 课程时长，单位：分钟 (数字，最小值为0)
  - `default_lesson_count` (可选): 标准课时数 (数字，最小值为0)
  - `syllabus` (可选): 教学大纲数组
    - `syllabus.*.title` (可选): 教学大纲标题 (1-100位字符串)
    - `syllabus.*.description` (可选): 教学大纲描述 (1-500位字符串)
  - `isActive` (可选): 是否激活
  - `isShow` (可选): 是否展示
  - `sort` (可选): 排序
- **响应**: `item` - 更新后的科目信息

### 5. 删除科目 (⏳ 暂未启用)
- **路径**: `POST /api/subject/remove/:id`
- **描述**: 根据ID删除科目
- **认证要求**: 需要有效的访问令牌 + `userAuthorize()` + `managePermission`（设计意图，未生效）
- **状态**: **当前路由已注释**（`index.routes.js` 中 `// router.post('/remove/:id', ...)`）；controller / service / DAO / validator 中 `remove` 也全部已注释
- **设计意图**（参考，未生效）: 软删除通过将 `isActive` 改为 `false` 实现

## 字段说明

| 字段名 | 类型 | 必填 | 可变 | 默认 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `category` | String (Enum) | ✕ | ✓ | — | 科目分类（`C++` / `Python` / `Scratch` / `Spike` / `电子智慧大颗粒`） |
| `name` | String | ✓ | ✓ | — | 科目名称 |
| `price` | Number | ✓ | ✓ | — | 每堂课价格（单位：分） |
| `duration_minutes` | Number | ✓ | ✓ | — | 课程时长（单位：分钟） |
| `default_lesson_count` | Number | ✓ | ✓ | — | 标准课时数 |
| `syllabus` | Array | ✕ | ✓ | — | 教学大纲 |
| `syllabus[].title` | String | ✕ | ✓ | — | 教学大纲标题 |
| `syllabus[].description` | String | ✕ | ✓ | — | 教学大纲描述 |
| `isActive` | Boolean | ✕ | ✓ | `true` | 是否激活 |
| `isShow` | Boolean | ✕ | ✓ | `true` | 是否展示（Student 可见性控制） |
| `sort` | Number | ✕ | ✓ | `0` | 排序字段，数值越大越靠前 |
| `Org` | ObjectId(ref:Org) | ✓ | ✕ `immutable` | — | 所属组织（DAO 自动注入） |
| `createdBy` / `updatedBy` | ObjectId | ✕ (auto) | ✕ `immutable` / `immutableFront` | — | 创建/更新人 |
| `createdAt` / `updatedAt` | Date | auto | — | — | Mongoose timestamps |

## 权限说明

- `readPermission`: 需要读取权限才能访问列表和详情接口
- `addPermission`: 需要创建权限才能添加科目
- `editPermission`: 需要编辑权限才能更新科目信息
- `managePermission`: 需要管理权限才能删除科目

## 业务约束

- 同一组织(Org)下科目名称(`name`)必须唯一
- 科目会自动归属于当前用户所在组织(Org)
- 学生只能查看`isShow=true`且`isActive=true`的科目

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