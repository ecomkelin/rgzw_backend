const ApiResponse = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Mongoose验证错误
  if (err.name === 'ValidationError') {
    const errors = {};
    for (let field in err.errors) {
      errors[field] = err.errors[field].message;
    }
    return res.status(400).json(ApiResponse.validationError('数据验证失败', errors));
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(ApiResponse.unauthorizedError('无效的令牌'));
  }

  // JWT 过期错误
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(ApiResponse.unauthorizedError('令牌已过期'));
  }

  // MongoDB 重复键错误
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json(ApiResponse.validationError(`${field} 已存在`));
  }

  // 未授权错误
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json(ApiResponse.unauthorizedError('未授权访问'));
  }

  // 自定义业务错误
  if (err.type === 'BusinessError') {
    return res.status(err.statusCode || 400).json(ApiResponse.error(err.message, err.data, err.statusCode));
  }

  // 默认500错误
  res.status(500).json(ApiResponse.serverError());
};

module.exports = errorHandler; 