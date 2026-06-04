const AuthSV = require('./service');
const ApiResponse = require('@utils/response');

class LoginCT {
  authorizationRes(res, { account, payload, accessToken, refreshToken, refreshTokenExpiresAt }) {
    // 设置 HttpOnly 的 Refresh Token Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      expires: refreshTokenExpiresAt,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30天
    });
    // 构建返回的认证数据
    res.status(200).json(ApiResponse.success({
      data: {
        accessToken,
        payload,
        account
      }
    }));
  }
  // 用户登录
  login = async (req, res) => {
    try {
      const { code, password } = req.validData || {};
      const authResRtData = await AuthSV.login(code, password);

      return this.authorizationRes(res, authResRtData);
    } catch (e) {
      console.error("LoginCT login error:", e);
      return res.json(ApiResponse.error(e));
    }
  };

  // 刷新访问令牌
  refreshToken = async (req, res, next) => {
    try {
      // 1. 从 Cookie 中获取 refreshToken
      let refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        throw ({ code: 401, message: 'refreshToken 不存在，请重新登录' })
      }

      const authResRtData = await AuthSV.refreshToken(refreshToken);

      return this.authorizationRes(res, authResRtData);
    } catch (e) {
      console.error("LoginCT refreshToken error:", e);
      return res.json(ApiResponse.error(e))
    }
  };

  // 登出
  logout = async (req, res) => {
    try {
      const result = await AuthSV.logout(req.payload);
      if (!result) {
        throw ({ code: 400, message: "退出失败" })
      }
      return res.status(200).json(ApiResponse.success({ message: "成功退出" }));
    } catch (e) {
      console.error('LoginCT logout error:', e);
      return res.json(ApiResponse.error(e))
    }
  };

}

module.exports = new LoginCT(); 