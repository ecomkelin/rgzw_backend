const ApiResponse = require('@utils/response');
const { isStudent, isManager } = require('@utils/payloadChecker')

const checkPermission = (permissionType) => {
  return (req, res, next) => {
    try {
      const payload = req.payload;

      let hasPermission = false;

      switch (permissionType) {
        case 'read':
          hasPermission = isStudent(payload) || isManager(payload);
          break;
        case 'add':
          hasPermission = isStudent(payload) || isManager(payload);
          break;
        case 'edit':
          // 只有管理员可以编辑订单
          hasPermission = isAdmin(payload);
          break;
        default:
          hasPermission = false;
      }

      if (!hasPermission) {
        return res.status(403).json(
          ApiResponse.error({ code: 403, message: '您无权访问课包订单' })
        );
      }

      next();
    } catch (e) {
      console.error('OrderPack Permission check error:', e);
      const statusCode = e.code || 500;
      return res.status(statusCode).json(ApiResponse.error(e));
    }
  };
};

exports.read = checkPermission('read');
exports.add = checkPermission('add');
exports.edit = checkPermission('edit');
