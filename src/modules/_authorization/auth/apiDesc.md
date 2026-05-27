# Authentication 模块 API 接口文档

## 概述

Authentication模块负责用户认证功能，包括登录、登出和令牌刷新功能。

## 接口列表

### 1. 用户登录
- **路径**: `POST /api/auth/login`
- **描述**: 用户登录，返回访问令牌和用户信息
- **请求参数**:
  - `code`: 用户账号/编码 (必填, 4-16位字符串)
  - `password`: 用户密码 (必填, 8-16位字符串)
- **响应**:
  - `accessToken`: 访问令牌
  - `account`: 账户信息
  - `refreshToken`: 刷新令牌（通过Cookie设置）

### 2. 刷新访问令牌
- **路径**: `GET /api/auth/refresh-token`
- **描述**: 使用刷新令牌获取新的访问令牌
- **请求参数**: 从Cookie中获取refreshToken
- **响应**:
  - `accessToken`: 新的访问令牌
  - `account`: 账户信息
  - `refreshToken`: 新的刷新令牌（通过Cookie设置）

### 3. 用户登出
- **路径**: `GET /api/auth/logout`
- **描述**: 用户登出，清除登录状态
- **认证要求**: 需要有效的访问令牌
- **响应**: 登出成功消息

## 认证机制

- 使用基于JWT的双重令牌认证机制
- 访问令牌(Access Token): 用于常规API调用，短期有效
- 刷新令牌(Refresh Token): 存储在HttpOnly Cookie中，长期有效，用于获取新的访问令牌

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