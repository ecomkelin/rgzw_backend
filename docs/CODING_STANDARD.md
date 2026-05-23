# 项目开发规范

## 1. 模型 (Models)

### 1.1 模型文件命名规范
- 文件名以 `.model.js` 结尾，例如：`User.model.js`、`Account.model.js`
- 模型文件放置于 `src/models/` 目录下，按功能模块分组

### 1.2 模型结构规范
```javascript
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

// 定义枚举值
const roleSimpEnums = ['manager', 'teacher'];

const doc = {
  // 字段定义
  roleSimp: { type: String, enum: roleSimpEnums, default: 'teacher', required: true },
  // ...
};

const docSchema = new Schema(doc, { timestamps: true });

// 索引定义
docSchema.index({ fieldName: 1 }, { unique: true });

const Model = mongoose.model('ModelName', docSchema);

// 暴露枚举值
Model.doc = doc;
Model.roleSimpEnums = roleSimpEnums;
Model.modelEnums = { roleSimpEnums }; // 统一访问枚举

module.exports = Model;
```

### 1.3 模型枚举访问规范
- 枚举值通过 `modelEnums` 属性统一访问
- 不直接访问模型上的枚举数组，而是使用 `{ modelEnums }` 解构

## 2. 验证器 (Validators)

### 2.1 验证器文件位置
- 验证器文件位于对应模块的 `utils/validator.js` 
- 例如：`src/modules/_organization/user/utils/validator.js`

### 2.2 验证器命名规范
- `createVD`: 创建验证规则
- `updateVD`: 更新验证规则  
- `listVD`: 列表查询验证规则
- `detailVD`: 详情验证规则
- `deleteVD`: 删除验证规则

### 2.3 验证器使用模型枚举
```javascript
const { modelEnums } = require('@models/path/to/model');
const { enumValue } = modelEnums;

// 使用枚举进行验证
commonBodyRules.validateEnum('fieldName', enumValue)
```

## 3. 服务层 (Services)

### 3.1 服务文件结构
- 服务文件使用 `SV` 后缀，如 `UserSV`
- 服务类包含标准 CRUD 方法：`list`, `detail`, `create`, `update`, `delete`

### 3.2 服务类规范
```javascript
class ModelSV {
  async list(query = {}, payload) {
    try {
      // 业务逻辑
    } catch (error) {
      console.error('Service error:', error.message);
      throw error;
    }
  }
}
```

## 4. 控制器 (Controllers)

### 4.1 控制器文件结构
- 控制器文件使用 `CT` 后缀，如 `UserCT`
- 使用 `asyncHandler` 包装异步函数

### 4.2 控制器方法规范
```javascript
methodName = asyncHandler(async (req, res, next) => {
  try {
    // 控制器逻辑
  } catch (error) {
    // 统一错误处理
  }
});
```

## 5. 路由 (Routes)

### 5.1 路由文件命名
- 路由文件以 `.routes.js` 结尾
- 自动加载机制会扫描 `modules` 目录下的 `.routes.js` 文件

### 5.2 路由文件放置规则
- 双下划线 `__` 开头的目录和文件会被忽略
- 下划线 `_` 开头的目录名会从路由前缀中省略

## 6. 中间件 (Middlewares)

### 6.1 异步处理
- 使用 `asyncHandler` 包装异步中间件
- 统一错误处理机制

## 7. 工具函数 (Utils)

### 7.1 通用工具
- `asyncHandler.js`: 异步路由处理器包装器
- `response.js`: 统一API响应格式
- `envValidator.js`: 环境变量验证

### 7.2 验证工具
- `validatorHandle.js`: 基础验证规则
- `validatorModel.js`: 模型验证辅助函数

## 8. 项目结构约定

### 8.1 目录结构
```
src/
├── models/           # 数据模型
│   ├── authorization/  # 认证相关模型
│   ├── organization/   # 组织结构模型
│   └── global/         # 全局模型
├── modules/          # 功能模块
│   ├── _authorization/ # 认证模块
│   ├── _organization/  # 组织模块
│   └── _global/        # 全局模块
├── middlewares/      # 中间件
├── utils/           # 工具函数
└── routers/         # 路由
```

### 8.2 模块内结构
```
module-name/
├── controller.js    # 控制器
├── service.js       # 服务层
├── index.routes.js  # 路由文件
└── utils/
    └── validator.js # 验证器
```

## 9. 命名规范

### 9.1 文件命名
- 驼峰命名法：`userService.js`
- 模型文件：`ModelName.model.js`
- 路由文件：`feature.routes.js`

### 9.2 变量和函数命名
- 类名：大驼峰 `UserService`
- 函数和变量：小驼峰 `getUserById`
- 常量：大写下划线 `MAX_LENGTH`

## 10. 错误处理

### 10.1 统一错误响应
- 使用 `ApiResponse` 类统一错误响应格式
- 包含 `success`, `code`, `message`, `data` 字段

### 10.2 异常处理
- 使用 try-catch 处理同步操作
- 使用 `asyncHandler` 处理异步操作
- 中间件统一捕获未处理异常

## 11. 环境变量

### 11.1 必需环境变量
- `NODE_ENV`: 环境标识
- `MONGODB_URI`: 数据库连接字符串
- `ACCESS_TOKEN_SECRET`: 访问令牌密钥
- `REFRESH_TOKEN_SECRET`: 刷新令牌密钥

### 11.2 环境变量验证
- 应用启动时自动验证必需环境变量
- 缺失环境变量会导致启动失败

## 12. 测试规范

### 12.1 测试文件位置
- 单元测试：`__tests__/unit/`
- 集成测试：`__tests__/integration/`
- 端到端测试：`__tests__/e2e/`

### 12.2 测试命名
- 测试文件使用 `.test.js` 或 `.spec.js` 后缀
- 测试描述清晰表明测试目的