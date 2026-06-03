const ApiResponse = require('@utils/response');

// 通用权限检查函数
const checkPermission = (permissionType) => {
  return (req, res, next) => {
    try {
      const payload = req.payload;

      // 记录权限检查
      console.info(`Checking ${permissionType} permission for Subject:`, payload._id);

      let hasPermission = false;

      switch (permissionType) {
        case 'read':
          // 读取权限：超级管理员可以查看所有，经理只能查看自己公司的
          hasPermission = payload.isAdmin === true;
          if (!hasPermission && payload.currentUser.roleTemp === 'manager') {
            // 经理可以查看自己公司的用户
            hasPermission = true;
          }
          break;
        case 'create':
          // 创建权限：超级管理员可以创建任意公司用户，经理只能创建自己公司的用户
          hasPermission = payload.isAdmin === true;
          break;
        case 'edit':
          // 编辑权限：超级管理员可以编辑所有用户，经理只能编辑自己公司的用户
          hasPermission = payload.isAdmin === true;
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
      console.error('User Permission check error:', e);
      return res.status(500).json(ApiResponse.error(e));
    }
  };
};

exports.readPermission = checkPermission('read');
exports.createPermission = checkPermission('create');
exports.editPermission = checkPermission('edit');
exports.managePermission = checkPermission('manage');