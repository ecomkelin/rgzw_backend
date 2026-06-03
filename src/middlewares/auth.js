const { verifyAccessToken } = require("@utils/JwtUtil");
const { AccountModel } = require("@models/authorization/Account.dao");
const ApiPermission = require("@/models/authorization/__roleApi/ApiPermission.model");
const UserApiPermission = require("@/models/authorization/__roleApi/UserApiPermission.model");
const { OrgModel } = require("@models/organization/structure/Org.dao"); // 添加对机构服务的引用
const { UserModel } = require("@models/organization/structure/User.dao");
const { StudentModel } = require("@/models/school/student/Student.dao");

/**
 * 认证中间件
 * 验证用户的访问令牌，确保请求来自已认证的用户
 */
exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ code: 401, message: "需要权限认证" });
    }

    // 解析 Bearer Token 格式的访问令牌
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

    // 验证并解码访问令牌
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "令牌无效或已过期" });
    }

    // 从数据库获取账户信息
    const Account = await AccountModel.findById(decoded._id);
    if (!Account || !Account.isActive) {
      return res.status(401).json({ message: "账号不存在或者被禁用" });
    }

    // 检查会话是否有效（防止并发登录）
    if (Account.currentSessionId !== decoded.sessionId) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(401).json({ message: "会话已失效或已在其他设备登录，请重新登录" });
      } else {
        console.warn(`会话ID不匹配, 账户 ${Account.code}。期望 ${Account.currentSessionId}，获得 ${decoded.sessionId}`);
      }
    }

    // 将用户身份信息附加到请求对象
    req.payload = { ...decoded };

    // 根据账户类型设置相应的目标用户/学生信息
    if (Account.accountType === 'User') {
      req.payload.currentUser = { _id: Account.currentUser };
    } else if (Account.accountType === 'Student') {
      req.payload.currentStudent = { _id: Account.currentStudent };
    } else {
      return res.status(401).json({ message: "账号类型无效" });
    }
    next();
  } catch (error) {
    console.error('认证服务器错误详情:', {
      message: error.message,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({ message: "authenticate 认证服务器错误" });
  }
};

/**
 * 学生授权中间件
 * 验证用户是否为学生账户类型并具备相应权限
 * @param {string} requiredRole - 需要的角色（目前未使用，保留供未来扩展）
 */
exports.studentAuthorize = (requiredRole) => async (req, res, next) => {
  try {
    const payload = req.payload;

    // 检查是否为学生类型账户
    if (payload.accountType !== 'Student') {
      return res.status(403).json({ message: "此操作仅限学生账户使用" });
    }

    // 检查学生账户是否处于活跃状态
    const Student = await StudentModel.findOne({ _id: payload.currentStudent._id });
    if (!Student || !Student.isActive) {
      return res.status(401).json({ message: "学生账号不存在或者被禁用" });
    }

    // 学生类型的账户，直接通过
    return next();
  } catch (error) {
    console.error('学生授权服务器错误:', error);
    return res.status(500).json({ message: "studentAuthorize 认证服务器错误" });
  }
};

/**
 * 用户授权中间件
 * 验证用户是否为用户账户类型并具备对特定API的访问权限
 * @param {string} apiPermission - API权限标识
 */
exports.userAuthorize = (apiPermission) => async (req, res, next) => {
  try {
    const payload = req.payload;

    if (payload.accountType !== 'User') {
      return res.status(403).json({ message: "此操作仅限用户账户使用" });
    }

    // 验证用户账户是否处于活跃状态
    const User = await UserModel.findOne({ _id: payload.currentUser._id });
    if (!User || !User.isActive) {
      return res.status(401).json({ message: "用户账号不存在或者被禁用" });
    }

    // 验证用户所属机构是否处于活跃状态
    const Org = await OrgModel.findById(User.Org);
    if (!Org || !Org.isActive) {
      return res.status(401).json({ message: "用户所属机构不存在或者被禁用" });
    }

    // 将完整的用户信息添加到payload中，供后续中间件使用
    payload.currentUser = {
      _id: User._id,
      Org: User.Org,
    };
    // 如果是管理员，直接通过
    if (payload.isAdmin) {
      req.payload = payload; // 确保更新后的payload被传递到后续中间件
      return next();
    }

    // 检查API权限
    const apiPath = apiPermission || req.originalUrl; // 使用传入的apiPermission参数，或者默认使用请求的原始URL
    const apiMethod = req.method;

    // 查找API权限配置
    const apiPermissionDoc = await ApiPermission.findOne({ apiMethod, apiPath });
    if (!apiPermissionDoc) {
      return res.status(500).json({ message: `数据库中没有找到此路由的apiPermission数据，请联系管理员添加` });
    }

    // 检查用户是否具备访问此API的权限
    const userApiPermission = await UserApiPermission.findOne({
      userId: User._id,
      apiPermissionId: apiPermissionDoc._id,
    });
    if (!userApiPermission) {
      return res.status(401).json({ message: `此人没有访问此api的权限` });
    }

    // 将用户权限范围信息添加到payload
    payload.deptsRange = {
      range: userApiPermission.range,
      departmentIds: userApiPermission.departmentIds,
    };

    req.payload = payload; // 确保更新后的payload被传递到后续中间件
    next();
  } catch (error) {
    console.error('授权服务器错误:', error);
    return res.status(500).json({ message: "authorize 认证服务器错误" });
  }
};