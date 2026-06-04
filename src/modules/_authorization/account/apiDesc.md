# Account 模块 API 接口文档

## 概述

Account模块负责用户账户信息的管理，包括账户的查询、编辑和自我管理功能。

## 接口列表

### 1. 获取账户列表
- **路径**: `POST /api/account/list`
- **描述**: 获取账户列表，支持分页和筛选功能
- **认证要求**: 需要有效的访问令牌及相应权限
- **请求参数**:
  - `filter` (可选): 筛选条件对象
    - `isActive` (可选): 是否激活
    - `isAdmin` (可选): 是否管理员
    - `gender` (可选): 性别 ('Male', 'Female', 'Other')
    - `accountType` (可选): 账户类型
    - `Nation` (可选): 国家 ObjectId
    - `Province` (可选): 省份 ObjectId
    - `City` (可选): 城市 ObjectId
    - `Area` (可选): 地区 ObjectId
  - `options` (可选): 分页和排序选项对象
    - `limit` (可选): 每页数量，默认100，最大值受MAX_HANDLE_ITEM限制
    - `skip` (可选): 跳过的记录数
    - `sortObj` (可选): 排序对象，格式 { field: 1/-1 }
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
  - `items`: 账户列表

### 2. 获取账户详情
- **路径**: `POST /api/account/detail/:id`
- **描述**: 根据ID获取单个账户的详细信息
- **认证要求**: 需要有效的访问令牌及相应权限
- **路径参数**: `id` - 账户ID (必填, ObjectId)
- **请求参数**:
  - `options` (可选): 查询选项对象
    - `populate` (可选): 关联填充数组
      - `path` (必填): 填充路径
      - `select` (可选): 选择字段
      - `match` (可选): 过滤条件对象
      - `options` (可选): 附加选项
- **响应**: `item` - 账户详细信息

### 3. 更新账户信息
- **路径**: `POST /api/account/edit/:id`
- **描述**: 根据ID更新账户信息
- **认证要求**: 需要有效的访问令牌及编辑权限
- **路径参数**: `id` - 账户ID (必填, ObjectId)
- **请求参数** (可选):
  - `password` (可选): 密码 (8-16位字符串)
  - `isActive` (可选): 是否激活
  - `sort` (可选): 排序
  - `name` (可选): 姓名 (2-50位字符串)
  - `phone` (可选): 电话 (10-15位字符串)
  - `address` (可选): 地址 (5-200位字符串)
  - `identityNo` (可选): 身份证号 (15-18位字符串)
  - `gender` (可选): 性别 ('male', 'female')
  - `Nation` (可选): 国家 ObjectId
  - `Province` (可选): 省份 ObjectId
  - `City` (可选): 城市 ObjectId
  - `Area` (可选): 地区 ObjectId
- **响应**: `item` - 更新后的账户信息

### 4. 获取当前用户账户信息
- **路径**: `POST /api/account/self`
- **描述**: 获取当前登录用户的账户信息
- **认证要求**: 需要有效的访问令牌
- **请求参数**:
  - `options` (可选): 查询选项对象
    - `populate` (可选): 关联填充数组
      - `path` (必填): 填充路径
      - `select` (可选): 选择字段
      - `match` (可选): 过滤条件对象
      - `options` (可选): 附加选项
- **响应**: `item` - 当前用户账户信息

### 5. 更新当前用户账户信息
- **路径**: `POST /api/account/edit/self`
- **描述**: 更新当前登录用户的账户信息
- **认证要求**: 需要有效的访问令牌
- **请求参数** (可选):
  - `password` (可选): 密码 (8-16位字符串)
  - `nickname` (可选): 昵称 (2-50位字符串)
- **响应**: 更新后的账户信息

## 权限说明

- `readPermission`: 需要读取权限才能访问列表和详情接口
- `editPermission`: 需要编辑权限才能更新账户信息

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