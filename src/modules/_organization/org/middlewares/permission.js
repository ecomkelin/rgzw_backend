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
          // 读取权限：管理员可以查看所有机构，普通用户只能查看自己所在机构
          hasPermission = payload.isAdmin === true;
          break;
        case 'add':
          // 创建权限：只有管理员
          hasPermission = payload.isAdmin === true;
          break;
        case 'edit':
          // 编辑权限：只有管理员
          hasPermission = payload.isAdmin === true;
          break;
        case 'manage':
          // 管理权限（激活/禁用）：只有管理员
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
      console.error('Org Permission check error:', e);
      return res.json(ApiResponse.error(e));
    }
  };
};

exports.readPermission = checkPermission('read');
exports.addPermission = checkPermission('add');
exports.editPermission = checkPermission('edit');
exports.managePermission = checkPermission('manage');