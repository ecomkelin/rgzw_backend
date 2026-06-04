# Login Payload 结构规范

> 本文档记录 **2026-06-04** 优化后的 Login / Refresh Token 流程，以及 `req.payload` 的最终结构。
> 所有 DAO 与中间件开发必须遵循本文档。

---

## 1. 背景

`Account`（账户）可以同时承载两种身份：

- `User`（公司员工 / 老师 / 经理 / 超管）
- `Student`（学生）

通过 `Account.currentUser` / `Account.currentStudent` 字段切换当前身份。

登录时，Account 关联的 `User` 或 `Student` 信息会被注入到 **JWT 访问令牌** 中，并在后续每次请求中通过 `req.payload` 传递给下游 DAO / Service。

---

## 2. Login 接口

### 2.1 请求

```
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "code": "ADMIN001",
  "password": "Test1234@"
}
```

### 2.2 响应

```json
{
  "code": 200,
  "success": true,
  "message": "操作成功",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "payload": {
      "_id": "68xxxxxxxxxxxxxxxxx",
      "accountType": "User",
      "isAdmin": true,
      "sessionId": "abc123def456",
      "currentUser": {
        "_id": "66xxxxxxxxxxxxxxxxx",
        "nickname": "张老师",
        "Org": "66yyyyyyyyyyyyyyyy",
        "roleTemp": "manager"
      }
    },
    "account": { /* 完整 Account 文档 */ }
  }
}
```

- `refreshToken` 通过 **HttpOnly Cookie** 设置，前端 JS 无法访问
- Cookie 配置：
  ```javascript
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 30 * 24 * 60 * 60 * 1000  // 30天
  });
  ```

---

## 3. Refresh Token 接口

### 3.1 请求

```
GET /api/auth/refresh-token
Cookie: refreshToken=eyJhbGciOi...
```

> 刷新令牌**不**走 `authenticate` 中间件（避免循环依赖）

### 3.2 响应

与 `login` 响应结构**完全相同**，会同时返回新的 `accessToken` 与 `refreshToken`（通过 Cookie 覆盖）。

### 3.3 安全机制

- `sessionId` 每次 refresh 时**重新生成**并写入 `Account.currentSessionId`
- 旧 session 自动失效（防止 refresh token 长期盗用）

---

## 4. JWT Payload 结构（核心）

