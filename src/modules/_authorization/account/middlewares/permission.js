const ApiResponse = require('@utils/response');

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
          // 读取权限：只有管理员可以读取其他账户信息
          hasPermission = payload.isAdmin === true;
          break;
        case 'add':
          // 创建权限：只有管理员可以创建账户
          hasPermission = payload.isAdmin === true;
          break;
        case 'edit':
          // 编辑权限：只有管理员可以编辑账户
          hasPermission = payload.isAdmin === true;
          break;
        case 'manage':
          // 管理权限：只有管理员可以管理账户（激活/禁用等）
          hasPermission = payload.isAdmin === true;
          break;
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
      console.error('Account Permission check error:', e);
      const statusCode = e.code || 500;
      return res.status(statusCode).json(ApiResponse.error(e));
    }
  };
};

exports.readPermission = checkPermission('read');
exports.addPermission = checkPermission('add');
exports.editPermission = checkPermission('edit');
exports.managePermission = checkPermission('manage');