const ApiResponse = require('@utils/response');

/**
 * OrderPack 模块权限校验
 *
 * 业务规则:
 * - 列表/详情 (read):
 *     Student   -> 放行(由 DAO 二次过滤 filter.Student = currentStudent._id,只能看自己的)
 *     User 超管 -> 放行(payload.isAdmin === true)
 *     User 经理 -> 放行(由 DAO 二次过滤 filter.Org = currentUser.Org)
 *     其他     -> 拒绝
 *
 * - 创建 (add):
 *     User 超管 / User 经理 -> 放行
 *     其他                 -> 拒绝
 *
 * - 编辑 (edit):
 *     仅 User 超管 -> 放行(经理也不能改订单)
 *     其他        -> 拒绝
 *
 * 物理删除未开放(订单是审计关键数据,不允许 remove)
 */
const isManager = (payload) =>
  payload?.accountType === 'User' && payload.currentUser?.roleTemp === 'manager';

const isAdmin = (payload) =>
  payload?.accountType === 'User' && payload.isAdmin === true;

const isStudent = (payload) => payload?.accountType === 'Student';

const checkPermission = (permissionType) => {
  return (req, res, next) => {
    try {
      const payload = req.payload;

      let hasPermission = false;

      switch (permissionType) {
        case 'read':
          hasPermission = isStudent(payload) || isAdmin(payload) || isManager(payload);
          break;
        case 'add':
          hasPermission = isAdmin(payload) || isManager(payload);
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

exports.readPermission = checkPermission('read');
exports.addPermission = checkPermission('add');
exports.editPermission = checkPermission('edit');
exports.managePermission = checkPermission('manage');
