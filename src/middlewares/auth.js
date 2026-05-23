const { verifyAccessToken } = require("@utils/JwtUtil");
const SessionValidator = require("@utils/sessionValidator");
const AccountMD = require("@models/authorization/Account.model");
const ApiPermission = require("@models/authorization/roleApi/ApiPermission.model");
const UserApiPermission = require("@models/authorization/roleApi/UserApiPermission.model");
const OrgService = require("../modules/_organization/org/service"); // 添加对机构服务的引用
const UserMD = require("@models/organization/structure/User.model");

// 认证中间件
exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.error('Authentication failed: 没有收到 authorization header', {
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      });

      return res.status(401).json({ code: 401, message: "需要权限认证" });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      console.error('Authentication failed: Invalid or expired token', {
        accountId: decoded ? decoded._id : 'unknown',
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      });

      return res.status(401).json({ message: "令牌无效或已过期" });
    }

    // Check if the session is still valid (prevent concurrent logins)
    // 检查会话是否有效
    const isSessionValid = await SessionValidator.isSessionValid(decoded);
    if (!isSessionValid) {
      console.error('Authentication failed: Session invalid or user logged out from another device', {
        accountId: decoded._id,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      });

      return res.status(401).json({ message: "会话已失效或已在其他设备登录，请重新登录" });
    }

    req.payload = decoded;

    next();
  } catch (error) {
    console.error('Authentication server error:', {
      message: error.message,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({ message: "authenticate 认证服务器错误" });
  }
};

// 学生 授权中间件
exports.studentAuthorize = (requiredRole) => async (req, res, next) => {
  try {
    const payload = req.payload;

    // 检查是否为学生类型账户
    if (payload.accountType !== 'Student') {
      console.error('Authorization failed: Account is not a Student type', {
        accountId: payload._id,
        accountType: payload.accountType,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      });

      return res.status(403).json({ message: "此操作仅限学生账户使用" });
    }

    // 检查学生账户所属的机构是否活跃
    // 学生可能直接关联到账户，但有时也可能间接关联到机构
    const user = await UserMD.findOne({ Account: payload._id });
    if (user) {
      // 如果学生通过用户关联到了机构，则检查该机构是否活跃
      const isOrgActive = await OrgService.isOrgActive(user.Org);
      if (!isOrgActive) {
        console.error('Organization is inactive for student account:', {
          userId: user._id,
          orgId: user.Org,
          accountId: payload._id,
          url: req.url,
          method: req.method,
          timestamp: new Date().toISOString()
        });

        return res.status(403).json({ message: "机构已被禁用，无法访问" });
      }
    }

    // 检查学生本身的活跃状态
    const account = await AccountMD.findById(payload._id);
    if (!account || !account.isActive) {
      return res.status(401).json({ message: "学生账号不存在或者被禁用" });
    }

    // 学生类型的账户，直接通过
    return next();
  } catch (error) {
    console.error('Student authorization server error:', {
      message: error.message,
      accountId: req.payload ? req.payload._id : 'unknown',
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    return res.status(500).json({ message: "studentAuthorize 认证服务器错误" });
  }
}

// 用户 授权中间件
exports.userAuthorize = (apiPermission) => async (req, res, next) => {
  try {
    const payload = req.payload;

    // 如果是管理员，直接通过
    if (payload.isAdmin) {
      return next();
    }

    const apiPath = apiPermission || req.originalUrl;
    const apiMethod = req.method;
    const apiPermissionDoc = await ApiPermission.findOne({ apiMethod, apiPath });
    if (!apiPermissionDoc) {
      return res.status(500).json({ message: `数据库中没有找到此路由的apiPermission数据，请联系管理员添加` });
    }

    const Account = await AccountMD.findById(payload._id)
      .populate('currentUser');

    if (!Account || !Account.isActive || Account.accountType !== 'User') {
      console.error('Authorization failed: User not found', {
        accountId: payload._id,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      });

      return res.status(401).json({ message: "账号不存在或者被禁用" });
    }
    const User = Account.currentUser;
    if (!User || !User.isActive) {
      console.error('Authorization failed: User document not found for account', {
        accountId: payload._id,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      });

      return res.status(401).json({ message: "账号当前对应的用户不存在或者被禁用" });
    }

    // 在这里添加机构状态检查
    const isOrgActive = await OrgService.isOrgActive(User.Org);
    if (!isOrgActive) {
      console.error('Organization is inactive for user account:', {
        userId: User._id,
        orgId: User.Org,
        accountId: payload._id,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      });

      return res.status(403).json({ message: "机构已被禁用，无法访问" });
    }

    const userApiPermission = await UserApiPermission.findOne({
      userId: User._id,
      apiPermissionId: apiPermissionDoc._id,
    });
    if (!userApiPermission) {
      console.error('Authorization failed: User lacks permission用户缺少权限', {
        accountId: payload._id,
        apiPath,
        apiMethod,
        timestamp: new Date().toISOString()
      });

      return res.status(401).json({ message: `此人没有访问此api的权限` });
    }

    payload.apiPermission = {
      range: userApiPermission.range,
      departmentIds: userApiPermission.departmentIds,
    }

    next();
  } catch (error) {
    console.error('Authorization server error:', {
      message: error.message,
      accountId: req.payload ? req.payload._id : 'unknown',
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    return res.status(500).json({ message: "authorize 认证服务器错误" });
  }
};