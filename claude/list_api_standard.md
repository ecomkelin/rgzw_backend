# 列表接口标准文档模板

## 接口名称
获取标签列表

## 请求方法
POST /api/label/list

## 请求头
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

## 请求体参数
| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| regExp | String | 否 | 模糊搜索标签名称 | "语文" |
| mould | String | 否 | 标签分类（Subject/Finance/Production） | "Subject" |
| isActive | Boolean | 否 | 标签激活状态 | true |
| options | Object | 否 | 查询选项 | 见下方 |

### options 参数详解
| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| page | Number | 否 | 当前页码（默认为1） | 1 |
| pageSize | Number | 否 | 每页数量（默认为60，最大为600） | 20 |
| sort | Object | 否 | 排序配置 | { "sort": -1, "updatedAt": -1 } |

## 请求示例
```json
{
  "regExp": "数学",
  "mould": "Subject",
  "isActive": true,
  "options": {
    "page": 1,
    "pageSize": 20,
    "sort": {
      "sort": -1,
      "updatedAt": -1
    }
  }
}
```

## 响应示例
```json
{
  "code": 200,
  "message": "请求成功",
  "data": {
    "items": [
      {
        "_id": "60a1b2c3d4e5f6789abcdef01",
        "Org": "60a1b2c3d4e5f6789abcdef02",
        "mould": "Subject",
        "name": "数学",
        "description": "数学学科标签",
        "isActive": true,
        "sort": 10,
        "posterUrl": null,
        "createdBy": {
          "_id": "60a1b2c3d4e5f6789abcdef03",
          "username": "admin",
          "email": "admin@example.com"
        },
        "updatedBy": {
          "_id": "60a1b2c3d4e5f6789abcdef03",
          "username": "admin",
          "email": "admin@example.com"
        },
        "createdAt": "2023-05-15T10:30:00.000Z",
        "updatedAt": "2023-05-15T10:30:00.000Z"
      }
    ],
    "query": {
      "name": {
        "$regex": "数学",
        "$options": "i"
      },
      "mould": "Subject",
      "isActive": true,
      "Org": "60a1b2c3d4e5f6789abcdef02"
    },
    "pagination": {
      "currentPage": 1,
      "pageSize": 20,
      "totalCount": 1,
      "totalPages": 1
    }
  }
}
```

## 响应参数
| 参数名 | 类型 | 描述 |
|--------|------|------|
| items | Array | 标签数据列表 |
| query | Object | 应用的查询条件 |
| pagination | Object | 分页信息 |

## 错误响应
| HTTP状态码 | 错误码 | 描述 |
|------------|--------|------|
| 400 | 400 | 请求参数验证失败 |
| 401 | 401 | 未授权访问 |
| 403 | 403 | 无权限访问 |
| 500 | 500 | 服务器内部错误 |

## 注意事项
- 列表接口支持多种筛选方式：模糊搜索（regExp）、分类筛选（mould）、状态筛选（isActive）
- 模糊搜索使用 MongoDB 的正则表达式功能，不区分大小写
- 非管理员用户只能查询属于自己组织的数据
- 非管理员用户只能看到活跃状态的数据（isActive: true）
- 分页功能限制每页最大数量，防止单次请求过多数据
- 返回的数据会根据用户的权限进行过滤

## 处理流程
1. 验证器层接收请求并验证参数格式
2. 控制器调用服务层的 list 方法
3. 服务层使用 `formatOptions` 处理分页和排序参数
4. 服务层将 `regExp` 参数转换为 MongoDB 正则表达式查询
5. 服务层应用权限过滤（基于 Org_id）
6. 服务层计算分页信息并返回结果