const ApiResponse = require('@utils/response');
const { isManager } = require('@utils/payloadChecker')

// 通用权限检查函数
const checkPermission = (permissionType) => {
  return (req, res, next) => {
    try {
      const payload = req.payload;

      // 记录权限检查
      console.info(`Checking ${permissionType} permission for User:`, payload._id);

      let hasPermission = false;
      if (payload.accountType === 'User') {
        switch (permissionType) {
          case 'read':
            hasPermission = isManager(payload);
            break;
          case 'add':
            hasPermission = isManager(payload);
            break;
          case 'edit':
            hasPermission = isManager(payload);
            break;
          // case 'remove':
          //   hasPermission = isAdmin(payload);
          //   break;
          case 'selfDetail':
            hasPermission = true;
          default:
            hasPermission = false;
        }
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

exports.read = checkPermission('read');
exports.add = checkPermission('add');
exports.edit = checkPermission('edit');
exports.selfDetail = checkPermission('selfDetail');