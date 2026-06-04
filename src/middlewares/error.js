const ApiResponse = require('../utils/response');

/**
 * 全局错误处理中间件
 * 统一处理应用程序中的错误，返回标准化的错误响应
 *
 * @param {Object} e - 错误对象
 * @param {Object} req - HTTP请求对象
 * @param {Object} res - HTTP响应对象
 * @param {Function} next - 下一个中间件函数
 */
const errorHandler = (e, req, res) => {
  // 记录错误详细信息，便于调试和监控
  console.error('全局错误处理详情:', {
    message: e.message,
    stack: e.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  const statusCode = e.code || 500;
  // 使用 ApiResponse.error 方法统一处理错误响应
  // 该方法会根据错误代码返回相应的标准格式响应
  res.status(statusCode).json(ApiResponse.error(e));
};

module.exports = errorHandler;