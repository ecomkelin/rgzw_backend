# 认证模块详细分析

## 模型关系

### 1. Account 模型 (src/models/authorization/Account.model.js)
**主要职责**：用户账号基础信息、身份管理和认证

**关键字段**：
- `code`: 账号代码，唯一标识符
- `passwordHash`: 加密后的密码（使用Argon2算法）
- `accountType`: 账号类型（User/Student）
- `isAdmin`: 是否为管理员
- `currentUser` / `currentStudent`: 关联当前身份
- `currentSessionId`: 当前会话ID，用于防并发登录
- `lastLoginAt` / `lastLogoutAt`: 登录登出时间记录

**重要特性**：
- 使用 Argon2 进行密码加密
- 通过 `currentSessionId` 防止并发登录
- immutableFront 保护敏感字段不被前端修改

### 2. User 模型 (src/models/organization/structure/User.model.js)
**主要职责**：组织内的用户身份信息

**关键字段**：
- `Account`: 关联的账号ID
- `Org`: 所属组织
- `Depts`: 所属部门列表
- `roleSimp`: 用户角色（manager/teacher）
- `nickname`: 昵称

**重要特性**：
- 一个账号可对应多个用户身份
- 支持灵活的组织结构

### 3. Student 模型 (src/models/student/Student.model.js)
**主要职责**：培训机构的学生信息

**关键字段**：
- `Account`: 关联的账号ID
- `identity`: 身份证号
- `name`: 姓名
- `birthday`: 生日
- `gender`: 性别
- `school`: 学校信息
- `company`: 工作单位
- `sourceType`: 用户来源类型

**重要特性**：
- 支持一个账号管理多个学生信息
- 记录学生的教育和工作背景

## 认证流程

### 身份关系
- 一个 `Account` 可以关联多个 `User` 或 `Student` 身份
- 通过 `currentUser` 或 `currentStudent` 字段标记当前激活的身份
- 使用 `accountType` 字段区分账号类型

### 会话管理
- 每次登录或身份切换都会生成新的 `currentSessionId`
- 通过 `sessionId` 验证会话有效性，防止并发登录
- 登出时清除 `currentSessionId`

## 新增功能：身份转换 (Convert Payload)

### 路由
- **方法**: PUT
- **路径**: `/api/auth/convert-payload/:id`
- **中间件**: `authenticate`, `convertPayloadVD`

### 功能描述
允许用户在同一个账户下切换不同的身份（User 或 Student），实现多身份管理。

### 实现细节
1. **验证**：确保目标身份属于当前账户
2. **更新**：修改账户的 `currentUser` 或 `currentStudent` 字段
3. **安全**：生成新的会话ID，防止会话固定攻击
4. **返回**：生成包含新身份信息的新令牌

### 业务流程
1. 用户拥有账户及多个身份（如员工身份和家长身份）
2. 通过此接口从一个身份切换到另一个身份
3. 服务器生成新的认证令牌，包含新身份信息
4. 客户端获得新的令牌并以新身份继续操作

## 安全特性

### 1. 多层验证
- 密码哈希验证
- JWT令牌验证
- 会话ID验证

### 2. 防并发登录
- 通过 `currentSessionId` 确保同一账户只有一个活跃会话

### 3. 令牌安全
- 短时效访问令牌（5分钟）
- HttpOnly Cookie 存储刷新令牌
- 每次身份切换生成新令牌

## API 端点总结

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/login | 用户登录 |
| GET | /api/auth/refresh-token | 刷新令牌 |
| PUT | /api/auth/convert-payload/:id | 切换身份 |
| GET | /api/auth/logout | 用户登出 |

## 适用场景

1. **教育机构管理系统**：员工可能同时拥有教师身份和家长身份
2. **培训机构系统**：用户可能是学生、家长或员工
3. **多角色系统**：支持用户在不同场景下使用不同身份