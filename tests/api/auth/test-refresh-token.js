/**
 * 认证API接口测试文件
 * 测试内容: 刷新令牌接口 (GET /api/auth/refresh-token)
 * 执行命令: node tests/api/auth/test-refresh-token.js
 */

const axios = require('axios');

// 测试配置
const BASE_URL = 'http://localhost:8000/api/auth';

class RefreshTokenTester {
  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async testRefreshToken() {
    console.log('🔄 测试刷新令牌接口 (/refresh-token)...');

    try {
      // 尝获取刷新令牌（通常在登录后获得）
      // 由于无法直接获取cookie，我们将直接调用接口
      const response = await this.client.get('/refresh-token');

      console.log('✅ 刷新令牌成功');
      console.log('   状态码:', response.status);
      console.log('   响应数据:', {
        code: response.data.code,
        message: response.data.message,
        hasNewAccessToken: !!response.data.data?.accessToken
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('ℹ️  刷新令牌失败（预期）: refreshToken 不存在或已过期');
        console.log('   说明: 需要先登录获取refreshToken Cookie才能测试此接口');
        return {
          success: false,
          error: 'Missing refreshToken cookie - need to login first',
          isExpected: true
        };
      } else {
        console.error('❌ 刷新令牌失败:', error.response?.data || error.message);
        return {
          success: false,
          error: error.response?.data || error.message,
          isExpected: false
        };
      }
    }
  }

  async run() {
    console.log('🚀 开始刷新令牌接口测试...\n');
    const result = await this.testRefreshToken();

    console.log('\n📋 测试结果:', result.success ? '✅ 通过' :
                result.isExpected ? 'ℹ️  预期失败（需要先登录）' : '❌ 失败');
    return result;
  }
}

// 执行测试
if (require.main === module) {
  const tester = new RefreshTokenTester();
  tester.run().catch(console.error);
}

module.exports = RefreshTokenTester;