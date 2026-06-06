const DAO = require('@models/DAO');
const { CourseModel, CourseEnums, CourseDOC } = require('./Course.model');
const { SubjectModel } = require('./Subject.model');
const { UserModel } = require('@models/organization/structure/User.model');
const { RoomModel } = require('@models/organization/physical/Room.model');
const { StudentCourseModel } = require('@models/school/student/StudentCourse.model');
const { userPayloadChecker, studentPayloadChecker, payloadChecker } = require('@utils/payloadChecker');

const list = async (payload = {}, filter, options) => {
  try {
    // 验证权限
    if (payload.accountType === 'Student') {
      studentPayloadChecker(payload);
      // 学生可以查看自己报名的课程或开放的课程
      // filter.Org = payload.currentStudent.Org; // 由前端控制吧
      filter.status = { $in: ['enrolling', 'ongoing'] }; // 只能查看正在招生或进行中的课程
    } else if (payload.accountType === 'User') {
      userPayloadChecker(payload);
      // 管理员: 全部课程 
      if (!payload.isAdmin) {
        // 经理: 仅本机构
        filter.Org = payload.currentUser.Org;
      }
    } else {
      throw ({ code: 403, message: "您的身份有误" });
    }

    if (!filter.status) {
      // 默认过滤掉已结束和已取消的课程
      filter.status = { $nin: ['finished', 'cancelled'] };
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
      studentPayloadChecker(payload);
      // 学生只能查看自己报名的课程或开放的课程
      if (item.status !== 'enrolling' && item.status !== 'ongoing') {
        // 检查是否已报名
        const enrolled = await StudentCourseModel.findOne({
          Student: payload.currentStudent._id,
          Course: _id
        });

        if (!enrolled) {
          throw ({ code: 403, message: "您无权查看此课程" });
        }
      }
    } else if (payload.accountType === 'User') {
      userPayloadChecker(payload);
      if (!payload.isAdmin) {
        // 非管理员必须是 manager 才能查看课程
        if (item.Org.toString() !== payload.currentUser.Org.toString()) {
          throw ({ code: 403, message: "您无权查看此课程" })
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
    userPayloadChecker(payload);

    // 只有管理员或任课老师可以创建课程
    if (payload.currentUser.roleTemp !== 'manager') {
      throw ({ code: 403, message: "只有管理员才能创建课程" });
    }

    // 验证关联项存在性
    if (!doc.Subject) {
      throw ({ code: 400, message: "课程必须关联科目" });
    }
    const subject = await SubjectModel.findById(doc.Subject);
    if (!subject) {
      throw ({ code: 404, message: "指定的科目不存在" });
    }

    const room = await RoomModel.findById(doc.defaultRoom);
    if (!room) {
      throw ({ code: 404, message: "指定的教室不存在" });
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
    // 验证权限
    userPayloadChecker(payload);
    if (payload.currentUser?.roleTemp !== 'manager') {
      throw ({ code: 403, message: "您无权修改此课程" });
    }

    // 验证目标课程是否存在
    const targetCourse = await CourseModel.findById(_id);
    if (!targetCourse) {
      throw ({ code: 404, message: '课程不存在' });
    }

    // 权限：超级管理员可改所有课程；经理只能改本机构课程
    if (targetCourse.Org.toString() !== payload.currentUser.Org.toString()) {
      throw ({ code: 403, message: "需要本公司管理员的权限修改此课程" });
    }

    // 根据状态约束过滤可修改的字段
    // 检查是否尝试修改被锁定的字段

    // 检查状态流转限制：如果课程有学生报名(StudentCourse记录), 则不能将状态修改为cancelled
    if (doc.status === 'cancelled' && targetCourse.status !== 'cancelled') {
      const enrolledCount = await StudentCourseModel.countDocuments({
        Course: _id,
        status: { $in: ['active', 'finished'] } // 统计还在学或已完成的学生
      });

      if (enrolledCount > 0) {
        throw ({
          code: 400,
          message: `该课程有 ${enrolledCount} 名学生正在学习或已完成, 不能将状态修改为已取消(cancelled)。如需取消课程, 请先处理学生报名记录。`
        });
      }
    }

    doc.updatedBy = payload.currentUser._id; // 设置更新者
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
// const remove = async (payload = {}, _id, options) => {
//   try {
//     // 验证目标课程是否存在
//     const targetCourse = await CourseModel.findById(_id);
//     if (!targetCourse) {
//       throw ({ code: 404, message: '课程不存在' });
//     }

//     const existRelatedStudentCourse = await StudentCourseModel.findOne({ Course: _id });
//     if (existRelatedStudentCourse) {
//       throw ({ code: 400, message: "无法删除，此课程有学生报名关联" });
//     }

//     // 验证权限
//     if (payload.accountType !== 'User') {
//       throw ({ code: 403, message: "您无权删除课程" });
//     }

//     if (!payload.isAdmin) {
//       if (payload.currentUser.roleTemp !== 'manager') {
//         // 普通老师只能删除自己主讲的课程
//         if (targetCourse.mainTeacher.toString() !== payload.currentUser._id.toString()) {
//           throw ({ code: 403, message: "您只能删除自己主讲的课程" });
//         }
//       }
//       if (targetCourse.Org.toString() !== payload.currentUser.Org.toString()) {
//         throw ({ code: 403, message: "您无权删除此课程" });
//       }
//     }

//     // 物理删除
//     const { item } = await DAO.remove(CourseModel, _id, options);
//     return { item };

//   } catch (e) {
//     console.error('CourseDao delete error:', e);
//     throw e;
//   }
// }

module.exports = {
  CourseDAO: {
    list,
    detail,
    add,
    edit,
    // remove,
  },
  CourseModel, CourseDOC, CourseEnums,
}