const DAO = require('@models/DAO');
const { StudentCourseModel, StudentCourseEnums, StudentCourseDOC } = require('./StudentCourse.model');
const { StudentModel } = require('@models/school/student/Student.dao');
const { CourseModel } = require('@models/school/course/Course.dao');
const { StudentPackModel } = require('@models/school/student/StudentPack.dao');
const { AccountModel } = require('@models/authorization/Account.dao');
const {
  userPayloadChecker,
  studentPayloadChecker,
} = require('@utils/payloadChecker');

/**
 * StudentCourse 数据访问层
 *
 * 业务背景:
 *  - 学生确认上课后, 管理员在管理后台手动 add 选课记录
 *  - 管理员可在 add 时或后续 edit 时绑定 StudentPack (可空)
 *
 * 权限矩阵 (与 studentPack 对齐):
 *  - list   : Student 看自己 / manager 看本 Org / isAdmin 看全平台
 *  - detail : Student 看自己 / manager 看本 Org / isAdmin 看全平台
 *  - add    : 仅 manager / admin (admin 限于本 Org, 业务数据 Org 隔离)
 *  - edit   : 仅 manager / admin (同上)
 *
 * 业务数据 Org 隔离对超管同样生效 (避免 updatedBy / createdBy 跨公司引用)
 */
const list = async (payload = {}, filter, options) => {
  try {
    if (payload.accountType === 'Student') {
      studentPayloadChecker(payload);
      // 学生只能查看自己的选课记录
      filter.Student = payload.currentStudent._id;
    } else if (payload.accountType === 'User') {
      userPayloadChecker(payload);

      if (payload.isAdmin) {
        // 超管: 看全平台
      } else if (payload.currentUser.roleTemp === 'manager') {
        // 经理: 本 Org 全量
        filter.Org = payload.currentUser.Org;
      } else {
        // 普通老师: 仅自己主讲/助教课程的学生
        const myCourses = await CourseModel.find({
          $or: [
            { mainTeacher: payload.currentUser._id },
            { assistantTeacher: payload.currentUser._id },
          ],
        }).select('_id');
        const myCourseIds = myCourses.map(c => c._id);
        // 未授课的老师: 返回空集而非 403, 与其他业务模块保持一致
        filter.Course = { $in: myCourseIds };
      }
    } else {
      throw ({ code: 403, message: "您的身份有误" });
    }

    const { items, total } = await DAO.list(StudentCourseModel, filter, options);
    return { items, total };
  } catch (e) {
    console.error('StudentCourseDao list error:', e);
    throw e;
  }
};

const detail = async (payload = {}, _id, options) => {
  try {
    const { item } = await DAO.detail(StudentCourseModel, _id, options);

    if (!item) {
      throw ({ code: 404, message: "此 学生选课 数据已不存在" });
    }

    if (payload.accountType === 'Student') {
      studentPayloadChecker(payload);
      // 学生只能查看自己的选课记录
      if (item.Student.toString() !== payload.currentStudent._id.toString()) {
        throw ({ code: 403, message: "您无权查看此学生选课" });
      }
    } else if (payload.accountType === 'User') {
      userPayloadChecker(payload);

      if (payload.isAdmin) {
        // 超管: 不做 Org 限制(由调用方决定, 当前实现与 manager 行为对齐)
        if (item.Org.toString() !== payload.currentUser.Org.toString()) {
          throw ({ code: 403, message: "您无权查看其他校区的学生选课" });
        }
      } else if (payload.currentUser.roleTemp === 'manager') {
        // 经理: Org 隔离
        if (item.Org.toString() !== payload.currentUser.Org.toString()) {
          throw ({ code: 403, message: "您无权查看其他校区的学生选课" });
        }
      } else {
        // 普通老师: 仅自己主讲/助教课程的学生
        const course = await CourseModel.findById(item.Course)
          .select('mainTeacher assistantTeacher Org');
        if (!course) {
          throw ({ code: 404, message: "关联课程不存在" });
        }
        // 跨 Org 兜底: 即使是自己教的, 不在本公司也看不到
        if (course.Org.toString() !== payload.currentUser.Org.toString()) {
          throw ({ code: 403, message: "您无权查看其他校区的学生选课" });
        }
        const isMyCourse =
          course.mainTeacher.toString() === payload.currentUser._id.toString() ||
          (course.assistantTeacher &&
            course.assistantTeacher.toString() === payload.currentUser._id.toString());
        if (!isMyCourse) {
          throw ({ code: 403, message: "您不是此课程的授课老师, 无权查看" });
        }
      }
    } else {
      throw ({ code: 403, message: "您的身份有误" });
    }

    return { item };
  } catch (e) {
    console.error('StudentCourseDao detail error:', e);
    throw e;
  }
};

/**
 * 手动添加学生选课
 * 业务背景: 学生确认上课后, 管理员在管理后台填写
 *
 * - 仅 User 账户 (manager / admin) 可调用
 * - 必填: Student / Course
 * - Account 由 Student 自动推导, 不可由前端指定
 * - Org 由 currentUser.Org 强制注入, 不可由前端指定
 * - nameCourse 由 Course.name 自动冗余, 不可由前端指定
 * - StudentPack 可选, add 时绑定后后续 edit 可更换
 *
 * @param {Object} payload
 * @param {Object} doc
 * @param {Object} options {session} 事务
 */
