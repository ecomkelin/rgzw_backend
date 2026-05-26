/**
 * 测试工具函数
 * 提供测试所需的通用功能
 */
// 注册模块别名
require('module-alias/register');

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/main').app;

let mongoServer;

/**
 * 启动内存MongoDB服务器
 */
const startMongoServer = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
};

/**
 * 关闭内存MongoDB服务器
 */
const stopMongoServer = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

/**
 * 清空数据库
 */
const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

/**
 * 登录获取认证令牌
 * @param {Object} credentials - 登录凭据 {code, password}
 * @returns {Promise<Object>} 包含认证信息的对象
 */
const loginAndGetTokens = async (credentials) => {
  const response = await request(app)
    .post('/api/auth/login')
    .send(credentials)
    .expect(200);

  // 从响应头中提取认证信息
  return {
    accessToken: response.body.data.accessToken,
    account: response.body.data.account
  };
};

module.exports = {
  request,
  app,
  startMongoServer,
  stopMongoServer,
  clearDatabase,
  loginAndGetTokens
};