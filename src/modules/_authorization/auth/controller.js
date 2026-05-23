const AuthSV = require('./service');
const { validationResult } = require('express-validator');
const ApiResponse = require('../../../utils/response');
const asyncHandler = require('../../../utils/asyncHandler');

class LoginCT {
  authorizationRes(res, { account, accessToken, refreshToken, refreshTokenExpiresAt }) {
    // 设置 HttpOnly 的 Refresh Token Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      expires: refreshTokenExpiresAt,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30天
    });
    // 构建返回的认证数据
    res.json(ApiResponse.success({
      accessToken,
      account
    }));
  }
  // 用户登录
  login = asyncHandler(async (req, res, next) => {
    try {
      const { code, password } = req.body;
      const authResRtData = await AuthSV.login(code, password);
      return this.authorizationRes(res, authResRtData);
    } catch (error) {
      console.error('LoginCT login error:', error.message);
      // 处理特定的认证错误
      if (error.message.includes('用户不存在') || error.message.includes('密码错误')) {
        return res.status(401).json(ApiResponse.unauthorizedError(error.message));
      }
      // 其他错误返回服务器错误
      return res.status(500).json(ApiResponse.serverError());
    }
  });

  // 刷新访问令牌
  refreshToken = asyncHandler(async (req, res, next) => {
    try {
      // 1. 从 Cookie 中获取 refreshToken
      let refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ message: 'refreshToken 不存在，请重新登录' });
      }

      const authResRtData = await AuthSV.refreshToken(refreshToken);
      return this.authorizationRes(res, authResRtData);
    } catch (error) {
      console.error('LoginCT refreshToken error:', error.message);

      // 处理特定的刷新令牌错误
      if (error.message.includes('无效的刷新令牌')) {
        return res.status(401).json(ApiResponse.unauthorizedError(error.message));
      }

      // 其他错误返回服务器错误
      return res.status(500).json(ApiResponse.serverError());
    }
  });

  // 登出
  logout = asyncHandler(async (req, res) => {
    try {
      const result = await AuthSV.logout(req.payload._id, req.token);
      if (!result) {
        res.status(400).json(ApiResponse.error('退出失败'));
        return;
      }
      res.json(ApiResponse.success(null, '登出成功'));
    } catch (error) {
      console.error('LoginCT logout error:', error.message);
      return res.status(500).json(ApiResponse.serverError())
    }
  });

}

module.exports = new LoginCT(); 