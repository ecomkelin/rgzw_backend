# Scripts 目录说明

本目录包含项目所需的各种脚本文件，按功能进行组织。

## 目录结构

```
scripts/
├── db/                              # 数据库相关脚本
│   ├── index.js                     # 初始化数据库种子数据
│   └── seeds/                       # 种子数据文件
│       ├── init-seeds.js            # 种子数据初始化入口
│       ├── Account.seed.js          # 账户相关种子数据
│       └── apiPermission.seed.js    # API权限种子数据
├── tests/                           # 测试相关脚本
│   ├── download-mongodb.js          # 下载 MongoDB 二进制文件 (用于测试)
│   └── load-test.js                 # 性能负载测试脚本
└── utils/                           # 工具类脚本
    └── (待扩展)
```

## 详细说明

### db/ 目录
- **index.js**: 初始化数据库中的种子数据
  - 连接数据库后调用 seeds/init-seeds.js 中的初始化函数
  - 支持根据环境变量自动选择数据库连接字符串

### db/seeds/ 目录
- 包含不同业务模块的种子数据
- 按功能模块组织 (如授权相关、账户相关等)
- 支持模块化初始化，可单独或批量运行特定模块种子

### tests/ 目录
- **download-mongodb.js**: 在开发/测试环境中预下载 MongoDB 二进制文件，避免测试时临时下载
- **load-test.js**: 运行性能负载测试，测试 API 的吞吐量

### utils/ 目录
- 包含各种通用工具脚本 (预留目录)

## 使用方式

### 数据库种子
```bash
# 初始化所有种子数据
npm run db:seeds

# 测试环境初始化种子数据
npm run db:seeds:test
```

### 测试脚本
```bash
# 运行综合负载测试
npm run test:load

# 快速负载测试 (使用 autocannon 命令行)
npm run test:load:quick
```

## 最佳实践

1. **模块化设计**: 每个业务模块的种子数据独立成文件，便于维护
2. **依赖顺序**: 在 init-seeds.js 中定义初始化顺序，确保依赖关系正确
3. **错误处理**: 所有脚本都有完善的错误处理和日志输出
4. **环境适配**: 支持不同的运行环境 (开发/测试/生产)




### download-mongodb.js 的详细说明
## 作用
- download-mongodb.js 是一个MongoDB 内存服务器二进制文件下载脚本，其主要目的是在测试环境中预下载 MongoDB 的可执行二进制文件。
## 执行时机
- 自动执行：作为 postinstall 钩子，在运行 npm install 或 pnpm install 时自动执行
- 手动执行：开发者可以手动运行 node scripts/tests/download-mongodb.js
## 具体做了什么
1. 环境检测
if (process.env.NODE_ENV === 'production') {
  console.log('Production environment detected. Skipping MongoDB binary download.');
  process.exit(0);
}
- 脚本首先检查是否为生产环境，如果是则跳过执行
- 确保只在开发/测试环境执行下载
2. 触发二进制文件下载
const mongod = await MongoMemoryServer.create();
await mongod.stop();
- 创建一个内存中的 MongoDB 服务器实例
- 立即停止该实例（实际上并不启动服务）
- 这个过程触发了 MongoDB 二进制文件的下载和缓存
3. 为什么这样做
- mongodb-memory-server 库在首次创建实例时会自动下载适合当前操作系统的 MongoDB 二进制文件
- 通过提前创建并销毁一个实例，我们确保了 MongoDB 二进制文件被缓存
- 这样在后续的测试中，就不需要每次都下载，从而加速测试执行
## 使用场景
# 主要用途
- 加速测试执行：在 CI/CD 环境或开发环境中，避免每次运行测试时都下载 MongoDB
- 离线测试支持：确保在网络连接不佳的情况下也能运行测试
- 环境一致性：确保所有开发者的环境都有相同的 MongoDB 版本
# 具体使用流程
- 开发者运行 npm install 或 pnpm install
- postinstall 钩子触发，自动运行 download-mongodb.js
- 脚本下载 MongoDB 二进制文件并将其缓存到本地
- 当运行测试（npm run test）时，mongodb-memory-server 使用已缓存的二进制文件快速启动临时数据库
- 测试结束后，临时数据库被清理
# 重要特点
- 仅用于测试环境：生产环境中不会执行
- 一次下载，多次使用：下载的二进制文件会被缓存
- 跨平台兼容：自动下载适合当前操作系统的 MongoDB 二进制文件
- 自动化流程：作为安装后钩子，无需手动干预
- 简而言之，这个脚本是为了提升开发和测试体验，通过预先下载 MongoDB 二进制文件来加快后续测试的启动速度。