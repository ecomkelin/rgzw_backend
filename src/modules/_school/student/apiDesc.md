# Student 模块 API 接口文档

## 概述

Student模块负责学生信息的管理，包括学生的增删改查功能。

## 接口列表

### 1. 获取学生列表
- **路径**: `POST /api/student/list`
- **描述**: 获取学生列表，支持分页和筛选功能
- **认证要求**: 需要有效的访问令牌及相应权限
- **请求参数**:
  - `regExp` (可选): 正则表达式搜索 (0-50位字符串)
  - `isActive` (可选): 是否激活
  - `Org` (可选): 组织 ObjectId
  - `Account` (可选): 账户 ObjectId
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
  - `items`: 学生列表

### 2. 获取学生详情
- **路径**: `POST /api/student/detail/:id`
- **描述**: 根据ID获取单个学生的详细信息
- **认证要求**: 需要有效的访问令牌及相应权限
- **路径参数**: `id` - 学生ID (必填, ObjectId)
- **响应**: `item` - 学生详细信息

### 3. 创建学生
- **路径**: `POST /api/student/add`
- **描述**: 创建新学生，同时会创建关联的账户
- **认证要求**: 需要有效的访问令牌及添加权限
- **请求参数**:
  - `student` (必填): 学生对象
    - `name` (必填): 学生姓名 (2-50位字符串)
    - `birthday` (可选): 出生日期
    - `isActive` (可选): 是否激活
    - `phone` (可选): 电话 (10-15位字符串)
    - `identity` (可选): 身份证号 (15-18位字符串)
    - `address` (可选): 地址 (5-200位字符串)
    - `currentAddress` (可选): 当前住址 (5-200位字符串)
    - `company` (可选): 公司 (2-100位字符串)
    - `position` (可选): 职位 (2-100位字符串)
    - `school` (可选): 学校 (2-100位字符串)
    - `profession` (可选): 专业 (2-100位字符串)
    - `displayName` (可选): 显示名称 (2-50位字符串)
    - `avatar` (可选): 头像 (4-200位字符串)
    - `sourceType` (可选): 来源类型 ('地推', '传单', '活动', '介绍', '听说', '路过', '抖音', '朋友圈', '其他')
    - `description` (可选): 描述 (最多500位字符串)
    - `Nation` (可选): 国家 ObjectId
    - `Province` (可选): 省份 ObjectId
    - `City` (可选): 城市 ObjectId
    - `Area` (可选): 地区 ObjectId
    - `Org` (可选): 组织 ObjectId
    - `Account` (可选): 账户 ObjectId
  - `account` (可选): 账户对象
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
- **响应**: `item` - 创建的学生信息

### 4. 更新学生信息
- **路径**: `POST /api/student/edit/:id`
- **描述**: 根据ID更新学生信息
- **认证要求**: 需要有效的访问令牌及编辑权限
- **路径参数**: `id` - 学生ID (必填, ObjectId)
- **请求参数** (可选):
  - `isActive` (可选): 是否激活
  - `phone` (可选): 电话 (10-15位字符串)
  - `identity` (可选): 身份证号 (15-18位字符串)
  - `name` (可选): 姓名 (2-50位字符串)
  - `birthday` (可选): 出生日期
  - `gender` (可选): 性别 ('Male', 'Female')
  - `address` (可选): 地址 (5-200位字符串)
  - `currentAddress` (可选): 当前住址 (5-200位字符串)
  - `company` (可选): 公司 (2-100位字符串)
  - `position` (可选): 职位 (2-100位字符串)
  - `school` (可选): 学校 (2-100位字符串)
  - `profession` (可选): 专业 (2-100位字符串)
  - `displayName` (可选): 显示名称 (2-50位字符串)
  - `avatar` (可选): 头像 (4-200位字符串)
  - `sourceType` (可选): 来源类型 ('地推', '传单', '活动', '介绍', '听说', '路过', '抖音', '朋友圈', '其他')
  - `description` (可选): 描述 (最多500位字符串)
  - `Nation` (可选): 国家 ObjectId
  - `Province` (可选): 省份 ObjectId
  - `City` (可选): 城市 ObjectId
  - `Area` (可选): 地区 ObjectId
- **响应**: `item` - 更新后的学生信息

### 5. 更新当前学生信息
- **路径**: `POST /api/student/self`
- **描述**: 更新当前登录学生的个人信息
- **认证要求**: 需要有效的访问令牌
- **请求参数**:
  - `displayName` (可选): 显示名称 (2-26位字符串)
- **响应**: 更新后的学生信息

## 权限说明

- `readPermission`: 需要读取权限才能访问列表和详情接口
- `addPermission`: 需要添加权限才能创建学生
- `editPermission`: 需要编辑权限才能更新学生信息

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