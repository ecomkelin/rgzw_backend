const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan'); // 日志中间件
const errorHandler = require('./middlewares/error');
const monitorMiddleware = require('./middlewares/monitor');
const { validateEnvironmentVariables, DEFAULT_REQUIRED_VARS } = require('./utils/envValidator');
require('dotenv').config();

// 注册模块别名 @models 指向 src/models
// 在任何情况下都注册，包括测试环境
require('module-alias/register');

// 验证必需的环境变量
validateEnvironmentVariables(DEFAULT_REQUIRED_VARS);

// 注意：下面的 demo.js() 似乎是测试代码，如果不需要可以移除
try {
  require('./demo.js')(); // 引入测试代码
} catch (e) {
  console.warn('警告：demo.js 执行失败', e);
}

const app = express();

// 中间件配置
app.use(cookieParser());
app.use(cors({
  // 核心：生产环境精准限制，非生产环境放行所有
  origin: process.env.NODE_ENV === 'production'
    ? (origin, callback) => { // 生产环境支持多个域名（可选）
      const allowedOrigins = ['https://rgzw.com', 'https://admin.rgzw.com'];
      const isAllowed = allowedOrigins.includes(origin);
      callback(null, isAllowed ? origin : false);
    }
    : true, // 非生产环境放行所有域名
  credentials: true, // 全局开启，保证 Cookie 跨域携带（核心）
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // 补充常用的 PATCH 方法
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'] // 扩展常用请求头
}));
app.use(express.json());
app.use(morgan('dev')); // 使用morgan记录请求日志
app.use(monitorMiddleware);

// 添加健康检查端点
app.get('/', (req, res) => {
  res.status(200).json({
    code: 200,
    message: '服务器运行正常, /api 查看接口文档',
    uptime: process.uptime()
  });
});

// 数据库连接
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.info('MongoDB连接成功'))
    .catch((err) => console.error('MongoDB连接失败:', err));
}

// 引入路由索引
const routes = require('./routers');

// 使用API路由
app.use('/api', routes);

// 统一错误处理
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
let server;

// 只在非测试环境启动服务器
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.info('环境变量:', process.env.NODE_ENV, process.env.MONGODB_URI);
    console.info(`服务器运行在端口 ${PORT}`);

  });
}

// 导出 app 用于测试
module.exports = { app, server };