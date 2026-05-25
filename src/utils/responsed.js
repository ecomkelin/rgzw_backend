/**
 * 统一API响应格式
 * @class ApiResponse
 * @description 提供统一的API响应结构，确保前后端交互格式一致
 */
const NODE_ENV = process.env.NODE_ENV;
class ApiResponse {
  /**
   * 成功响应
   */
  static success(resData = {}) {
    const { data = {}, message = '操作成功' } = resData;
    if (NODE_ENV === 'production') message = '操作成功';
    return {
      code: 200,
      success: true,
      status: 'OK',
      message,
      data
    };
  }

  /**
   * 系统错误响应
   */
  static error_system(resData) {
    const { data = {}, message = '系统错误, 请联系管理员' } = resData;
    if (NODE_ENV === 'production') message = '系统错误, 请联系管理员';
    return {
      code: 500,
      success: false,
      status: 'System Error',
      message,
      data
    };
  }

  /**
   * 数据验证错误响应
   */
  static error_validation(resData = {}) {
    const { data = {}, message = '数据验证失败' } = resData;
    if (NODE_ENV === 'production') message = '数据验证失败';
    return {
      code: 400,
      success: false,
      status: 'Validation Error',
      message,
      data
    };
  }

  /**
   * 未授权错误响应
   */
  static error_unauthorized(resData = {}) {
    const { data = {}, message = '未授权访问' } = resData;
    if (NODE_ENV === 'production') message = '未授权访问';
    return {
      code: 401,
      success: false,
      status: 'Unauthorized Error',
      message,
      data
    };
  }

  /**
   * 无权限错误响应
   */
  static error_forbidden(resData = {}) {
    const { data = {}, message = '无权限访问' } = resData;
    if (NODE_ENV === 'production') message = '无权限访问';
    return {
      code: 403,
      success: false,
      status: 'Forbidden Error',
      message,
      data
    };
  }

  /**
   * 资源不存在错误响应
   */
  static error_notFound(resData = {}) {
    const { data = {}, message = '资源不存在' } = resData;
    if (NODE_ENV === 'production') message = '资源不存在';
    return {
      code: 404,
      success: false,
      status: 'NotFound Error',
      message,
      data
    };
  }

  /**
   * 
   * @param {*} resData 
   * @returns 
   */
  static error(obj) {
    if (!obj || !obj.code) {
      return this.error_system(obj);
    }
    switch (obj.code) {
      case 400:
        return this.error_validation(obj);
      case 401:
        return this.error_unauthorized(obj);
      case 403:
        return this.error_forbidden(obj);
      case 404:
        return this.error_notFound(obj);
      default:
        return this.error_system(obj);
    }
  }

}

module.exports = ApiResponse; 