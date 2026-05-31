const DAO = require('@models/DAO');
const { CourseModel, CourseEnums, CourseDOC } = require('./Course.model');
const { SubjectModel } = require('./Subject.dao');
const { UserModel } = require('@models/organization/structure/User.dao');
const { RoomModel } = require('@models/organization/physical/Room.dao');

const list = async (payload = {}, filter, options) => {
  try {
    // 验证权限
    if (payload.accountType === 'Student') {
      // 学生可以查看自己报名的课程或开放的课程
      filter.status = { $in: ['enrolling', 'ongoing'] }; // 只能查看正在招生或进行中的课程
    } else if (payload.accountType === 'User') {
      if (!payload.isAdmin) {
        if (payload.currentUser?.roleTemp !== 'manager') {
          // 老师只能查看自己教授的课程
          filter.$or = [
            { mainTeacher: payload.currentUser._id },
            { assistantTeacher: payload.currentUser._id }
          ];
        }
        filter.Org = payload.currentUser.Org;
      }
    } else {
      throw ({ code: 403, message: "您的身份有误" });
    }

    const { items, total } = await DAO.list(CourseModel, filter, options);
    return { items, total };
  } catch (e) {
    console.error('CourseDao list error:', e);
    throw e;
  }
};

const detail = async (payload = {}, _id, options) => {
  try {
    const { item } = await DAO.detail(CourseModel, _id, options);

    if (!item) {
      throw ({ code: 404, message: "此 课程 数据已不存在" });
    }

    // 验证权限
    if (payload.accountType === 'Student') {
      // 学生只能查看自己报名的课程或开放的课程
      if (item.status !== 'enrolling' && item.status !== 'ongoing') {
        // 检查是否已报名
        const enrolled = await require('@models/school/student/StudentCourse.dao').StudentCourseModel.findOne({
          Student: payload.currentStudent._id,
          Course: _id
        });

        if (!enrolled) {
          throw ({ code: 403, message: "您无权查看此课程" });
        }
      }
    } else if (payload.accountType === 'User') {
      if (!payload.isAdmin) {
        if (item.Org.toString() !== payload.currentUser?.Org.toString()) {
          throw ({ code: 403, message: "您无权查看此课程" })
        }
        // 老师只能查看自己相关的课程
        if (payload.currentUser.roleTemp !== 'manager') {
          if (item.mainTeacher.toString() !== payload.currentUser._id.toString() &&
              item.assistantTeacher.toString() !== payload.currentUser._id.toString()) {
            throw ({ code: 403, message: "您无权查看此课程" });
          }
        }
      }
    } else {
      throw ({ code: 403, message: "您的身份有误" })
    }

    return { item };
  } catch (e) {
    console.error('CourseDao detail error:', e);
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
      throw ({ code: 403, message: "您无权添加课程" });
    }

    // 只有管理员或任课老师可以创建课程
    if (!payload.isAdmin) {
      if (payload.currentUser?.roleTemp !== 'manager') {
        throw ({ code: 403, message: "只有管理员才能创建课程" });
      }
    }

    // 验证关联项存在性
    if (!doc.Subject) {
      throw ({ code: 400, message: "课程必须关联科目" });
    }
    const subject = await SubjectModel.findById(doc.Subject);
    if (!subject) {
      throw ({ code: 404, message: "指定的科目不存在" });
    }

    if (!doc.mainTeacher) {
      throw ({ code: 400, message: "课程必须指定主讲老师" });
    }
    const teacher = await UserModel.findById(doc.mainTeacher);
    if (!teacher) {
      throw ({ code: 404, message: "指定的老师不存在" });
    }

    // 设置机构和创建者
    doc.Org = payload.currentUser.Org;
    doc.createdBy = payload.currentUser._id;

    const { item } = await DAO.add(CourseModel, doc, options);
    return { item };
  } catch (e) {
    console.error('CourseDao create error:', e);
    throw e;
  }
};

const edit = async (payload = {}, _id, doc, options) => {
  try {
    // 验证目标课程是否存在
    const targetCourse = await CourseModel.findById(_id);
    if (!targetCourse) {
      throw ({ code: 404, message: '课程不存在' });
    }

    // 验证权限
    if (payload.accountType !== 'User') {
      throw ({ code: 403, message: "您无权修改课程" });
    }

    if (!payload.isAdmin) {
      if (payload.currentUser?.roleTemp !== 'manager') {
        // 普通老师只能修改自己主讲的课程
        if (targetCourse.mainTeacher.toString() !== payload.currentUser._id.toString()) {
          throw ({ code: 403, message: "您只能修改自己主讲的课程" });
        }
      }
      if (targetCourse.Org.toString() !== payload.currentUser?.Org.toString()) {
        throw ({ code: 403, message: "您无权修改此课程" });
      }
    }

    // 更新课程信息
    targetCourse.set(doc);
    const { item } = await DAO.edit(targetCourse, options);

    return { item };

  } catch (e) {
    console.error('CourseDao update error:', e);
    throw e;
  }
};

// Course 不能被删除 remove 只需要在 把 isActive 修改为 false

module.exports = {
  CourseDAO: {
    list,
    detail,
    add,
    edit,
  },
  CourseModel, CourseDOC, CourseEnums,
}