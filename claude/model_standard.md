# 模型层开发标准

## 模型层（Model.model.js）
模型层定义数据结构，包含以下标准：

### 1. 基本结构
每个模型文件应遵循以下基本结构：

```javascript
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

// 定义枚举值（如果有）
const statusEnums = ['active', 'inactive', 'pending'];
const roleEnums = ['admin', 'user', 'guest'];

// 定义文档结构
const doc = {
  // 字段定义
  name: { type: String, required: true },
  status: { type: String, enum: statusEnums, default: 'active' },
  role: { type: String, enum: roleEnums, default: 'user' },
  org: { type: ObjectId, ref: 'Org', required: true }, // 关联字段
  isActive: { type: Boolean, default: true },
  sort: { type: Number, default: 0 },
  createdBy: { type: ObjectId, ref: 'Account', immutable: true },
  updatedBy: { type: ObjectId, ref: 'Account' }
};

// 创建 Schema
const docSchema = new Schema(doc, { timestamps: true });

// 定义索引
docSchema.index({ org: 1, name: 1 }, { unique: true }); // 复合唯一索引
docSchema.index({ createdAt: -1 }); // 按创建时间排序的索引

// 定义中间件（如果有）
docSchema.pre('save', async function(next) {
  // 保存前的处理逻辑
  next();
});

// 定义实例方法
docSchema.methods.customMethod = function() {
  // 自定义实例方法
};

// 定义静态方法
docSchema.statics.findByCustomCriteria = function(criteria) {
  // 自定义静态方法
};

// 创建模型
const Model = mongoose.model('ModelName', docSchema);

// 暴露枚举和其他元数据（可选）
Model.doc = doc;
Model.modelEnums = { statusEnums, roleEnums };

module.exports = Model;
```

### 2. 字段定义规范
- **必需字段**：使用 `required: true` 定义必需字段
- **引用字段**：使用 `ref` 属性定义与其他模型的引用关系
- **枚举字段**：使用 `enum` 属性限制字段值范围
- **默认值**：使用 `default` 属性设置字段默认值
- **不可变字段**：使用 `immutable: true` 防止字段被修改
- **隐藏字段**：使用 `select: false` 隐藏敏感字段（如密码哈希）

### 3. 枚举定义
- 定义枚举数组，如 `const statusEnums = ['active', 'inactive'];`
- 使用 `modelEnums` 对象集中暴露所有枚举：`Model.modelEnums = { statusEnums };`

### 4. 索引策略
- 为经常查询的字段创建索引
- 为唯一约束字段创建唯一索引：`{ unique: true }`
- 为复合查询条件创建复合索引
- 使用 `partialFilterExpression` 创建部分索引（可选字段）

### 5. 中间件使用
- `pre` 中间件：保存前处理逻辑（如密码加密）
- `post` 中间件：保存后处理逻辑
- 注意错误处理，确保调用 `next()` 或 `next(error)`

### 6. 方法定义
- **实例方法**：使用 `docSchema.methods.methodName` 定义
- **静态方法**：使用 `docSchema.statics.methodName` 定义
- 用于封装常用查询或业务逻辑

### 7. 时间戳
- 使用 `{ timestamps: true }` 自动管理 `createdAt` 和 `updatedAt`
- 除非特殊需求，否则始终启用时间戳

### 8. 字段类型建议
- **ObjectId**: 用于关联其他文档
- **String**: 用于文本，可设置长度限制
- **Number**: 用于数值，可设置范围限制
- **Boolean**: 用于真假值
- **Date**: 用于日期时间
- **Array**: 用于列表，可指定数组元素类型
- **Mixed**: 用于混合类型（谨慎使用）

### 9. 数据验证
- 使用 Mongoose 内置验证器（如 `required`, `unique`, `enum`）
- 在 Schema 级别添加自定义验证器
- 对于复杂验证逻辑，在中间件中实现

### 10. 关联关系
- 使用 `ref` 属性定义引用关系
- 考虑性能影响，谨慎使用深度嵌套引用
- 在查询时使用 `populate()` 方法填充关联数据

### 11. 安全考虑
- 使用 `select: false` 保护敏感字段
- 对于密码等敏感数据，实施加密存储
- 验证和清理用户输入
- 防止 NoSQL 注入攻击

### 12. 性能优化
- 合理设计索引，避免过度索引
- 使用投影查询只获取必要字段
- 考虑分片策略以处理大数据集
- 避免深嵌套结构，优先使用引用

### 13. 常见字段模式
```javascript
// 组织字段
Org: { type: ObjectId, ref: 'Org', required: true },

// 状态字段
isActive: { type: Boolean, default: true },

// 排序字段
sort: { type: Number, default: 0 },

// 关联字段
createdBy: { type: ObjectId, ref: 'Account', immutable: true },
updatedBy: { type: ObjectId, ref: 'Account' },

// 时间戳由 timestamps 选项自动添加
// createdAt, updatedAt
```

### 14. 特殊用途字段
- `immutable: true` - 创建后不可修改的字段（如创建者）
- `select: false` - 查询时不返回的字段（如密码）
- `trim: true` - 自动去除首尾空白字符
- `unique: true` - 唯一性约束（需要创建唯一索引）

### 15. 安全控制字段
在服务层中使用 `deleteImmutableFront` 工具函数来移除前端不应修改的字段：
- 通过在模型字段中设置 `immutableFront: true` 标记前端不可变字段
- 在服务层的 `create` 和 `update` 方法中调用 `deleteImmutableFront(doc, Model.doc)` 
- 常见的 `immutableFront` 字段包括：`lastLoginAt`、`lastLoginIP`、`lastLogoutAt`、`updatedBy` 等
- 该机制防止前端恶意修改关键系统字段