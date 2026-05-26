/**
 * 统一API响应格式工具类
 * 提供标准化的API响应结构，确保前后端交互格式一致
 */
const NODE_ENV = process.env.NODE_ENV;

class ApiResponse {
  /**
   * 成功响应
   * @param {Object} resData - 响应数据
   * @param {Object} resData.data - 响应的具体数据，默认为 {}
   * @param {string} resData.message - 响应消息，默认为 '操作成功'
   * @returns {Object} 标准化的成功响应对象
   */
  static success(resData = {}) {
    const { data = {}, message = '操作成功' } = resData;

    // 生产环境下隐藏具体消息内容，避免泄露系统信息
    const displayMessage = NODE_ENV === 'production' ? '操作成功' : message;

    return {
      code: 200,
      success: true,
      status: 'OK',
      message: displayMessage,
      data
    };
  }

  /**
   * 系统错误响应
   * @param {Object} resData - 响应数据
   * @param {Object} resData.data - 响应的具体数据，默认为 {}
   * @param {string} resData.message - 响应消息，默认为 '系统错误, 请联系管理员'
   * @returns {Object} 标准化的系统错误响应对象
   */
  static error_system(resData) {
    const { data = {}, message = '系统错误, 请联系管理员' } = resData;

    // 生产环境下隐藏具体错误消息，避免泄露系统信息
    const displayMessage = NODE_ENV === 'production' ? '系统错误, 请联系管理员' : message;

    return {
      code: 500,
      success: false,
      status: 'System Error',
      message: displayMessage,
      data
    };
  }

  /**
   * 数据验证错误响应
   * @param {Object} resData - 响应数据
   * @param {Object} resData.data - 响应的具体数据，默认为 {}
   * @param {string} resData.message - 响应消息，默认为 '数据验证失败'
   * @returns {Object} 标准化的数据验证错误响应对象
   */
  static error_validation(resData = {}) {
    const { data = {}, message = '数据验证失败' } = resData;

    // 生产环境下隐藏具体错误消息，避免泄露系统信息
    const displayMessage = NODE_ENV === 'production' ? '数据验证失败' : message;

    return {
      code: 400,
      success: false,
      status: 'Validation Error',
      message: displayMessage,
      data
    };
  }

  /**
   * 未授权错误响应
   * @param {Object} resData - 响应数据
   * @param {Object} resData.data - 响应的具体数据，默认为 {}
   * @param {string} resData.message - 响应消息，默认为 '未授权访问'
   * @returns {Object} 标准化的未授权错误响应对象
   */
  static error_unauthorized(resData = {}) {
    const { data = {}, message = '未授权访问' } = resData;

    // 生产环境下隐藏具体错误消息，避免泄露系统信息
    const displayMessage = NODE_ENV === 'production' ? '未授权访问' : message;

    return {
      code: 401,
      success: false,
      status: 'Unauthorized Error',
      message: displayMessage,
      data
    };
  }

  /**
   * 无权限错误响应
   * @param {Object} resData - 响应数据
   * @param {Object} resData.data - 响应的具体数据，默认为 {}
   * @param {string} resData.message - 响应消息，默认为 '无权限访问'
   * @returns {Object} 标准化的无权限错误响应对象
   */
  static error_forbidden(resData = {}) {
    const { data = {}, message = '无权限访问' } = resData;

    // 生产环境下隐藏具体错误消息，避免泄露系统信息
    const displayMessage = NODE_ENV === 'production' ? '无权限访问' : message;

    return {
      code: 403,
      success: false,
      status: 'Forbidden Error',
      message: displayMessage,
      data
    };
  }

  /**
   * 资源不存在错误响应
   * @param {Object} resData - 响应数据
   * @param {Object} resData.data - 响应的具体数据，默认为 {}
   * @param {string} resData.message - 响应消息，默认为 '资源不存在'
   * @returns {Object} 标准化的资源不存在错误响应对象
   */
  static error_notFound(resData = {}) {
    const { data = {}, message = '资源不存在' } = resData;

    // 生产环境下隐藏具体错误消息，避免泄露系统信息
    const displayMessage = NODE_ENV === 'production' ? '资源不存在' : message;

    return {
      code: 404,
      success: false,
      status: 'NotFound Error',
      message: displayMessage,
      data
    };
  }

  /**
   * 重复错误响应 (对应MongoDB错误码11000)
   * @param {Object} resData - 响应数据
   * @param {Object} resData.data - 响应的具体数据，默认为 {}
   * @param {string} resData.message - 响应消息，默认为 '资源重复'
   * @returns {Object} 标准化的重复错误响应对象
   */
  static error_duplication(resData = {}) {
    const { data = {}, message = '资源重复' } = resData;

    // 生产环境下隐藏具体错误消息，避免泄露系统信息
    const displayMessage = NODE_ENV === 'production' ? '资源重复' : message;

    return {
      code: 404, // 使用404而不是特殊错误码，避免暴露数据库细节
      success: false,
      status: 'Resource duplication Error',
      message: displayMessage,
      data
    };
  }

  /**
   * 通用错误处理函数
   * 根据错误代码选择合适的错误响应格式
   * @param {Object} obj - 错误对象，必须包含 code 属性
   * @returns {Object} 标准化的错误响应对象
   */
  static error(obj) {
    if (!obj || !obj.code) {
      // 如果错误对象没有 code 属性，视为系统错误
      return this.error_system(obj);
    }

    // 根据错误代码返回相应的错误响应格式
    switch (obj.code) {
      case 400:
        return this.error_validation(obj);
      case 401:
        return this.error_unauthorized(obj);
      case 403:
        return this.error_forbidden(obj);
      case 404:
        return this.error_notFound(obj);
      case 11000:
        return this.error_duplication(obj);
      default:
        // 默认视为系统错误
        return this.error_system(obj);
    }
  }
}

module.exports = ApiResponse; 