const ApiResponse = require('../utils/response');

const errorHandler = (e, req, res, next) => {
  console.error('Error details:', {
    message: e.message,
    stack: e.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // 默认500错误
  res.json(ApiResponse.error(e));
};

module.exports = errorHandler; 