/**
 * 统一API响应格式
 * @class ApiResponse
 * @description 提供统一的API响应结构，确保前后端交互格式一致
 */
class ApiResponse {
  /**
   * 成功响应
   * @param {*} data - 返回的数据
   * @param {string} message - 响应消息
   * @returns {Object} 标准响应对象
   */
  static success(data = null, message = '操作成功') {
    return {
      code: 200,
      success: true,
      status: 'OK',
      message,
      data
    };
  }

  /**
   * 通用错误响应
   * @param {string} message - 错误消息
   * @param {*} data - 错误数据
   * @param {number} code - HTTP状态码
   * @returns {Object} 标准错误响应对象
   */
  static error(message = '操作失败', data = null, code = 500) {
    return {
      code,
      success: false,
      message,
      data
    };
  }

  /**
   * 数据验证错误响应
   * @param {string} message - 错误消息
   * @param {*} data - 验证错误详情
   * @returns {Object} 错误响应对象
   */
  static validationError(message = '数据验证失败', data = null) {
    return this.error(message, data, 400);
  }

  /**
   * 未授权错误响应
   * @param {string} message - 错误消息
   * @returns {Object} 错误响应对象
   */
  static unauthorizedError(message = '未授权访问') {
    return this.error(message, null, 401);
  }

  /**
   * 无权限错误响应
   * @param {string} message - 错误消息
   * @returns {Object} 错误响应对象
   */
  static forbiddenError(message = '无权限访问') {
    return this.error(message, null, 403);
  }

  /**
   * 资源不存在错误响应
   * @param {string} message - 错误消息
   * @returns {Object} 错误响应对象
   */
  static notFoundError(message = '资源不存在') {
    return this.error(message, null, 404);
  }

  /**
   * 服务器内部错误响应
   * @param {string} message - 错误消息
   * @returns {Object} 错误响应对象
   */
  static serverError(message = '服务器内部错误') {
    return this.error(message, null, 500);
  }
}

module.exports = ApiResponse; 