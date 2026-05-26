const jwt = require('jsonwebtoken');

/**
 * JWT工具类
 * 用于处理令牌的生成、验证等操作
 */
class JwtUtil {
  /**
   * 生成访问令牌
   * @param {Object} Account - 令牌载荷
   * @returns {string} 访问令牌
   */
  static generateAccessToken(Account) {
    // 生成访问令牌，默认5分钟
    const payload = {
      _id: Account._id,
      accountType: Account.accountType,
      isAdmin: Account.isAdmin,
      sessionId: Account.currentSessionId,
    }

    const expiresIn = process.env.ACCESS_TOKEN_EXPIRED || '5m';
    try {
      return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn });
    } catch (e) {
      console.error('Error generating access token:', e);
      throw e;
    }
  }

  /**
   * 生成刷新令牌
   * @param {Object} payload - 令牌载荷
   * @returns {string} 刷新令牌
   */
  static generateRefreshToken(_id, sessionId) {
    // 生成刷新令牌，默认7天
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRED || '7d';
    return jwt.sign({ _id, sessionId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn });
  }

  /**
   * 计算刷新令牌过期时间
   * @returns {Date} 过期时间
   */
  static generateExpiresAt() {
    // 计算刷新令牌过期时间，默认7天后
    const refreshTokenExpiresAt = new Date();
    const daysToAdd = parseInt(process.env.REFRESH_TOKEN_DAYS || '7', 10);
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + daysToAdd);
    return refreshTokenExpiresAt;
  }

  /**
   * 验证访问令牌
   * @param {string} token - 访问令牌
   * @returns {Object|null} 解码后的载荷或null
   */
  static verifyAccessToken(token) {
    try {
      if (!token) throw ({ code: 400, message: "请传递token" });

      return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (e) {
      console.error('Access token verification error:', e);
      throw e
    }
  }

  /**
   * 验证刷新令牌
   * @param {string} refreshToken - 刷新令牌
   * @returns {Object|null} 解码后的载荷或null
   */
  static verifyRefreshToken(refreshToken) {
    try {
      if (!refreshToken) throw ({ code: 400, message: "请传递 refreshToken" });

      return jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (e) {
      console.error('Refresh token verification error:', e);
      throw e
    }
  }

}

module.exports = JwtUtil;