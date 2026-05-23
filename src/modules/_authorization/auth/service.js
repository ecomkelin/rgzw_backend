const AccountMD = require('@models/authorization/Account.model');
const UtilsJwt = require('@utils/JwtUtil');

class LoginSV {
  // Generate a unique session ID for preventing concurrent logins
  generateSessionId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  getPayloadWithAccount = (Account) => {
    if (!Account) {
      throw new Error('Account object is required');
    }
    const payload = {
      _id: Account._id,
      accountType: Account.accountType,
      isAdmin: Account.isAdmin,
      sessionId: Account.currentSessionId,
    }
    return payload;
  }

  async login(code, password) {
    try {
      const Account = await AccountMD.findOne({ code: code.toUpperCase(), isActive: true })
        .select('+passwordHash');

      if (!Account) {
        throw new Error('用户不存在或已禁用');
      }

      const isMatch = await Account.comparePassword(password);
      if (!isMatch) {
        throw new Error('密码错误');
      }

      // 生成唯一的sessionId 防止多次登录 Generate a unique session ID for this login
      const sessionId = this.generateSessionId();
      // 设置新会话前 清除已经存在的 session
      // This ensures that the old session is invalidated
      if (Account.currentSessionId) {
        // The previous session will become invalid as soon as we update currentSessionId
      }
      Account.currentSessionId = sessionId;
      Account.lastLoginAt = new Date();
      await Account.save();

      // account user 组合生成 payload
      const payload = this.getPayloadWithAccount(Account);

      const accessToken = UtilsJwt.generateAccessToken(payload);
      const refreshToken = UtilsJwt.generateRefreshToken(Account._id, sessionId);
      const refreshTokenExpiresAt = UtilsJwt.generateExpiresAt();

      return { accessToken, account: Account, refreshToken, refreshTokenExpiresAt, sessionId };
    } catch (error) {
      console.error('LoginSV login error:', error.message);
      throw error;
    }
  }

  async refreshToken(refresh_current) {
    try {
      const decoded = UtilsJwt.verifyRefreshToken(refresh_current);
      if (!decoded) {
        throw new Error('无效的刷新令牌');
      }

      const Account = await AccountMD.findOne({ _id: decoded._id, isActive: true })
        .select('+currentSessionId')

      if (!Account) {
        throw new Error('用户不存在或已禁用');
      }

      if (Account.currentSessionId !== decoded.sessionId) {
        throw new Error('会话已过期，请重新登录');
      }

      // Generate new session ID to maintain current session
      const sessionId = this.generateSessionId();
      Account.currentSessionId = sessionId;
      await Account.save();

      const payload = this.getPayloadWithAccount(Account);

      const accessToken = UtilsJwt.generateAccessToken(payload);
      const refreshToken = UtilsJwt.generateRefreshToken(Account._id, sessionId);
      const refreshTokenExpiresAt = UtilsJwt.generateExpiresAt();

      return { accessToken, account: Account, refreshToken, refreshTokenExpiresAt, sessionId };
    } catch (error) {
      console.error('LoginSV refreshToken error:', error);
      throw error;
    }
  }

  async logout(_id, token) {
    try {
      const account = await AccountMD.findById(_id);
      if (!account) {
        return false;
      }

      await AccountMD.findByIdAndUpdate(_id, {
        $unset: {
          'currentSessionId': ""
        },
        $set: {
          'lastLogoutAt': new Date()
        }
      }, { new: true });

      return true;
    } catch (error) {
      console.error('LoginSV logout error:', error.message);
      throw error;
    }
  }

  /**
   * Force logout user from all devices
   * @param {string} _id - User account ID
   * @returns {Promise<boolean>} Success status
   */
  async forceLogoutAllDevices(_id) {
    try {
      const account = await AccountMD.findById(_id);
      if (!account) {
        return false;
      }

      // Clear all session-related data to force logout from all devices
      await AccountMD.findByIdAndUpdate(_id, {
        $unset: {
          'currentSessionId': ""
        },
        $set: {
          'lastLogoutAt': new Date()
        }
      }, { new: true });

      return true;
    } catch (error) {
      console.error('LoginSV forceLogoutAllDevices error:', error.message);
      throw error;
    }
  }

}

module.exports = new LoginSV(); 