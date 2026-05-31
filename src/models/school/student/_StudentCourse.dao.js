const DAO = require('@models/DAO');
const { StudentCourseModel, StudentCourseEnums, StudentCourseDOC } = require('./StudentCourse.model');
const { StudentModel } = require('@models/school/student/Student.dao');
const { CourseModel } = require('@models/school/course/Course.dao');
const { AccountModel } = require('@models/authorization/Account.dao');

const list = async (payload = {}, filter, options) => {
  try {
    // 验证权限
    if (payload.accountType === 'Student') {
      // 学生只能查看自己的报名记录
      const student = payload.currentStudent;
      if (!student) {
        throw ({ code: 403, message: "学生信息无效" });
      }
      filter.Student = student._id;
    } else if (payload.accountType === 'User') {
      if (!payload.isAdmin) {
        if (payload.currentUser?.roleTemp !== 'manager') {
          // 老师只能查看自己授课课程的学生
          filter.$or = [
            { 'Course.mainTeacher': payload.currentUser._id },
            { 'Course.assistantTeacher': payload.currentUser._id }
          ];
        }
        filter.Org = payload.currentUser.Org;
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
      throw ({ code: 404, message: "此 学生课程 数据已不存在" });
    }

    // 验证权限
    if (payload.accountType === 'Student') {
      // 学生只能查看自己的报名记录
      const student = payload.currentStudent;
      if (!student || item.Student.toString() !== student._id.toString()) {
        throw ({ code: 403, message: "您无权查看此学生课程记录" });
      }
    } else if (payload.accountType === 'User') {
      if (!payload.isAdmin) {
        if (item.Org.toString() !== payload.currentUser?.Org.toString()) {
          throw ({ code: 403, message: "您无权查看此学生课程记录" });
        }
        // 老师只能查看自己授课课程的学生
        if (payload.currentUser.roleTemp !== 'manager') {
          const course = await CourseModel.findById(item.Course);
          if (course.mainTeacher.toString() !== payload.currentUser._id.toString() &&
              course.assistantTeacher.toString() !== payload.currentUser._id.toString()) {
            throw ({ code: 403, message: "您无权查看此学生课程记录" });
          }
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
 *
 * @param {*} payload
 * @param {*} doc
 * @param {*} options: {session} 事务
 * @returns
 */
const add = async (payload, doc, options) => {
  try {
    if (payload.accountType !== 'User') {
      throw ({ code: 403, message: "您无权添加学生课程" });
    }

    // 只有管理员可以添加学生课程
    if (!payload.isAdmin) {
      if (payload.currentUser?.roleTemp !== 'manager') {
        throw ({ code: 403, message: "只有管理员才能添加学生课程" });
      }
    }

    // 验证关联项存在性
    if (!doc.Student) {
      throw ({ code: 400, message: "必须指定学生" });
    }
    const student = await StudentModel.findById(doc.Student);
    if (!student) {
      throw ({ code: 404, message: "指定的学生不存在" });
    }

    if (!doc.Course) {
      throw ({ code: 400, message: "必须指定课程" });
    }
    const course = await CourseModel.findById(doc.Course);
    if (!course) {
      throw ({ code: 404, message: "指定的课程不存在" });
    }

    if (!doc.Account) {
      throw ({ code: 400, message: "必须指定家长账户" });
    }
    const account = await AccountModel.findById(doc.Account);
    if (!account) {
      throw ({ code: 404, message: "指定的家长账户不存在" });
    }

    // 设置机构和创建者
    doc.Org = payload.currentUser.Org;
    doc.createdBy = payload.currentUser._id;

    const { item } = await DAO.add(StudentCourseModel, doc, options);
    return { item };
  } catch (e) {
    console.error('StudentCourseDao create error:', e);
    throw e;
  }
};

const edit = async (payload = {}, _id, doc, options) => {
  try {
    // 验证目标学生课程是否存在
    const targetStudentCourse = await StudentCourseModel.findById(_id);
    if (!targetStudentCourse) {
      throw ({ code: 404, message: '学生课程记录不存在' });
    }

    // 验证权限
    if (payload.accountType !== 'User') {
      throw ({ code: 403, message: "您无权修改学生课程" });
    }

    if (!payload.isAdmin) {
      if (payload.currentUser?.roleTemp !== 'manager') {
        throw ({ code: 403, message: "只有管理员才能修改学生课程" });
      }
      if (targetStudentCourse.Org.toString() !== payload.currentUser?.Org.toString()) {
        throw ({ code: 403, message: "您无权修改此学生课程" });
      }
    }

    targetStudentCourse.set(doc);
    const { item } = await DAO.edit(targetStudentCourse, options);

    return { item };

  } catch (e) {
    console.error('StudentCourseDao update error:', e);
    throw e;
  }
};

// StudentCourse 不能被删除 remove 只需要在 把 isActive 修改为 false

module.exports = {
  StudentCourseDAO: {
    list,
    detail,
    add,
    edit,
  },
  StudentCourseModel, StudentCourseDOC, StudentCourseEnums,
}