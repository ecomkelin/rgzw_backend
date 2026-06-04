const DAO = require('@models/DAO');
const { LessonModel, LessonEnums, LessonDOC } = require('./Lesson.model');
const { CourseModel } = require('@models/school/course/Course.dao');
const { UserModel } = require('@models/organization/structure/User.dao');
const { RoomModel } = require('@models/organization/physical/Room.dao');

const list = async (payload = {}, filter, options) => {
  try {
    // 验证权限
    if (payload.accountType === 'Student') {
      // 学生只能查看自己参加的课程的课次
      const student = payload.currentStudent;
      if (!student) {
        throw ({ code: 403, message: "学生信息无效" });
      }
      // 通过学生课程关联获取相关课程ID
      const studentCourses = await require('@models/school/student/StudentCourse.dao').StudentCourseModel.find({ Student: student._id });
      const courseIds = studentCourses.map(sc => sc.Course);
      filter.Course = { $in: courseIds };
    } else if (payload.accountType === 'User') {
      if (!payload.isAdmin) {
        if (payload.currentUser.roleTemp !== 'manager') {
          // 老师只能查看自己授课的课次
          filter.$or = [
            { teacher: payload.currentUser._id },
            { 'Course.mainTeacher': payload.currentUser._id },
            { 'Course.assistantTeacher': payload.currentUser._id }
          ];
        }
        filter.Org = payload.currentUser.Org;
      }
    } else {
      throw ({ code: 403, message: "您的身份有误" });
    }

    const { items, total } = await DAO.list(LessonModel, filter, options);
    return { items, total };
  } catch (e) {
    console.error('LessonDao list error:', e);
    throw e;
  }
};

const detail = async (payload = {}, _id, options) => {
  try {
    const { item } = await DAO.detail(LessonModel, _id, options);

    if (!item) {
      throw ({ code: 404, message: "此 课程 数据已不存在" });
    }

    // 验证权限
    if (payload.accountType === 'Student') {
      // 学生只能查看自己参加的课程的课次
      const student = payload.currentStudent;
      if (!student) {
        throw ({ code: 403, message: "学生信息无效" });
      }

      // 检查学生是否注册了该课程
      const studentCourse = await require('@models/school/student/StudentCourse.dao').StudentCourseModel.findOne({
        Student: student._id,
        Course: item.Course
      });

      if (!studentCourse) {
        throw ({ code: 403, message: "您无权查看此课程" });
      }
    } else if (payload.accountType === 'User') {
      if (!payload.isAdmin) {
        if (item.Org.toString() !== payload.currentUser.Org.toString()) {
          throw ({ code: 403, message: "您无权查看此课程" });
        }
        // 老师只能查看自己授课的课次
        if (payload.currentUser.roleTemp !== 'manager') {
          if (item.teacher && item.teacher.toString() !== payload.currentUser._id.toString()) {
            const course = await CourseModel.findById(item.Course);
            if (course.mainTeacher.toString() !== payload.currentUser._id.toString() &&
                course.assistantTeacher.toString() !== payload.currentUser._id.toString()) {
              throw ({ code: 403, message: "您无权查看此课程" });
            }
          }
        }
      }
    } else {
      throw ({ code: 403, message: "您的身份有误" });
    }

    return { item };
  } catch (e) {
    console.error('LessonDao detail error:', e);
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
        // 老师只能为自己授课的课程创建课次
        if (doc.teacher && doc.teacher.toString() !== payload.currentUser._id.toString()) {
          throw ({ code: 403, message: "您只能为自己的课程添加课次" });
        }
      }
    }

    // 验证关联项存在性
    if (!doc.Course) {
      throw ({ code: 400, message: "课程必须关联课程" });
    }
    const course = await CourseModel.findById(doc.Course);
    if (!course) {
      throw ({ code: 404, message: "指定的课程不存在" });
    }

    if (doc.teacher) {
      const teacher = await UserModel.findById(doc.teacher);
      if (!teacher) {
        throw ({ code: 404, message: "指定的老师不存在" });
      }
    }

    if (doc.classroom) {
      const room = await RoomModel.findById(doc.classroom);
      if (!room) {
        throw ({ code: 404, message: "指定的教室不存在" });
      }
    }

    // 设置机构和创建者
    doc.Org = payload.currentUser.Org;
    doc.createdBy = payload.currentUser._id;

    const { item } = await DAO.add(LessonModel, doc, options);
    return { item };
  } catch (e) {
    console.error('LessonDao create error:', e);
    throw e;
  }
};

const edit = async (payload = {}, _id, doc, options) => {
  try {
    // 验证目标课程是否存在
    const targetLesson = await LessonModel.findById(_id);
    if (!targetLesson) {
      throw ({ code: 404, message: '课程不存在' });
    }

    // 验证权限
    if (payload.accountType !== 'User') {
      throw ({ code: 403, message: "您无权修改课程" });
    }

    if (!payload.isAdmin) {
      if (payload.currentUser.roleTemp !== 'manager') {
        // 老师只能修改自己授课的课次
        if (targetLesson.teacher && targetLesson.teacher.toString() !== payload.currentUser._id.toString()) {
          const course = await CourseModel.findById(targetLesson.Course);
          if (course.mainTeacher.toString() !== payload.currentUser._id.toString() &&
              course.assistantTeacher.toString() !== payload.currentUser._id.toString()) {
            throw ({ code: 403, message: "您只能修改自己授课的课次" });
          }
        }
      }
      if (targetLesson.Org.toString() !== payload.currentUser.Org.toString()) {
        throw ({ code: 403, message: "您无权修改此课程" });
      }
    }

    targetLesson.set(doc);
    const { item } = await DAO.edit(targetLesson, options);

    return { item };

  } catch (e) {
    console.error('LessonDao update error:', e);
    throw e;
  }
};

// Lesson 不能被删除 remove 只需要在 把 isActive 修改为 false

module.exports = {
  LessonDAO: {
    list,
    detail,
    add,
    edit,
  },
  LessonModel, LessonDOC, LessonEnums,
}