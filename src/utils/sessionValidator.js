const AccountMD = require('../models/authorization/Account.model');

/**
 * 会话验证工具类
 * 用于验证用户的会话状态，防止并发登录
 */
class SessionValidator {
  /**
   * 验证用户会话是否有效
   * @param {Object} decoded - 解码后的令牌信息，包含用户ID等信息
   * @returns {Promise<boolean>} 会话是否有效
   */
  static async isSessionValid(decoded) {
    if (!decoded || !decoded._id) {
      return false;
    }

    try {
      const account = await AccountMD.findById(decoded._id).select("+currentSessionId");

      // 会话有效的条件：账户存在且有currentSessionId（表示当前有活跃会话）
      return !!(account && account.currentSessionId === decoded.sessionId);
    } catch (error) {
      console.error('Session validation error:', error.message);
      return false;
    }
  }

  /**
   * 检查是否有其他活跃会话
   * @param {string} accountId - 用户账户ID
   * @param {string} currentSessionId - 当前会话ID
   * @returns {Promise<boolean>} 是否存在其他活跃会话
   */
  static async hasOtherActiveSession(accountId, currentSessionId) {
    if (!accountId || !currentSessionId) {
      return true; // 如果缺少参数，视为有其他活跃会话（安全起见）
    }

    try {
      const account = await AccountMD.findById(accountId).select("+currentSessionId");

      // 检查当前存储的会话ID是否与传入的会话ID一致
      return !!(account && account.currentSessionId && account.currentSessionId !== currentSessionId);
    } catch (error) {
      console.error('Session comparison error:', error.message);
      return true; // 发生错误时，保守地认为有其他活跃会话
    }
  }

  /**
   * 清除用户的所有会话
   * @param {string} accountId - 用户账户ID
   * @returns {Promise<boolean>} 是否清除成功
   */
  static async clearUserSession(accountId) {
    if (!accountId) {
      return false;
    }

    try {
      const result = await AccountMD.findByIdAndUpdate(
        accountId,
        { $unset: { currentSessionId: "" } },
        { new: true }
      );

      return !!result;
    } catch (error) {
      console.error('Clear session error:', error.message);
      return false;
    }
  }
}

module.exports = SessionValidator;