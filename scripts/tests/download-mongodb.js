/**
 * MongoDB 内存服务器二进制文件下载脚本
 *
 * 作用：
 * - 在项目安装依赖后自动下载 MongoDB 的可执行二进制文件
 * - 用于在测试环境中使用内存中的 MongoDB 实例，而无需预先安装 MongoDB
 * - 仅用于测试环境，生产环境中会自动跳过
 *
 * 使用方法：
 * 1. 作为 postinstall 钩子自动执行：`npm install` 或 `pnpm install`
 * 2. 也可以手动运行：`node scripts/tests/download-mongodb.js`
 * 3. 主要用于配合 mongodb-memory-server 在 Jest 测试中使用
 *
 * 功能说明：
 * - 创建并立即停止内存中的 MongoDB 服务器以触发二进制文件下载
 * - 下载的二进制文件会被缓存，后续运行不会重复下载
 * - 确保测试环境的一致性和便携性
 *
 * 优势：
 * - 便携性: 开发者无需在本地安装 MongoDB 即可运行测试
 * - 隔离性: 每次测试都使用全新的数据库实例，避免数据污染
 * - 自动化: 自动执行，确保环境一致
 * - 跨平台: 在不同操作系统上都能正常工作
 */

// 检查是否为生产环境，如果是则跳过下载
/** 生产环境下不执行 */
if (process.env.NODE_ENV === 'production') {
  console.log('Production environment detected. Skipping MongoDB binary download.');
  process.exit(0);
}

const { MongoMemoryServer } = require('mongodb-memory-server');

async function downloadMongoDB() {
  console.info('Downloading MongoDB binary...');

  // 创建内存中的 MongoDB 服务器实例，这会触发二进制文件下载
  const mongod = await MongoMemoryServer.create();

  // 立即停止服务器，因为我们只需要下载二进制文件
  await mongod.stop();

  console.info('MongoDB binary downloaded successfully');
}

// 执行下载并处理错误
downloadMongoDB().catch(err => {
  console.error('Error downloading MongoDB binary:', err);
  process.exit(1);
}); 