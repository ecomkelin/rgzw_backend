const ApiResponse = require('@utils/response');
const { isAdmin } = require('@utils/payloadChecker')
// 通用权限检查函数
const checkPermission = (permissionType) => {
  return (req, res, next) => {
    try {
      const payload = req.payload;

      // 记录权限检查
      console.info(`Checking ${permissionType} permission for user:`, payload._id);

      let hasPermission = false;

      switch (permissionType) {
        case 'read':
          // 读取权限：超级管理员可以查看所有机构，普通用户只能查看自己所在机构
          hasPermission = isAdmin(payload);
          break;
        case 'add':
          // 创建权限：只有管理员
          hasPermission = isAdmin(payload);
          break;
        case 'edit':
          // 编辑权限：只有管理员
          hasPermission = isAdmin(payload);
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
      console.error('Org Permission check error:', e);
      const statusCode = e.code || 500;
      return res.status(statusCode).json(ApiResponse.error(e));
    }
  };
};

exports.read = checkPermission('read');
exports.add = checkPermission('add');
exports.edit = checkPermission('edit');