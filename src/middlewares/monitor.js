const responseTime = require('response-time');

const monitorMiddleware = responseTime((req, res, time) => {
  if (time > 500) { // 如果响应时间超过500ms，记录警告
    console.warn(`Slow request: ${req.method} ${req.url} - ${time}ms`);
  }
});

module.exports = monitorMiddleware; 