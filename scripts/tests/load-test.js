/**
 * 负载测试脚本
 *
 * 作用：
 * - 对 API 进行压力测试，评估系统在高并发下的性能表现
 * - 测试健康检查、登录和受保护端点的响应能力
 * - 生成性能报告，帮助识别性能瓶颈
 *
 * 使用方法：
 * 1. 确保服务已在 localhost:8000 上运行
 * 2. 运行 `pnpm test:load` 或 `node scripts/tests/load-test.js`
 * 3. 查看控制台输出的结果报告
 *
 * 包含的测试场景：
 * - 健康检查端点测试
 * - 登录接口性能测试
 * - 受保护端点（用户、产品等）的并发访问测试
 *
 * 依赖：
 * - autocannon: 高性能 HTTP 负载测试工具
 * - fetch API: 用于获取认证令牌
 */

const autocannon = require('autocannon');
const { promisify } = require('util');

const run = promisify(autocannon);

// 默认配置
const DEFAULT_CONFIG = {
  HEALTH_CHECK: {
    url: 'http://localhost:8000/api/health',
    connections: 100,
    duration: 10,
    title: 'Health Check Test'
  },
  LOGIN: {
    url: 'http://localhost:8000/api/auth/login',
    connections: 50,
    duration: 20,
    title: 'Login Test',
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      code: 'ADMIN001',
      password: 'Test1234@' // 使用实际密码
    })
  }
};

async function runHealthCheckTest() {
  console.info('\nRunning health check test...');

  try {
    const result = await run(DEFAULT_CONFIG.HEALTH_CHECK);

    console.info('\nHealth Check Results:');
    console.info(autocannon.printResult(result));

    return result;
  } catch (error) {
    console.error('Health check test failed:', error);
    return null;
  }
}

async function runLoginTest() {
  console.info('\nRunning login test...');

  try {
    const result = await run(DEFAULT_CONFIG.LOGIN);

    console.info('\nLogin Test Results:');
    console.info(autocannon.printResult(result));

    return result;
  } catch (error) {
    console.error('Login test failed:', error);
    return null;
  }
}

async function runAuthenticatedTests(token) {
  if (!token) {
    console.warn('No token provided for authenticated tests, skipping...');
    return;
  }

  try {
    // 用户列表测试
    console.info('\nRunning users API test...');
    const usersResult = await run({
      url: 'http://localhost:8000/api/users',
      connections: 50,
      duration: 20,
      title: 'Users API Test',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.info('\nUsers API Results:');
    console.info(autocannon.printResult(usersResult));

    // 产品接口测试
    const productResult = await run({
      url: 'http://localhost:8000/api/products',
      connections: 50,
      duration: 20,
      title: 'Products API Test',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.info('\nProducts API Results:');
    console.info(autocannon.printResult(productResult));

  } catch (error) {
    console.error('Authenticated tests failed:', error);
  }
}

async function getAuthToken() {
  try {
    const response = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: 'ADMIN001',
        password: 'Test1234@' // 使用实际密码
      })
    });

    if (!response.ok) {
      console.error('Failed to login:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    return data.data?.token || data.token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

async function runLoadTest() {
  console.info('Starting comprehensive load test...');

  try {
    // 运行健康检查
    await runHealthCheckTest();

    // 运行登录测试
    await runLoginTest();

    // 获取认证令牌并运行受保护端点的测试
    const token = await getAuthToken();
    await runAuthenticatedTests(token);

    console.info('\nLoad test completed.');
  } catch (error) {
    console.error('Load test error:', error);
  }
}

runLoadTest().catch(console.error); 