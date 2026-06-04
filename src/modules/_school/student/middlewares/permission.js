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
          // 读取权限：isAdmin=true 可以查看所有，roleTemp='manager' 只能查看本公司
          hasPermission = payload.isAdmin === true;
          if (!hasPermission && payload.currentUser.roleTemp === 'manager') {
            // 经理可以查看自己公司的学生
            hasPermission = true;
          }
          break;
        case 'add':
          // 创建权限：isAdmin=true 和 roleTemp='manager' 都可以创建学生，但需遵循权限范围
          hasPermission = payload.isAdmin === true || payload.currentUser.roleTemp === 'manager';
          break;
        case 'edit':
          // 编辑权限：isAdmin=true 可以编辑所有学生，roleTemp='manager' 只能编辑本公司学生
          hasPermission = payload.isAdmin === true;
          if (!hasPermission && payload.currentUser.roleTemp === 'manager') {
            // 在service层会进一步验证是否属于自己公司
            hasPermission = true;
          }
          break;
        case 'manage':
          // 管理权限（激活/禁用等特殊操作）：仅管理员可以
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
      console.error('Student Permission check error:', e);
      const statusCode = e.code || 500;
      return res.status(statusCode).json(ApiResponse.error(e));
    }
  };
};

exports.readPermission = checkPermission('read');
exports.addPermission = checkPermission('add');
exports.editPermission = checkPermission('edit');
exports.managePermission = checkPermission('manage');