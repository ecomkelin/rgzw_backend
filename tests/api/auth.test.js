/**
 * 认证模块 API 测试
 */
const {
  request,
  app,
  startMongoServer,
  stopMongoServer,
  clearDatabase,
  initializeTestData
} = require('../test.utils');

describe('Authentication API', () => {
  let testData;

  beforeAll(async () => {
    await startMongoServer();
  });

  beforeEach(async () => {
    await clearDatabase();
    testData = await initializeTestData(); // 初始化测试数据
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await stopMongoServer();
  });

  describe('POST /api/auth/login', () => {
    test('应该成功登录并返回令牌', async () => {
      const testCredentials = {
        code: 'ADMIN',  // 使用大写以匹配数据库中的值
        password: 'admin123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(testCredentials);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('account');
    });

    test('应该在凭证错误时返回400', async () => {
      const invalidCredentials = {
        code: 'NONEXISTENT',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidCredentials);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code');
    });

    test('应该验证请求参数', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({}); // 空请求体

      // 验证参数验证失败
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/refresh-token', () => {
    test('应该能够刷新访问令牌', async () => {
      // 登录以设置cookie
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          code: 'ADMIN',
          password: 'admin123'
        })
        .expect(200);

      // 从登录响应中提取cookies
      const cookies = loginResponse.headers['set-cookie'];
      expect(cookies).toBeDefined();

      // 使用cookies来刷新令牌
      const response = await request(app)
        .get('/api/auth/refresh-token')
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('code', 200);
    });
  });

  describe('GET /api/auth/logout', () => {
    test('应该成功登出', async () => {
      // 首先登录获取令牌
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          code: 'ADMIN',
          password: 'admin123'
        })
        .expect(200);

      const accessToken = loginResponse.body.data.accessToken;

      // 现在使用Bearer token进行登出请求
      const response = await request(app)
        .get('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('message', '成功退出');
    });

    test('应该在未认证时返回401', async () => {
      const response = await request(app)
        .get('/api/auth/logout');

      expect(response.status).toBe(401);
    });
  });
});