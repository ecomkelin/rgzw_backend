# User 模块 API 接口文档

## 概述

User模块负责用户信息的管理，包括用户的增删改查和权限控制功能。

## 接口列表

### 1. 获取用户列表
- **路径**: `POST /api/user/list`
- **描述**: 获取用户列表，支持分页和筛选功能
- **认证要求**: 需要有效的访问令牌及相应权限
- **请求参数**:
  - `filter` (可选): 筛选条件对象
    - `regExp` (可选): 正则表达式搜索 (0-50位字符串)
    - `isActive` (可选): 是否激活
    - `Org` (可选): 组织 ObjectId
    - `Account` (可选): 账户 ObjectId
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
  - `items`: 用户列表

### 2. 获取用户详情
- **路径**: `POST /api/user/detail/:id`
- **描述**: 根据ID获取单个用户的详细信息
- **认证要求**: 需要有效的访问令牌及相应权限
- **路径参数**: `id` - 用户ID (必填, ObjectId)
- **请求参数**:
  - `options` (可选): 查询选项对象
    - `populate` (可选): 关联填充数组
      - `path` (必填): 填充路径
      - `select` (可选): 选择字段
      - `match` (可选): 过滤条件对象
      - `options` (可选): 附加选项
- **响应**: `item` - 用户详细信息

### 3. 创建用户
- **路径**: `POST /api/user/add`
- **描述**: 创建新用户，同时会创建关联的账户
- **认证要求**: 需要有效的访问令牌及创建权限
- **请求参数**:
  - `user` (必填): 用户对象
    - `isActive` (可选): 是否激活
    - `sort` (可选): 排序
    - `avatar` (可选): 头像 (4-50位字符串)
    - `roleTemp` (必填): 角色 ('Admin', 'Teacher', 'Student', 'Parent', 'Guardian')
    - `nickname` (必填): 昵称 (2-26位字符串)
    - `Org` (可选): 组织 ObjectId
    - `Account` (可选): 账户 ObjectId
  - `account` (必填): 账户对象
    - `code` (必填): 账户编码 (4-16位字符串)
    - `password` (必填): 密码 (8-16位字符串)
    - `name` (必填): 姓名 (2-50位字符串)
    - `identityNo` (可选): 身份证号 (15-18位字符串)
    - `gender` (可选): 性别 ('Male', 'Female', 'Other')
    - `phone` (可选): 电话 (10-15位字符串)
    - `address` (可选): 地址 (5-200位字符串)
    - `Nation` (可选): 国家 ObjectId
    - `Province` (可选): 省份 ObjectId
    - `City` (可选): 城市 ObjectId
    - `Area` (可选): 地区 ObjectId
- **响应**: `item` - 创建的用户信息

### 4. 更新用户信息
- **路径**: `POST /api/user/edit/:id`
- **描述**: 根据ID更新用户信息
- **认证要求**: 需要有效的访问令牌及编辑权限
- **路径参数**: `id` - 用户ID (必填, ObjectId)
- **请求参数** (可选):
  - `isActive` (可选): 是否激活
  - `sort` (可选): 排序
  - `roleTemp` (可选): 角色 ('Admin', 'Teacher', 'Student', 'Parent', 'Guardian')
  - `nickname` (可选): 昵称 (2-26位字符串)
  - `avatar` (可选): 头像 (4-50位字符串)
- **响应**: `item` - 更新后的用户信息

### 5. 获取当前用户信息
- **路径**: `POST /api/user/self`
- **描述**: 获取当前登录用户的个人信息
- **认证要求**: 需要有效的访问令牌和用户授权
- **请求参数**:
  - `options` (可选): 查询选项对象
    - `populate` (可选): 关联填充数组
      - `path` (必填): 填充路径
      - `select` (可选): 选择字段
      - `match` (可选): 过滤条件对象
      - `options` (可选): 附加选项
- **响应**: `item` - 当前用户信息

### 6. 更新当前用户信息
- **路径**: `POST /api/user/self`
- **描述**: 更新当前登录用户的个人信息
- **认证要求**: 需要有效的访问令牌和用户授权
- **请求参数**:
  - `nickname` (可选): 昵称 (2-26位字符串)
- **响应**: 更新后的用户信息

## 权限说明

- `readPermission`: 需要读取权限才能访问列表和详情接口
- `addPermission`: 需要创建权限才能添加用户
- `editPermission`: 需要编辑权限才能更新用户信息
- `managePermission`: 需要管理权限才能执行管理操作

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