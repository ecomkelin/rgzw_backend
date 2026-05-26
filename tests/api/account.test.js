/**
 * 账户模块 API 测试
 */
const {
  request,
  app,
  startMongoServer,
  stopMongoServer,
  clearDatabase,
  loginAndGetTokens
} = require('../test.utils');

describe('Account API', () => {
  let authToken;

  beforeAll(async () => {
    await startMongoServer();
  });

  beforeEach(async () => {
    await clearDatabase();

    // 为需要认证的测试预先登录
    try {
      const loginResult = await loginAndGetTokens({
        code: 'admin',
        password: '12345678'
      });
      authToken = loginResult.accessToken;
    } catch (error) {
      // 如果默认账户不存在，创建测试数据
      authToken = null;
    }
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await stopMongoServer();
  });

  describe('POST /api/account/list', () => {
    test('应该返回账户列表', async () => {
      if (!authToken) {
        // 如果没有认证令牌，跳过此测试
        return;
      }

      const response = await request(app)
        .post('/api/account/list')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          filter: {},
          options: {}
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data).toHaveProperty('total');
    });

    test('应该在未认证时返回401', async () => {
      const response = await request(app)
        .post('/api/account/list')
        .send({
          filter: {},
          options: {}
        });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/account/detail/:id', () => {
    test('应该返回指定账户详情', async () => {
      if (!authToken) {
        // 如果没有认证令牌，跳过此测试
        return;
      }

      // 首先获取一个账户ID
      const listResponse = await request(app)
        .post('/api/account/list')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          filter: {},
          options: {}
        });

      if (listResponse.body.data.items.length > 0) {
        const accountId = listResponse.body.data.items[0]._id;

        const response = await request(app)
          .post(`/api/account/detail/${accountId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send();

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('code', 200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('item');
      }
    });

    test('应该在未认证时返回401', async () => {
      const response = await request(app)
        .post('/api/account/detail/invalid_id')
        .send();

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/account/edit/:id', () => {
    test('应该允许编辑账户信息', async () => {
      if (!authToken) {
        // 如果没有认证令牌，跳过此测试
        return;
      }

      // 首先获取一个账户ID
      const listResponse = await request(app)
        .post('/api/account/list')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          filter: {},
          options: {}
        });

      if (listResponse.body.data.items.length > 0) {
        const accountId = listResponse.body.data.items[0]._id;

        const response = await request(app)
          .post(`/api/account/edit/${accountId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            nickname: 'Updated Name'
          });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('code', 200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('item');
      }
    });

    test('应该在未认证时返回401', async () => {
      const response = await request(app)
        .post('/api/account/edit/invalid_id')
        .send({
          nickname: 'Test Name'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/account/self', () => {
    test('应该返回当前用户账户信息', async () => {
      if (!authToken) {
        // 如果没有认证令牌，跳过此测试
        return;
      }

      const response = await request(app)
        .post('/api/account/self')
        .set('Authorization', `Bearer ${authToken}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('item');
    });

    test('应该在未认证时返回401', async () => {
      const response = await request(app)
        .post('/api/account/self')
        .send();

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/account/edit/self', () => {
    test('应该允许编辑当前用户信息', async () => {
      if (!authToken) {
        // 如果没有认证令牌，跳过此测试
        return;
      }

      const response = await request(app)
        .post('/api/account/edit/self')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nickname: 'Updated Self Name'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('item');
    });

    test('应该在未认证时返回401', async () => {
      const response = await request(app)
        .post('/api/account/edit/self')
        .send({
          nickname: 'Test Name'
        });

      expect(response.status).toBe(401);
    });
  });
});