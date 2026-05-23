/**
 * 认证API接口测试文件
 * 测试内容: 登录接口 (POST /api/auth/login)
 * 执行命令: node tests/api/auth/test-login.js
 */

const axios = require('axios');

// 测试配置
const BASE_URL = 'http://localhost:8000/api/auth';
const TEST_CREDENTIALS = {
  code: 'ADMIN001',
  password: 'Test1234@'
};

class LoginTester {
  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async testLogin() {
    console.log('🧪 测试登录接口 (/login)...');

    try {
      const response = await this.client.post('/login', TEST_CREDENTIALS);

      console.log('✅ 登录成功');
      console.log('   状态码:', response.status);
      console.log('   响应数据:', {
        code: response.data.code,
        message: response.data.message,
        hasAccessToken: !!response.data.data?.accessToken,
        accountName: response.data.data?.account?.name
      });

      return {
        success: true,
        data: response.data,
        cookies: response.headers['set-cookie']
      };
    } catch (error) {
      console.error('❌ 登录失败:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  async run() {
    console.log('🚀 开始登录接口测试...\n');
    const result = await this.testLogin();

    console.log('\n📋 测试结果:', result.success ? '✅ 通过' : '❌ 失败');
    return result;
  }
}

// 执行测试
if (require.main === module) {
  const tester = new LoginTester();
  tester.run().catch(console.error);
}

module.exports = LoginTester;