const add = async (payload, doc, options) => {
  try {
    userPayloadChecker(payload);
    if (payload.currentUser.roleTemp !== 'manager') {
      throw ({ code: 403, message: "只有管理员才能添加学生选课" });
    }

    // 1. 验证 Student
    if (!doc.Student) {
      throw ({ code: 400, message: "必须指定学生" });
    }
    const student = await StudentModel.findById(doc.Student);
    if (!student || !student.isActive) {
      throw ({ code: 404, message: "指定的学生不存在或被禁用" });
    }
    if (student.Org.toString() !== payload.currentUser.Org.toString()) {
      throw ({ code: 403, message: "您只能为本公司学生添加选课" });
    }
    if (!student.Account) {
      throw ({ code: 400, message: "该学生未关联账户,无法添加选课" });
    }
    const account = await AccountModel.findById(student.Account);
    if (!account || !account.isActive || account.accountType !== 'Student') {
      throw ({ code: 404, message: "学生关联的账户不存在或被禁用" });
    }

    // 2. 验证 Course
    if (!doc.Course) {
      throw ({ code: 400, message: "必须指定课程" });
    }
    const course = await CourseModel.findById(doc.Course);
    if (!course || !course.isActive) {
      throw ({ code: 404, message: "指定的课程不存在或被禁用" });
    }
    if (course.Org.toString() !== payload.currentUser.Org.toString()) {
      throw ({ code: 403, message: "课程与您不在同一机构, 无法添加" });
    }

    // 3. 验证可选的 StudentPack
    let pack = null;
    if (doc.StudentPack) {
      pack = await StudentPackModel.findById(doc.StudentPack);
      if (!pack) {
        throw ({ code: 404, message: "指定的学生课包不存在" });
      }
      if (pack.Org.toString() !== payload.currentUser.Org.toString()) {
        throw ({ code: 403, message: "学生课包与您不在同一机构" });
      }
      if (pack.Student.toString() !== student._id.toString()) {
        throw ({ code: 400, message: "学生课包不属于此学生" });
      }
    }

    // 4. 自动注入 (DAO 唯一可信源, 覆盖前端传入值)
    doc.Account = student.Account;
    doc.Org = student.Org;
    doc.nameCourse = course.name;          // 冗余 Course.name
    doc.createdBy = payload.currentUser._id;
    if (!doc.status) doc.status = 'active';
    if (!doc.StudentCourseDate) doc.StudentCourseDate = new Date();

    const { item } = await DAO.add(StudentCourseModel, doc, options);
    return { item };
  } catch (e) {
    // 唯一索引冲突: 同一学生已报名同一课程
    if (e && e.code === 11000) {
      throw ({ code: 400, message: "该学生已报名此课程, 不能重复添加" });
    }
    console.error('StudentCourseDao add error:', e);
    throw e;
  }
};

/**
 * 编辑学生选课
 * 业务背景: 管理员补录 / 调整 StudentPack / 改 status / 改 remark
 *
 * - 仅 manager / admin 可调用
 * - Org 隔离: 超管也只能改本公司
 * - 不可改: Student / Account / Course / nameCourse / Org / createdBy
 * - 可改: StudentPack (后期绑定/更换) / status / StudentCourseDate / remark / updatedBy
 *
 * @param {Object} payload
 * @param {String} _id
 * @param {Object} doc
 * @param {Object} options {session} 事务
 */
const edit = async (payload = {}, _id, doc, options) => {
  try {
    userPayloadChecker(payload);
    if (payload.currentUser.roleTemp !== 'manager') {
      throw ({ code: 403, message: "只有管理员才能修改学生选课" });
    }

    const target = await StudentCourseModel.findById(_id);
    if (!target) {
      throw ({ code: 404, message: '学生选课记录不存在' });
    }
    // Org 隔离 (业务数据 Org 隔离对超管同样生效)
    if (target.Org.toString() !== payload.currentUser.Org.toString()) {
      throw ({ code: 403, message: "您无权修改其他校区的学生选课" });
    }

    // StudentPack 后期绑定/更换: 校验存在 + Org 一致 + Student 一致
    if (doc.StudentPack !== undefined && doc.StudentPack !== null) {
      const pack = await StudentPackModel.findById(doc.StudentPack);
      if (!pack) {
        throw ({ code: 404, message: "指定的学生课包不存在" });
      }
      if (pack.Org.toString() !== payload.currentUser.Org.toString()) {
        throw ({ code: 403, message: "学生课包与您不在同一机构" });
      }
      if (pack.Student.toString() !== target.Student.toString()) {
        throw ({ code: 400, message: "学生课包不属于此学生" });
      }
    }

    doc.updatedBy = payload.currentUser._id;
    target.set(doc);
    const { item } = await DAO.edit(target, options);

    return { item };
  } catch (e) {
    console.error('StudentCourseDao update error:', e);
    throw e;
  }
};

// StudentCourse 不能被删除 remove 只需要在把 status 修改为 'dropped' / 'transferred'
module.exports = {
  StudentCourseDAO: {
    list,
    detail,
    add,
    edit,
  },
  StudentCourseModel, StudentCourseDOC, StudentCourseEnums,
}
