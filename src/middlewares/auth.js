const { verifyAccessToken } = require("@utils/JwtUtil");
const SessionValidator = require("@utils/sessionValidator");
const AccountMD = require("@models/authorization/Account.model");
const ApiPermission = require("@models/authorization/roleApi/ApiPermission.model");
const UserApiPermission = require("@models/authorization/roleApi/UserApiPermission.model");
const OrgMD = require("@models/organization/structure/Org.model"); // 添加对机构服务的引用
const UserMD = require("@models/organization/structure/User.model");
const StudentMD = require("@/models/school/student/Student.model");

// 认证中间件
exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ code: 401, message: "需要权限认证" });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "令牌无效或已过期" });
    }

    // Check if the session is still valid (prevent concurrent logins)
    // 检查会话是否有效
    const isSessionValid = await SessionValidator.isSessionValid(decoded);
    if (!isSessionValid) {
      return res.status(401).json({ message: "会话已失效或已在其他设备登录，请重新登录" });
    }

    const Account = await AccountMD.findById(decoded._id);
    if (!Account || !Account.isActive) {
      return res.status(401).json({ message: "账号不存在或者被禁用" });
    }
    req.payload = { ...decoded, };
    if (Account.accountType === 'User') {
      req.payload.currentUser = { _id: Account.currentUser };
    } else if (Account.accountType === 'Student') {
      req.payload.currentStudent = { _id: Account.currentStudent };
    } else {
      return res.status(401).json({ message: "账号类型无效" });
    }

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
      return res.status(403).json({ message: "此操作仅限学生账户使用" });
    }

    // 检查学生账户所属的机构是否活跃
    // 学生可能直接关联到账户，但有时也可能间接关联到机构
    const Student = await StudentMD.findOne({ _id: payload.currentStudent._id });
    if (!Student || !Student.isActive) {
      return res.status(401).json({ message: "学生账号不存在或者被禁用" });
    }

    // 学生类型的账户，直接通过
    return next();
  } catch (error) {
    console.error('Student authorization server error:', error);
    return res.status(500).json({ message: "studentAuthorize 认证服务器错误" });
  }
}

// 用户 授权中间件
exports.userAuthorize = (apiPermission) => async (req, res, next) => {
  try {
    const payload = req.payload;

    if (payload.accountType !== 'User') {
      return res.status(403).json({ message: "此操作仅限用户账户使用" });
    }
    const User = await UserMD.findOne({ _id: payload.currentUser._id });
    if (!User || !User.isActive) {
      return res.status(401).json({ message: "用户账号不存在或者被禁用" });
    }
    const Org = await OrgMD.findById(User.Org);
    if (!Org || !Org.isActive) {
      return res.status(401).json({ message: "用户所属机构不存在或者被禁用" });
    }

    payload.currentUser = {
      _id: User._id,
      Org: User.Org,
    }; // 将完整的用户信息添加到payload中，供后续中间件使用

    // 如果是管理员，直接通过
    if (payload.isAdmin) {
      req.payload = payload; // 确保更新后的payload被传递到后续中间件
      return next();
    }

    const apiPath = apiPermission || req.originalUrl; // 使用传入的apiPermission参数，或者默认使用请求的原始URL
    const apiMethod = req.method;

    const apiPermissionDoc = await ApiPermission.findOne({ apiMethod, apiPath });
    if (!apiPermissionDoc) {
      return res.status(500).json({ message: `数据库中没有找到此路由的apiPermission数据，请联系管理员添加` });
    }

    const userApiPermission = await UserApiPermission.findOne({
      userId: User._id,
      apiPermissionId: apiPermissionDoc._id,
    });
    if (!userApiPermission) {
      return res.status(401).json({ message: `此人没有访问此api的权限` });
    }

    payload.deptsRange = {
      range: userApiPermission.range,
      departmentIds: userApiPermission.departmentIds,
    }

    req.payload = payload; // 确保更新后的payload被传递到后续中间件
    next();
  } catch (error) {
    console.error('Authorization server error:', error);
    return res.status(500).json({ message: "authorize 认证服务器错误" });
  }
};