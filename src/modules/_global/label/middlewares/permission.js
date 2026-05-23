const ApiResponse = require('../../../../utils/response');

// 通用权限检查函数
const checkPermission = (permissionType) => {
  return (req, res, next) => {
    try {
      const payload = req.payload;

      // 记录权限检查
      console.info(`Checking ${permissionType} permission for user:`, payload._id);

      let hasPermission = false;

      switch(permissionType) {
        case 'read':
          // 读取权限：超级管理员或普通管理员
          hasPermission = payload.isAdmin === true;
          break;
        case 'create':
          // 创建权限：管理员角色
          hasPermission = payload.roleSimp === 'manager';
          break;
        case 'edit':
          // 编辑权限：管理员角色
          hasPermission = payload.roleSimp === 'manager';
          break;
        case 'delete':
          // 删除权限：管理员角色（注意原代码有个拼写错误 manger -> manager）
          hasPermission = payload.roleSimp === 'manager';
          break;
        default:
          hasPermission = false;
      }

      if (!hasPermission) {
        const permissionMessages = {
          read: "需要读取权限",
          create: "需要创建权限",
          edit: "需要编辑权限",
          delete: "需要删除权限"
        };

        return res.status(403).json(
          ApiResponse.forbiddenError(permissionMessages[permissionType] || "无权限访问")
        );
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json(ApiResponse.error("权限检查服务器错误"));
    }
  };
};

exports.readPermission = checkPermission('read');
exports.createPermission = checkPermission('create');
exports.editPermission = checkPermission('edit');
exports.deletePermission = checkPermission('delete');