JWT 访问令牌的 payload 包含以下字段（来自 [src/utils/JwtUtil.js:32-48](../../src/utils/JwtUtil.js#L32-L48)）：

```typescript
type AccessTokenPayload = {
  // ==================== Account 基础信息 ====================
  _id: string;                    // Account._id
  accountType: 'User' | 'Student';
  isAdmin: boolean;               // 是否超管（只有 User 账户可以为 true）
  sessionId: string;              // 当前会话 ID（防并发登录）

  // ==================== User 身份（accountType === 'User' 时存在）====================
  currentUser: {
    _id: string;                  // User._id
    nickname: string;             // User.nickname
    Org: string;                  // User.Org（ObjectId）
    roleTemp: 'manager' | 'teacher';
  };

  // ==================== Student 身份（accountType === 'Student' 时存在）====================
  currentStudent?: {
    _id: string;                  // Student._id
    name: string;                 // Student.name
    Org: string;                  // Student.Org（ObjectId）
  };
};
```

### 4.1 校验规则（JwtUtil.js）

| 条件 | 错误 |
|---|---|
| `accountType === 'User'` 但缺 `currentUser.Org/roleTemp/nickname` | `用户信息不完整，请联系管理员` |
| `accountType === 'User'` 但同时有 `currentStudent` | `账号信息异常（有学生信息）` |
| `accountType === 'Student'` 但缺 `currentStudent.name/Org` | `学生信息不完整，请联系管理员` |
| `accountType === 'Student'` 但同时有 `currentUser` | `账号信息异常（有用户信息）` |
| `accountType` 非法 | `您的账号 身份异常` |

> ⚠️ **重要**：`Student` 账户类型**不**应该有 `currentUser`；`User` 账户类型**不**应该有 `currentStudent`。

---

## 5. 中间件流转（关键）

### 5.1 `authenticate` 中间件（[src/middlewares/auth.js:13-69](../../src/middlewares/auth.js#L13-L69)）

```javascript
exports.authenticate = async (req, res, next) => {
  // 1. 解析 Bearer Token
  const token = req.headers.authorization;
  const payload = verifyAccessToken(token);

  // 2. 校验 Account 有效性
  const Account = await AccountModel.findById(payload._id);
  if (!Account || !Account.isActive) throw 401;

  // 3. 校验 token 中的身份与 Account 一致
  if (Account.accountType === 'User') {
    if (payload.currentUser._id.toString() !== Account.currentUser.toString()) {
      throw 401;  // 提示重新登录
    }
  } else if (Account.accountType === 'Student') {
    if (payload.currentStudent?._id.toString() !== Account.currentStudent.toString()) {
      throw 401;
    }
  }

  // 4. 校验 sessionId（防并发登录）
  if (Account.currentSessionId !== payload.sessionId) {
    if (process.env.NODE_ENV === 'production') throw 401;
    else console.warn(...);  // 开发环境不强制
  }

  // 5. ★ 关键：将 token 里的 payload 完整传递到 req.payload
  req.payload = payload;
  next();
};
```

### 5.2 关键设计：`authenticate` **不覆盖** payload 字段

> 旧版本曾用数据库查询结果覆盖 `req.payload.currentUser` / `req.payload.currentStudent`，导致 token 注入的 `roleTemp` 等字段丢失。
> **新版本（2026-06-04 后）已修正**：`req.payload = payload` 直接传递 token 解码结果。

下游 DAO / Service 中：

```javascript
// ✅ 推荐：直接用 token 注入的字段
if (payload.currentUser.roleTemp !== 'manager') { ... }

// ❌ 错误：依赖数据库重建
if (payload.currentUser.roleTemp === undefined) {
  // roleTemp 应该是 token 里有的，不要从 DB 重建
}
```

### 5.3 `userAuthorize` 中间件（[src/middlewares/auth.js:109-165](../../src/middlewares/auth.js#L109-L165)）

```javascript
exports.userAuthorize = (apiPermission) => async (req, res, next) => {
  const payload = req.payload;

  if (payload.accountType !== 'User') throw 403;

  // 校验 User 账户与 Org 状态
  const User = await UserModel.findOne({ _id: payload.currentUser._id });
  if (!User || !User.isActive) throw 401;

  const Org = await OrgModel.findById(User.Org);
  if (!Org || !Org.isActive) throw 401;

  // 管理员直接通过
  if (payload.isAdmin) return next();

  // 否则检查 API 权限（UserApiPermission）
  const apiPermissionDoc = await ApiPermission.findOne({ apiMethod, apiPath });
  if (!apiPermissionDoc) throw 500;

  const userApiPermission = await UserApiPermission.findOne({
    userId: User._id,
    apiPermissionId: apiPermissionDoc._id,
  });
  if (!userApiPermission) throw 401;

  // 注入 deptsRange（数据范围控制）
  payload.deptsRange = {
    range: userApiPermission.range,
    departmentIds: userApiPermission.departmentIds,
  };
  next();
};
```

> 注意：`userAuthorize` **不重写** `payload.currentUser`——保持 `authenticate` 传入的 token 字段不变。

---

## 6. `payloadChecker` 工具

DAO 层的标准做法是先调 `payloadChecker` 校验 payload 完整性（[src/utils/payloadChecker.js](../../src/utils/payloadChecker.js)）。

### 6.1 三个具名导出

```javascript
// 通用：自动识别 User/Student
const { payloadChecker } = require('@utils/payloadChecker');

// 专用：只校验 User
const { userPayloadChecker } = require('@utils/payloadChecker');

// 专用：只校验 Student
const { studentPayloadChecker } = require('@utils/payloadChecker');
```

### 6.2 校验项

#### `userPayloadChecker` 校验
- `accountType === 'User'`
- `currentUser` 存在
- `currentUser._id` 存在
- `currentUser.Org` 存在
- `currentUser.name` 存在
- `currentUser.roleTemp` 存在

#### `studentPayloadChecker` 校验
- `accountType === 'Student'`
- `!isAdmin`（学生账户不应有管理员权限）
- `currentStudent` 存在
- `currentStudent._id` 存在
- `currentStudent.Org` 存在
- `currentStudent.name` 存在

### 6.3 DAO 中推荐用法

```javascript
const { userPayloadChecker, studentPayloadChecker } = require('@utils/payloadChecker');

const list = async (payload = {}, filter, options) => {
  try {
    if (payload.accountType === 'User') {
      userPayloadChecker(payload);   // ← User 分支用专用校验
      if (!payload.isAdmin) {
        filter.Org = payload.currentUser.Org;
      }
    } else if (payload.accountType === 'Student') {
      studentPayloadChecker(payload);  // ← Student 分支用专用校验
      filter.isActive = true;
    } else {
      throw ({ code: 403, message: "您的身份有误" });
    }
    // ...
  } catch (e) {
    throw e;
  }
};
```

> ❌ **不要**先调 `payloadChecker` 再调 `userPayloadChecker` / `studentPayloadChecker`（重复校验）。

---

## 7. 常见业务场景

### 7.1 仅管理员可创建

```javascript
const add = async (payload, doc) => {
  userPayloadChecker(payload);
  if (!payload.isAdmin) {
    if (payload.currentUser.roleTemp !== 'manager') {
      throw ({ code: 403, message: "只有管理员才能创建" });
    }
  }
  // ...
};
```

### 7.2 跨 Org 防护

```javascript
if (targetDoc.Org.toString() !== payload.currentUser.Org.toString()) {
  throw ({ code: 403, message: "无权操作其他组织的数据" });
}
```

### 7.3 区分账户类型访问

```javascript
if (payload.accountType === 'Student') {
  // 学生场景：限制 isActive、限本 Org 等
} else {
  // User 场景：按 isAdmin/roleTemp 走不同分支
}
```

---

## 8. Token 生命周期

| 阶段 | 触发 | 行为 |
|---|---|---|
| **登录** | `POST /api/auth/login` | 生成 sessionId + 写入 `Account.currentSessionId`，签发 access/refresh token |
| **正常请求** | 任意 API + Bearer Token | `authenticate` 校验 token + sessionId 一致 |
| **刷新** | `GET /api/auth/refresh-token` | 用 refresh token 换新的 access/refresh，**重新生成 sessionId**（旧 session 立即失效）|
| **登出** | `GET /api/auth/logout` | 删除 `Account.currentSessionId`，旧 token 立即失效 |
| **并发登录** | 同一账号在第二台设备登录 | 新 sessionId 覆盖，旧设备 token 在生产环境立即失效（开发环境仅 warn）|

---

## 9. 安全要点

1. **Token 必须用 HTTPS**（生产环境）
2. **Refresh Token 必须 HttpOnly + SameSite=Strict**（防 XSS / CSRF）
3. **sessionId 每次刷新都重新生成**（防 refresh token 长期盗用）
4. **`isAdmin` 只在 token 注入，不要依赖前端传**
5. **Student 永远不能成为 `isAdmin`**
6. **DAO 不应信任任何 token 字段**——除 `currentUser._id` / `currentStudent._id` 用于查 DB 外，其他业务字段应在 DAO 中**重新校验**

---

## 10. 变更记录

| 日期 | 变更内容 | 影响 |
|---|---|---|
| 2026-06-04 | `authenticate` 不再覆盖 `req.payload` 字段 | token 注入的 `roleTemp` 等字段可正常使用 |
| 2026-06-04 | `JwtUtil.js` 移除 `'Admin'` 死分支，改为 `'Student'` | 错误消息准确 |
| 2026-06-04 | `payloadChecker` 工具引入 | DAO 层字段非空校验统一 |
| 2026-06-04 | `userAuthorize` 不再重写 `payload.currentUser` | 数据范围字段 `deptsRange` 正常注入 |

---

## 11. 关联文档

- [ARCHITECTURE.md](../../doc/ARCHITECTURE.md) - 四层架构规范
- [src/middlewares/auth.js](../../src/middlewares/auth.js) - 中间件实现
- [src/utils/JwtUtil.js](../../src/utils/JwtUtil.js) - Token 工具
- [src/utils/payloadChecker.js](../../src/utils/payloadChecker.js) - Payload 校验工具
- [src/modules/_authorization/auth/apiDesc.md](../../src/modules/_authorization/auth/apiDesc.md) - 认证模块 API 文档
