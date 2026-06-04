# Org 模块 API 接口文档

## 概述

Org 模块负责机构（公司/学校）的管理，包括机构的增删改查与"当前用户所属机构"查询。
**仅 `isAdmin === true` 的账号可访问列表 / 详情 / 创建 / 编辑接口**；`/self` 接口面向任意已登录用户。

## 接口列表

### 1. 获取机构列表
- **路径**: `POST /api/org/list`
- **描述**: 获取机构列表，支持分页、筛选、关联填充
- **认证要求**: 需登录 + `readPermission`（仅管理员）
- **请求参数**:
  - `filter` (可选): 筛选条件对象
    - `regExp` (可选): 模糊查询关键字 (1-50位字符串)
    - `isActive` (可选): 布尔，是否启用
    - `isMain` (可选): 布尔，是否主机构
    - `name` (可选): 机构名称 (1-100位字符串)
    - `unionCode` (可选): 统一社会信用代码 (1-30位字符串)
    - `Nation` (可选): 国家 ObjectId
    - `Province` (可选): 省份 ObjectId
    - `City` (可选): 城市 ObjectId
    - `Area` (可选): 区县 ObjectId
  - `options` (可选): 分页/排序/填充
    - `limit` (可选): 每页数量，整数，默认 12，最大 `MAX_HANDLE_ITEM`
    - `skip` (可选): 跳过数量，整数 ≥ 0
    - `sort` (可选): 排序对象，键为字段名，值为 `1`/`-1`
    - `populate` (可选): 关联填充数组
      - `path` (必填): 关联路径
      - `select` (可选): 返回字段
      - `match` (可选): 过滤条件
      - `options.sort` / `options.limit` / `options.skip` (可选)
      - `populate` (可选): 嵌套填充（白名单路径：`leaderId` / `deptId` / `parentId`）
- **响应**:
  - `total`: 符合条件的机构总数
  - `items`: 机构列表

### 2. 获取机构详情
- **路径**: `POST /api/org/detail/:id`
- **描述**: 根据 ID 获取单个机构信息
- **认证要求**: 需登录 + `readPermission`（仅管理员）
- **路径参数**:
  - `id` (必填): 机构 ObjectId
- **请求参数**:
  - `options` (可选): 关联填充（结构同 `/list`）
- **响应**: `item` - 机构详细信息

### 3. 创建机构
- **路径**: `POST /api/org/add`
- **描述**: 创建新机构
- **认证要求**: 需登录 + `addPermission`（仅管理员）
- **请求参数** (必填字段):
  - `unionCode` (必填): 统一社会信用代码 (2-30位字符串)
  - `name` (必填): 机构全称 (2-100位字符串)
  - `nickname` (必填): 机构简称 (2-50位字符串)
- **请求参数** (可选字段):
  - `isActive` (可选): 布尔，是否启用，默认 `true`
  - `sort` (可选): 排序权重，整数 ≥ 0，默认 `0`
  - `phone` (可选): 联系电话（最长 20 位）
  - `email` (可选): 邮箱（最长 100 位）
  - `website` (可选): 官网（最长 200 位）
  - `address` (可选): 详细地址（最长 200 位）
  - `isMain` (可选): 布尔，是否主机构；**系统仅允许一个 `isMain === true` 的机构**
  - `Nation` / `Province` / `City` / `Area` (可选): 行政区划 ObjectId
- **响应**: `item` - 创建后的机构完整文档
- **失败返回**:
  - `400`: 名称 / 统一代码 / 简称重复，或已存在主机构
  - `403`: 当前账号不是管理员

### 4. 更新机构
- **路径**: `POST /api/org/edit/:id`
- **描述**: 根据 ID 更新机构信息
- **认证要求**: 需登录 + `editPermission`（仅管理员）
- **路径参数**:
  - `id` (必填): 机构 ObjectId
- **请求参数** (可选，**所有字段都是 optional**):
  - `nickname` (可选): 机构简称 (2-50位字符串)
  - `isActive` / `isMain` / `sort`: 同 `/add`
  - `phone` / `email` / `website` / `address`: 同 `/add`
  - `Nation` / `Province` / `City` / `Area`: 同 `/add`
  - **注意**: 当前实现**不允许通过此接口修改 `unionCode` 与 `name`**（schema 视为业务不可变 + 路由层未提供对应字段）
- **响应**: `item` - 更新后的机构完整文档
- **失败返回**:
  - `404`: 机构不存在
  - `400`: 简称重复，或尝试将已存在的主机构再次设为 `isMain`
  - `403`: 当前账号不是管理员

### 5. 获取当前用户所属机构
- **路径**: `POST /api/org/self`
- **描述**: 获取当前登录用户所属机构的信息（普通用户只能看到自己所在的机构）
- **认证要求**: 需登录；无 `readPermission`，但 controller 内会基于 `payload.currentUser.Org` 拉数据
- **请求参数**:
  - `options` (可选): 关联填充（结构同 `/list`）
- **响应**: `item` - 当前用户所属机构完整文档

## 权限说明

| 中间件 | 用途 | 规则 |
|---|---|---|
| `readPermission` | `/list`、`/detail/:id` | 仅 `payload.isAdmin === true` |
| `addPermission` | `/add` | 仅 `payload.isAdmin === true` |
| `editPermission` | `/edit/:id` | 仅 `payload.isAdmin === true` |
| `managePermission` | 预留 | 仅 `payload.isAdmin === true` |

> **说明**: Org 模块 `/self` 路由**未挂载 `readPermission`**，依据是 controller 内部从 `payload.currentUser.Org` 拿 ID，普通用户只能读到自己的机构。如果未来要给"全员可看本公司"，需要再设计。

## 通用响应

所有接口均返回统一结构：

```json
{
  "code": 200,
  "success": true,
  "message": "操作成功",
  "data": { "item": {} }
}
```

错误时 `code` 与 HTTP 状态码对齐：
- `400` 数据校验失败 / 业务规则冲突
- `401` 未登录
- `403` 无权限
- `404` 资源不存在
- `500` 系统错误

## 关联

- **下层**:`Account`(org 信息来自 `User.currentUser.Org`)
- **上层**:`Dept`、`Student`、`User` 都通过 `Org` 字段冗余引用
- **同模块**:`Org` 是租户隔离的根，新建 `User` / `Student` 时由 DAO 强制写入 `Org`
