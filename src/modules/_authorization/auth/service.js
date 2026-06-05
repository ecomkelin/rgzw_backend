const { AccountModel } = require('@models/authorization/Account.dao');
const { UserModel } = require('@models/organization/structure/User.dao');
const { StudentModel } = require('@models/school/student/Student.dao');
const UtilsJwt = require('@utils/JwtUtil');
const { payloadChecker } = require('@utils/payloadChecker');
const argon2 = require('argon2');
class LoginSV {
  // Generate a unique session ID for preventing concurrent logins
  generateSessionId = () => argon2.randomBytes(32).toString('hex');
  

  async login(code, password) {
    try {
      const Account = await AccountModel.findOne({ code: code.toUpperCase(), isActive: true })
        .select('+passwordHash')
        .populate([{ path: 'currentUser', select: 'nickname Org roleTemp' }, { path: 'currentStudent', select: 'name Org' }])
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
      const { accessToken, payload } = UtilsJwt.generateAccessToken(Account);
      const refreshToken = UtilsJwt.generateRefreshToken(Account._id, sessionId);
      const refreshTokenExpiresAt = UtilsJwt.generateExpiresAt();
      return { account: Account, payload, accessToken, refreshToken, refreshTokenExpiresAt, sessionId };
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
        .populate([{ path: 'currentUser', select: 'nickname Org roleTemp' }, { path: 'currentStudent', select: 'name Org' }]);

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

      const { accessToken, payload } = UtilsJwt.generateAccessToken(Account);
      const refreshToken = UtilsJwt.generateRefreshToken(Account._id, sessionId);
      const refreshTokenExpiresAt = UtilsJwt.generateExpiresAt();

      return { account: Account, payload, accessToken, refreshToken, refreshTokenExpiresAt, sessionId };
    } catch (e) {
      console.error('LoginSV refreshToken error:', e);
      throw e;
    }
  }

  async switchRole(payload, id) {
    try {
      payloadChecker(payload);

      const Account = await AccountModel.findById(payload._id)
        .select('+currentSessionId'); // 默认不给这个字段 要加上不然, 下次 refresh-token 就会失效

      if (!Account || !Account.isActive) {
        throw ({ code: 404, message: "账户不存在或者被禁用" });
      }

      if (payload.accountType === 'User') {
        const User = await UserModel.findById(id).select("nickname Org roleTemp isActive");
        if (!User || !User.isActive) {
          throw ({ code: 404, message: "此用户不存在或者被禁用" });
        }
        if (User.Account.toString() !== Account._id.toString()) {
          throw ({ code: 404, message: "此账号中不存在此用户" });
        }
        if (!Account.currentUser || Account.currentUser.toString() !== id.toString()) {
          Account.currentUser = id;
          await Account.save();
        }
        Account.currentUser = User;
      } else {
        const Student = await StudentModel.findById(id).select("Org name isActive");
        if (!Student || !Student.isActive) {
          throw ({ code: 404, message: "此学生不存在或者被禁用" });
        }
        if (Student.Account.toString() !== Account._id.toString()) {
          throw ({ code: 404, message: "此账号中不存在此学生" });
        }
        if (!Account.currentStudent || Account.currentStudent.toString() !== id.toString()) {
          Account.currentStudent = id;
          await Account.save();
        }
        if (Student.Org.toString() !== payload.currentStudent.Org.toString()) {
          console.warn(`[switchRole] 跨机构切换: Account=${Account.code}, from=${payload.currentStudent.Org} to=${Student.Org}`);
        }
        Account.currentStudent = Student;
      }

      // 切换身份后生成新的访问令牌和刷新令牌
      const { accessToken, payload: newPayload } = UtilsJwt.generateAccessToken(Account);
      const refreshToken = UtilsJwt.generateRefreshToken(Account._id, Account.currentSessionId);
      const refreshTokenExpiresAt = UtilsJwt.generateExpiresAt();

      return { account: Account, payload: newPayload, accessToken, refreshToken, refreshTokenExpiresAt, sessionId: Account.currentSessionId };
    } catch (e) {
      console.error('LoginSV switchRole error:', e);
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

const loginSv = new LoginSV();
// setTimeout(() => {
//   loginSv.login("ADMIN001", "Test1234@");
// }, 1000);
module.exports = loginSv;