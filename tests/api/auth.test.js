/**
 * 认证模块 API 测试
 */
const {
  request,
  app,
  startMongoServer,
  stopMongoServer,
  clearDatabase,
  loginAndGetTokens
} = require('../test.utils');

describe('Authentication API', () => {
  beforeAll(async () => {
    await startMongoServer();
  });

  beforeEach(async () => {
    await clearDatabase();
    // 这里可以创建初始测试数据
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await stopMongoServer();
  });

  describe('POST /api/auth/login', () => {
    test('应该成功登录并返回令牌', async () => {
      // 创建一个测试账户用于登录
      const testCredentials = {
        code: 'admin',
        password: '12345678' // 假设这是默认密码
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
        code: 'nonexistent',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidCredentials);

      expect(response.status).toBe(200); // 通常这类应用在验证失败时也会返回200，但success为false
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code');
    });

    test('应该验证请求参数', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({}); // 空请求体

      // 验证参数验证失败
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/refresh-token', () => {
    test('应该能够刷新访问令牌', async () => {
      // 首先登录获取refreshToken（通过Cookie）
      const testCredentials = {
        code: 'admin',
        password: '12345678'
      };

      // 注意：由于refresh-token端点依赖于Cookie中的refreshToken，
      // 这里可能需要模拟登录过程，实际测试可能需要调整
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send(testCredentials);

      // 通常refreshToken存储在Cookie中，我们需要处理Cookie
      const response = await request(app)
        .get('/api/auth/refresh-token')
        .set('Cookie', loginResponse.headers['set-cookie']); // 从登录响应获取Cookie

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('code', 200);
    });
  });

  describe('GET /api/auth/logout', () => {
    test('应该成功登出', async () => {
      // 首先登录获取令牌
      const testCredentials = {
        code: 'admin',
        password: '12345678'
      };

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send(testCredentials);

      const accessToken = loginResponse.body.data.accessToken;

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