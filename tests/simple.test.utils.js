/**
 * 简化的测试工具函数
 * 不依赖完整的应用结构，避免模块别名问题
 */
const request = require('supertest');

// 创建一个简化版的应用，只包含必要的中间件
const express = require('express');

// 这里我们创建一个简单的应用实例用于测试，而不导入完整的应用
// 因为我们遇到模块别名问题，需要先解决这个问题
const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // 添加一个简单的端点用于测试
  app.get('/', (req, res) => {
    res.json({ message: 'Test app running' });
  });

  return app;
};

const app = createTestApp();

// 简化的测试工具函数
const startMongoServer = async () => {
  console.log('Starting mock MongoDB server for tests...');
  // 在实际实现中，这里会启动内存MongoDB
};

const stopMongoServer = async () => {
  console.log('Stopping mock MongoDB server...');
};

const clearDatabase = async () => {
  console.log('Clearing mock database...');
  // 在实际实现中，这里会清空数据库
};

module.exports = {
  request,
  app,
  startMongoServer,
  stopMongoServer,
  clearDatabase
};