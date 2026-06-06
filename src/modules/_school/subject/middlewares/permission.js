const ApiResponse = require('@utils/response');
const { isManager } = require('@utils/payloadChecker')

// 通用权限检查函数
const checkPermission = (permissionType) => {
  return (req, res, next) => {
    try {
      const payload = req.payload;

      // 记录权限检查
      console.info(`Checking ${permissionType} permission for Subject:`, payload._id);

      let hasPermission = false;

      switch (permissionType) {
        case 'add':
          // 创建权限：超级管理员可以创建任意公司用户，经理只能创建自己公司的用户
          hasPermission = isManager(payload);
          break;
        case 'edit':
          // 编辑权限：超级管理员可以编辑所有用户，经理只能编辑自己公司的用户
          hasPermission = isManager(payload);
          break;
        // case 'remove':
        //   hasPermission = isAdmin(payload);
        //   break;
        default:
          hasPermission = false;
      }

      if (!hasPermission) {
        return res.status(403).json(
          ApiResponse.error({ code: 403, message: "您无权访问" })
        );
      }

      next();
    } catch (e) {
      console.error('User Permission check error:', e);
      const statusCode = e.code || 500;
      return res.status(statusCode).json(ApiResponse.error(e));
    }
  };
};

exports.add = checkPermission('add');
exports.edit = checkPermission('edit');