const ApiResponse = require('../utils/response');

// ✅ 正确：必须是 (err, req, res, next)
const errorHandler = (err, req, res, next) => {
  // 防止重复响应
  if (res.headersSent) {
    return next(err);
  }

  console.error('全局错误：', err.message);

  const statusCode = err.code || 500;

  // 现在 res 是真正的响应对象
  res.status(statusCode).json(ApiResponse.error(err));
};

module.exports = errorHandler;