const mongoose = require('mongoose');

beforeAll(async () => {
  // 连接测试数据库
  await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/test');
});

afterAll(async () => {
  // 清理并关闭数据库连接
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  // 清理所有集合
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
}); 