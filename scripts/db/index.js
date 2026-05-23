require('dotenv').config();
const mongoose = require('mongoose');
// 注册模块别名
require('module-alias/register');
const { initializeAll } = require('./seeds/init-seeds');

async function initSeeds() {
  try {
    console.info('正在连接数据库...');
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_TEST_URI);
    console.info('数据库连接成功');

    console.info('开始初始化种子数据...');
    await initializeAll();
    console.info('种子数据初始化完成');
  } catch (error) {
    console.error('初始化种子数据失败:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.info('数据库连接已关闭');
    process.exit(0);
  }
}

initSeeds();