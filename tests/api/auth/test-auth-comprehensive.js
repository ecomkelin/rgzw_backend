/**
 * 认证API接口综合测试文件
 * 测试内容: 登录、刷新令牌、登出接口
 * 执行命令: node tests/api/auth/test-auth-comprehensive.js
 */

const LoginTester = require('./test-login');
const RefreshTokenTester = require('./test-refresh-token');
const LogoutTester = require('./test-logout');

const axios = require('axios');
const { wrapper: axiosCookieJarSupport } = require('axios-cookiejar-support');
const toughCookie = require('tough-cookie');

class AuthComprehensiveTester {
  constructor() {
    // Create a cookie jar to handle cookies across requests
    this.cookieJar = new toughCookie.CookieJar();

    this.BASE_URL = 'http://localhost:8000/api/auth';
    this.client = axiosCookieJarSupport(axios.create({
      baseURL: this.BASE_URL,
      withCredentials: true,
      jar: this.cookieJar, // Use the cookie jar
      headers: {
        'Content-Type': 'application/json'
      }
    }));
    this.accessToken = null;
    this.refreshToken = null;
  }

  async testCompleteFlow() {
    console.log('🚀 开始完整认证流程测试...\n');

    // 1. 测试登录
    const loginTester = new LoginTester();
    const loginResult = await loginTester.run();

    if (!loginResult.success) {
      console.log('\n❌ 登录失败，无法继续完整流程测试');
      return { overallSuccess: false, results: { login: loginResult } };
    }

    // 提取令牌用于后续测试
    this.extractTokens(loginResult);

    // 2. 测试刷新令牌
    const refreshTokenResult = await this.testRefreshWithValidToken();

    // 3. 测试登出
    const logoutResult = await this.testLogoutWithValidToken();

    const results = {
      login: loginResult,
      refreshToken: refreshTokenResult,
      logout: logoutResult
    };

    const overallSuccess = loginResult.success &&
                          refreshTokenResult.success &&
                          logoutResult.success;

    console.log('\n📊 综合测试结果:');
    console.log(`   登录: ${loginResult.success ? '✅' : '❌'}`);
    console.log(`   刷新令牌: ${refreshTokenResult.success ? '✅' : '❌'}`);
    console.log(`   登出: ${logoutResult.success ? '✅' : '❌'}`);
    console.log(`   总体: ${overallSuccess ? '✅ 全部通过' : '❌ 部分失败'}`);

    return { overallSuccess, results };
  }

  extractTokens(loginResult) {
    // 从响应中提取访问令牌
    this.accessToken = loginResult.data?.data?.accessToken;

    // 从cookie头中提取刷新令牌并手动 add 到 cookie jar
    const setCookieHeaders = loginResult.cookies; // Changed from loginResult.data.headers
    if (setCookieHeaders) {
      const refreshTokenCookie = setCookieHeaders.find(cookie => cookie.startsWith('refreshToken='));
      if (refreshTokenCookie) {
        this.refreshToken = refreshTokenCookie.split(';')[0].split('=')[1];
        console.log('   成功提取刷新令牌:', this.refreshToken.substring(0, 10) + '...'); // 显示前10个字符作为确认

        // 手动将 cookie 添加到 cookie jar
        try {
          const cookie = toughCookie.Cookie.parse(refreshTokenCookie);
          if (cookie) {
            this.cookieJar.setCookie(cookie, this.BASE_URL).catch(err => {
              console.error('Failed to set cookie in jar:', err.message);
            });
          }
        } catch (err) {
          console.error('Error parsing cookie:', err.message);
        }
      }
    }
  }

  async testRefreshWithValidToken() {
    console.log('\n🔄 使用有效令牌测试刷新令牌...');

    try {
      const response = await this.client.get('/refresh-token');

      console.log('✅ 刷新令牌成功');
      console.log('   状态码:', response.status);

      // 更新令牌（如果刷新成功）
      if (response.data?.data?.accessToken) {
        this.accessToken = response.data.data.accessToken;
      }

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('ℹ️  刷新令牌失败（预期）: refreshToken 无效或过期');
        return {
          success: false,
          error: 'Invalid or expired refreshToken',
          isExpected: true
        };
      } else {
        console.error('❌ 刷新令牌失败:', error.response?.data || error.message);
        return {
          success: false,
          error: error.response?.data || error.message
        };
      }
    }
  }

  async testLogoutWithValidToken() {
    console.log('\n🚪 使用有效令牌测试登出...');

    try {
      // 设置认证头
      this.client.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;

      const response = await this.client.get('/logout');

      console.log('✅ 登出成功');
      console.log('   状态码:', response.status);

      // 清除认证头
      delete this.client.defaults.headers.common['Authorization'];

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('ℹ️  登出失败（预期）: access token 无效');
        return {
          success: false,
          error: 'Invalid access token',
          isExpected: true
        };
      } else {
        console.error('❌ 登出失败:', error.response?.data || error.message);
        return {
          success: false,
          error: error.response?.data || error.message
        };
      }
    }
  }

  async run() {
    return await this.testCompleteFlow();
  }
}

// 执行测试
if (require.main === module) {
  const tester = new AuthComprehensiveTester();
  tester.run().catch(console.error);
}

module.exports = AuthComprehensiveTester;