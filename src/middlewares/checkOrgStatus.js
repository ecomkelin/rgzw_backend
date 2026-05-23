const OrgService = require('../modules/_organization/org/service');
const UserMD = require('@models/organization/structure/User.model');
const AccountMD = require('@models/authorization/Account.model');
const ApiResponse = require('../utils/response');

// 机构状态检查中间件
exports.checkOrgStatus = async (req, res, next) => {
  try {
    const payload = req.payload;

    if (!payload) {
      return res.status(401).json(ApiResponse.unauthorizedError("认证失败"));
    }

    // 管理员可以跳过机构状态检查
    if (payload.isAdmin) {
      return next();
    }

    // 普通用户需要检查其机构是否活跃
    const user = await UserMD.findOne({ Account: payload._id });
    if (!user) {
      return res.status(401).json(ApiResponse.unauthorizedError("用户未找到"));
    }

    const isOrgActive = await OrgService.isOrgActive(user.Org);
    if (!isOrgActive) {
      console.error('Organization is inactive:', {
        userId: user._id,
        orgId: user.Org,
        accountId: payload._id,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      });

      return res.status(403).json(ApiResponse.forbiddenError("机构已被禁用，无法访问"));
    }

    next();
  } catch (error) {
    console.error('Check org status error:', {
      message: error.message,
      accountId: req.payload ? req.payload._id : 'unknown',
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    return res.status(500).json(ApiResponse.serverError("机构状态检查服务器错误"));
  }
};