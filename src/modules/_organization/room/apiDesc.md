# Room 教室模块 API 接口文档

## 概述

Room模块负责教室信息的管理，包括教室的增删改查功能。教室归属于组织(Org)，同一组织下教室名称必须唯一。

## 教室状态枚举

- `available`: 可用
- `in_use`: 使用中
- `maintenance`: 维护中

## 接口列表

### 1. 获取教室列表
- **路径**: `POST /api/room/list`
- **描述**: 获取教室列表，支持分页和筛选功能
- **认证要求**: 需要有效的访问令牌及读取权限
- **请求参数**:
  - `filter` (可选): 筛选条件对象
    - `regExp` (可选): 正则表达式搜索 (0-50位字符串，模糊匹配name字段)
    - `isActive` (可选): 是否激活
    - `Org` (可选): 组织 ObjectId
    - `status` (可选): 教室状态 ('available', 'in_use', 'maintenance')
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
  - `items`: 教室列表

### 2. 获取教室详情
- **路径**: `POST /api/room/detail/:id`
- **描述**: 根据ID获取单个教室的详细信息
- **认证要求**: 需要有效的访问令牌及读取权限
- **路径参数**: `id` - 教室ID (必填, ObjectId)
- **请求参数**:
  - `options` (可选): 查询选项对象
    - `populate` (可选): 关联填充数组
      - `path` (必填): 填充路径
      - `select` (可选): 选择字段
      - `match` (可选): 过滤条件对象
      - `options` (可选): 附加选项
- **响应**: `item` - 教室详细信息

### 3. 创建教室
- **路径**: `POST /api/room/add`
- **描述**: 创建新教室
- **认证要求**: 需要有效的访问令牌及创建权限
- **请求参数**:
  - `name` (必填): 教室名称 (2-100位字符串)
  - `capacity` (必填): 容纳人数 (数字，最小值为0)
  - `status` (必填): 教室状态 ('available', 'in_use', 'maintenance')
  - `isActive` (必填): 是否激活
  - `location` (可选): 位置描述 (2-100位字符串)
  - `description` (可选): 备注/设备情况 (2-100位字符串)
  - `sort` (可选): 排序
  - `Org` (可选): 组织 ObjectId
- **响应**: `item` - 创建的教室信息

### 4. 更新教室信息
- **路径**: `POST /api/room/edit/:id`
- **描述**: 根据ID更新教室信息
- **认证要求**: 需要有效的访问令牌及编辑权限
- **路径参数**: `id` - 教室ID (必填, ObjectId)
- **请求参数** (可选):
  - `name` (可选): 教室名称 (2-100位字符串)
  - `capacity` (可选): 容纳人数 (数字，最小值为0)
  - `location` (可选): 位置描述 (2-100位字符串)
  - `description` (可选): 备注/设备情况 (2-100位字符串)
  - `status` (可选): 教室状态 ('available', 'in_use', 'maintenance')
  - `isActive` (可选): 是否激活
  - `sort` (可选): 排序
- **响应**: `item` - 更新后的教室信息

### 5. 删除教室
- **路径**: `POST /api/room/remove/:id`
- **描述**: 根据ID删除教室
- **认证要求**: 需要有效的访问令牌及管理权限
- **路径参数**: `id` - 教室ID (必填, ObjectId)
- **响应**: 删除操作结果

## 权限说明

- `readPermission`: 需要读取权限才能访问列表和详情接口
- `addPermission`: 需要创建权限才能添加教室
- `editPermission`: 需要编辑权限才能更新教室信息
- `managePermission`: 需要管理权限才能删除教室

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