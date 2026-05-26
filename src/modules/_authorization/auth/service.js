const { AccountModel } = require('@models/authorization/Account.dao');
const UtilsJwt = require('@utils/JwtUtil');

class LoginSV {
  // Generate a unique session ID for preventing concurrent logins
  generateSessionId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }


  async login(code, password) {
    try {
      const Account = await AccountModel.findOne({ code: code.toUpperCase(), isActive: true })
        .select('+passwordHash');

      if (!Account) {
        throw ({ code: 400, message: '用户不存在或已禁用' });
      }

      const isMatch = await Account.comparePassword(password);
      if (!isMatch) {
        throw ({ code: 400, message: '密码错误' });
      }

      // 生成唯一的sessionId 防止多次登录 Generate a unique session ID for this login
      const sessionId = this.generateSessionId();
      // 设置新会话前 清除已经存在的 session
      if (Account.currentSessionId) {
        // The previous session will become invalid as soon as we update currentSessionId
      }
      Account.currentSessionId = sessionId;
      Account.lastLoginAt = new Date();
      await Account.save();

      // account user 组合生成 payload

      const accessToken = UtilsJwt.generateAccessToken(Account);
      const refreshToken = UtilsJwt.generateRefreshToken(Account._id, sessionId);
      const refreshTokenExpiresAt = UtilsJwt.generateExpiresAt();

      return { accessToken, account: Account, refreshToken, refreshTokenExpiresAt, sessionId };
    } catch (e) {
      console.error('LoginSV login error:', e);
      throw e;
    }
  }

  async refreshToken(refresh_current) {
    try {
      const decoded = UtilsJwt.verifyRefreshToken(refresh_current);
      if (!decoded) {
        throw ({ code: 401, message: '无效的刷新令牌' });
      }

      const Account = await AccountModel.findOne({ _id: decoded._id, isActive: true })
        .select('+currentSessionId')

      if (!Account) {
        throw ({ code: 400, message: '用户不存在或已禁用' });
      }

      if (Account.currentSessionId !== decoded.sessionId) {
        throw ({ code: 400, message: '会话已过期，请重新登录' });
      }

      // Generate new session ID to maintain current session
      const sessionId = this.generateSessionId();
      Account.currentSessionId = sessionId;
      await Account.save();

      const accessToken = UtilsJwt.generateAccessToken(Account);
      const refreshToken = UtilsJwt.generateRefreshToken(Account._id, sessionId);
      const refreshTokenExpiresAt = UtilsJwt.generateExpiresAt();

      return { accessToken, account: Account, refreshToken, refreshTokenExpiresAt, sessionId };
    } catch (e) {
      console.error('LoginSV refreshToken error:', error);
      throw e;
    }
  }

  async logout(payload) {
    try {
      const { _id } = payload;
      const account = await AccountModel.findById(_id);
      if (!account) {
        return false;
      }

      await AccountModel.findByIdAndUpdate(_id, {
        $unset: {
          'currentSessionId': ""
        },
        $set: {
          'lastLogoutAt': new Date()
        }
      }, { new: true });

      return true;
    } catch (e) {
      console.error('LoginSV logout error:', e);
      throw e;
    }
  }

  /**
   * Force logout user from all devices
   * @param {string} _id - User account ID
   * @returns {Promise<boolean>} Success status
   */
  async forceLogoutAllDevices(_id) {
    try {
      const account = await AccountModel.findById(_id);
      if (!account) {
        return false;
      }

      // Clear all session-related data to force logout from all devices
      await AccountModel.findByIdAndUpdate(_id, {
        $unset: {
          'currentSessionId': ""
        },
        $set: {
          'lastLogoutAt': new Date()
        }
      }, { new: true });

      return true;
    } catch (e) {
      console.error('LoginSV forceLogoutAllDevices error:', e);
      throw e;
    }
  }

}

module.exports = new LoginSV(); 