const jwt = require('jsonwebtoken');
const User = require('@models/User');

// 生成测试用的认证令牌
const generateTestToken = (userData) => {
  return jwt.sign(
    { 
      userId: userData._id,
      role: userData.role,
      permissions: userData.permissions || ['user:read', 'user:write', 'product:read', 'product:write']
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// 创建测试用户
const createTestUser = async (data = {}) => {
  const defaultData = {
    code: 'TEST' + Date.now(),
    password: 'password123',
    name: '测试用户',
    role: 'manager',
    status: 'active'
  };

  return await User.create({ ...defaultData, ...data });
};

// 创建测试管理员
const createTestAdmin = async (data = {}) => {
  const defaultData = {
    code: 'ADMIN' + Date.now(),
    password: 'admin123',
    name: '测试管理员',
    role: 'admin',
    status: 'active',
    permissions: ['user:read', 'user:write']
  };

  return await User.create({ ...defaultData, ...data });
};

// 清理测试数据
const clearTestData = async () => {
  await User.deleteMany({});
};

// 模拟认证中间件
const mockAuthMiddleware = {
  authenticate: (req, res, next) => {
    req.user = { 
      _id: 'test-user-id',
      permissions: ['user:read', 'user:write']
    };
    next();
  },
  authorize: (permission) => (req, res, next) => {
    if (req.user?.permissions?.includes(permission)) {
      next();
    } else {
      res.status(403).json({ message: '没有权限' });
    }
  }
};

module.exports = {
  generateTestToken,
  createTestUser,
  createTestAdmin,
  clearTestData,
  mockAuthMiddleware
}; 