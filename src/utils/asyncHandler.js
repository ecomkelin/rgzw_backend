/**
 * 异步路由处理器包装器
 * 用于简化 Express 异步路由中的错误处理
 * 避免在每个异步路由中都需要写 try-catch 块
 *
 * @param {Function} fn - 异步路由处理函数
 * @returns {Function} 包装后的路由处理函数
 */
const asyncHandler = (fn) => (req, res, next) => {
  // 将异步函数包装在 Promise 中，并将错误传递给 Express 错误处理中间件
  Promise.resolve(fn(req, res, next)).catch(err => {
    // 添加详细的错误日志记录
    console.error('Async handler error:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      userId: req.payload ? req.payload._id : 'unauthenticated',
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      params: req.params,
      query: req.query,
      body: req.body ? { ...req.body } : null // 避免记录敏感数据
    });

    // 为安全考虑，不向客户端暴露详细的错误信息
    if (process.env.NODE_ENV === 'production') {
      // 生产环境只返回通用错误信息
      res.status(500).json({
        code: 500,
        success: false,
        message: '服务器内部错误，请稍后再试',
        data: null
      });
    } else {
      // 开发环境返回详细错误信息
      next(err);
    }
  });
};

module.exports = asyncHandler;