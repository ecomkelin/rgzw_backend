const ApiResponse = require('@utils/response');
const { isStudent, isUser, isManager } = require('@utils/payloadChecker');

/**
 * StudentCourse 路由权限中间件
 *
 * 业务背景: 学生确认上课后, 管理员手动填写并维护
 * 权限规则:
 *  - read  : Student(看自己) 或 User(含老师, 看自己授课课程的选课)  -- DAO 二次过滤
 *  - write : 仅 Manager (含 Admin) - 添加 / 编辑 选课记录
 */
const checkPermission = (permissionType) => {
  return (req, res, next) => {
    try {
      const payload = req.payload;
      let hasPermission = false;

      switch (permissionType) {
        case 'read':
          // Student 看自己; 任意 User(老师/经理/超管) 看对应范围的选课(DAO 二次过滤)
          hasPermission = isStudent(payload) || isUser(payload);
          break;
        case 'write':
          hasPermission = isManager(payload);
          break;
        default:
          hasPermission = false;
      }

      if (!hasPermission) {
        return res.status(403).json(
          ApiResponse.error({ code: 403, message: '您无权访问学生选课' })
        );
      }

      next();
    } catch (e) {
      console.error('StudentCourse Permission check error:', e);
      const statusCode = e.code || 500;
      return res.status(statusCode).json(ApiResponse.error(e));
    }
  };
};

exports.read = checkPermission('read');
exports.write = checkPermission('write');
