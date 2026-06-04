const DAO = require('@models/DAO');
const { CourseModel, CourseEnums, CourseDOC } = require('./Course.model');
const { SubjectModel } = require('./Subject.model');
const { UserModel } = require('@models/organization/structure/User.model');
const { RoomModel } = require('@models/organization/physical/Room.model');
const { StudentCourseModel } = require('@models/school/student/StudentCourse.model');

const list = async (payload = {}, filter, options) => {
  try {
    // 验证权限
    if (payload.accountType === 'Student') {
      // 学生可以查看自己报名的课程或开放的课程
      filter.status = { $in: ['enrolling', 'ongoing'] }; // 只能查看正在招生或进行中的课程
    } else if (payload.accountType === 'User') {
      if (!payload.isAdmin) {
        if (payload.currentUser.roleTemp !== 'manager') {
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
      if (!payload.isAdmin) {
        if (item.Org.toString() !== payload.currentUser.Org.toString()) {
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
      if (payload.currentUser.roleTemp !== 'manager') {
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

    const room = await RoomModel.findById(doc.Room);
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

/**
 * 根据状态约束过滤可修改的字段
 *
 * 状态说明:
 * - 'draft' (草稿): 学生不可见, 主要信息可改
 * - 'enrolling' (招生中): 学生可见, 主要信息不可变, 状态和内容包装可变
 * - 'ongoing' (进行中): 学生可见, 主要信息不可变, 状态和内容包装可变
 * - 'finished' (已结束): 学生不可见, 全部字段不可变 (仅状态可改)
 * - 'cancelled' (已取消): 学生不可见, 全部字段不可变 (仅状态可改)
 *
 * @param {String} status - 当前课程状态
 * @param {Object} doc - 待更新的文档
 * @returns {Object} 过滤后的可更新文档
 */
const filterUpdatableFields = (status, doc) => {
  // 创建一个副本以避免修改原对象
  const filteredDoc = { ...doc };

  // 状态字段始终可以更新(允许状态流转)
  // 其他所有字段根据状态决定是否可改

  switch (status) {
    case 'draft':
      // 草稿状态: 所有字段都可以修改(除immutable字段)
      break;

    case 'enrolling':
    case 'ongoing':
      // 招生中/进行中: 主要信息不可变, 状态和内容包装可变
      // 主要信息(不可变): Subject, name, mainTeacher, startDate, totalSessions, maxStudents, price
      // 内容包装(可变): features, description, posterUrl, videoUrl, highlightVideoUrl
      // 排课相关(可变): endDate, scheduleRules, defaultRoom, assistantTeacher, frequency
      const lockedFields = [
        'Subject',           // 科目
        'name',              // 班级名称
        'mainTeacher',       // 主讲老师
        'startDate',         // 开班日期
        'totalSessions',     // 总课次
        'maxStudents',       // 最大学生数
        'price',             // 价格
      ];

      // 移除被锁定的字段(如果存在于doc中)
      lockedFields.forEach(field => {
        if (filteredDoc.hasOwnProperty(field)) {
          delete filteredDoc[field];
        }
      });
      break;

    case 'finished':
    case 'cancelled':
      // 已结束/已取消: 除了状态, 其他字段都不能修改
      const allLockedFields = [
        'Subject', 'name', 'mainTeacher', 'assistantTeacher',
        'startDate', 'endDate', 'totalSessions', 'frequency',
        'scheduleRules', 'defaultRoom', 'maxStudents', 'price',
        'publishDate', 'features', 'description', 'posterUrl',
        'videoUrl', 'highlightVideoUrl', 'isActive', 'sort',
      ];

      allLockedFields.forEach(field => {
        if (filteredDoc.hasOwnProperty(field)) {
          delete filteredDoc[field];
        }
      });
      break;

    default:
      // 未知状态, 拒绝所有修改
      return {};
  }

  return filteredDoc;
};

const edit = async (payload = {}, _id, doc, options) => {
  try {
    // 验证权限
    if (payload.accountType !== 'User') {
      throw ({ code: 403, message: "您无权修改课程" });
    }

    // 验证目标课程是否存在
    const targetCourse = await CourseModel.findById(_id);
    if (!targetCourse) {
      throw ({ code: 404, message: '课程不存在' });
    }

    // 只有超级管理员可以修改所有课程
    if (!payload.isAdmin) {
      throw ({ code: 403, message: "您无权修改此课程" });
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
const remove = async (payload = {}, _id, options) => {
  try {
    // 验证目标课程是否存在
    const targetCourse = await CourseModel.findById(_id);
    if (!targetCourse) {
      throw ({ code: 404, message: '课程不存在' });
    }

    const existRelatedStudentCourse = await StudentCourseModel.findOne({ Course: _id });
    if (existRelatedStudentCourse) {
      throw ({ code: 400, message: "无法删除，此课程有学生报名关联" });
    }

    // 验证权限
    if (payload.accountType !== 'User') {
      throw ({ code: 403, message: "您无权删除课程" });
    }

    if (!payload.isAdmin) {
      if (payload.currentUser.roleTemp !== 'manager') {
        // 普通老师只能删除自己主讲的课程
        if (targetCourse.mainTeacher.toString() !== payload.currentUser._id.toString()) {
          throw ({ code: 403, message: "您只能删除自己主讲的课程" });
        }
      }
      if (targetCourse.Org.toString() !== payload.currentUser.Org.toString()) {
        throw ({ code: 403, message: "您无权删除此课程" });
      }
    }

    // 物理删除
    const { item } = await DAO.remove(CourseModel, _id, options);
    return { item };

  } catch (e) {
    console.error('CourseDao delete error:', e);
    throw e;
  }
}

module.exports = {
  CourseDAO: {
    list,
    detail,
    add,
    edit,
    remove,
  },
  CourseModel, CourseDOC, CourseEnums,
}