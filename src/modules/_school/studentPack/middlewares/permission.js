const ApiResponse = require('@utils/response');
const { isStudent, isManager, isAdmin } = require('@utils/payloadChecker');

/**
 * StudentPack 路由权限中间件
 * 业务规则(与 OrderPack 对齐):
 *   - read  : Student(看自己) 或 Manager(看本 Org) 或 Admin(看全部)  -- DAO 二次过滤
 *   - add   : 仅 Admin (resource='free' 手动赠送)
 *   - edit  : 仅 Admin
 */
const checkPermission = (permissionType) => {
  return (req, res, next) => {
    try {
      const payload = req.payload;
      let hasPermission = false;

      switch (permissionType) {
        case 'read':
          hasPermission = isStudent(payload) || isManager(payload) || isAdmin(payload);
          break;
        case 'add':
          hasPermission = isAdmin(payload);
          break;
        case 'edit':
          hasPermission = isAdmin(payload);
          break;
        default:
          hasPermission = false;
      }

      if (!hasPermission) {
        return res.status(403).json(
          ApiResponse.error({ code: 403, message: '您无权访问学生课包' })
        );
      }

      next();
    } catch (e) {
      console.error('StudentPack Permission check error:', e);
      const statusCode = e.code || 500;
      return res.status(statusCode).json(ApiResponse.error(e));
    }
  };
};

exports.read = checkPermission('read');
exports.add = checkPermission('add');
exports.edit = checkPermission('edit');
