const DAO = require('@models/DAO');
const { LessonAttendanceModel, LessonAttendanceEnums, LessonAttendanceDOC } = require('./LessonAttendance.model');
const { LessonModel } = require('@models/school/lesson/Lesson.dao');
const { StudentModel } = require('@models/school/student/Student.dao');
const { StudentCourseModel } = require('@models/school/student/StudentCourse.dao');
const { StudentPackModel } = require('@models/school/student/StudentPack.dao');

const list = async (payload = {}, filter, options) => {
  try {
    // 验证权限
    if (payload.accountType === 'Student') {
      // 学生只能查看自己的考勤记录
      const student = payload.currentStudent;
      if (!student) {
        throw ({ code: 403, message: "学生信息无效" });
      }
      filter.Student = student._id;
    } else if (payload.accountType === 'User') {
      if (!payload.isAdmin) {
        if (payload.currentUser?.roleTemp !== 'manager') {
          // 老师只能查看自己授课课程的考勤
          filter.$or = [
            { 'Lesson.teacher': payload.currentUser._id },
            { 'Lesson.Course.mainTeacher': payload.currentUser._id },
            { 'Lesson.Course.assistantTeacher': payload.currentUser._id }
          ];
        }
        filter.Org = payload.currentUser.Org;
      }
    } else {
      throw ({ code: 403, message: "您的身份有误" });
    }

    const { items, total } = await DAO.list(LessonAttendanceModel, filter, options);
    return { items, total };
  } catch (e) {
    console.error('LessonAttendanceDao list error:', e);
    throw e;
  }
};

const detail = async (payload = {}, _id, options) => {
  try {
    const { item } = await DAO.detail(LessonAttendanceModel, _id, options);

    if (!item) {
      throw ({ code: 404, message: "此 课堂考勤 数据已不存在" });
    }

    // 验证权限
    if (payload.accountType === 'Student') {
      // 学生只能查看自己的考勤记录
      const student = payload.currentStudent;
      if (!student || item.Student.toString() !== student._id.toString()) {
        throw ({ code: 403, message: "您无权查看此课堂考勤" });
      }
    } else if (payload.accountType === 'User') {
      if (!payload.isAdmin) {
        if (item.Org.toString() !== payload.currentUser?.Org.toString()) {
          throw ({ code: 403, message: "您无权查看此课堂考勤" });
        }
        // 老师只能查看自己授课课程的考勤
        if (payload.currentUser.roleTemp !== 'manager') {
          const lesson = await LessonModel.findById(item.Lesson);
          if (lesson.teacher && lesson.teacher.toString() !== payload.currentUser._id.toString()) {
            const course = await require('@models/school/course/Course.dao').CourseModel.findById(lesson.Course);
            if (course.mainTeacher.toString() !== payload.currentUser._id.toString() &&
                course.assistantTeacher.toString() !== payload.currentUser._id.toString()) {
              throw ({ code: 403, message: "您无权查看此课堂考勤" });
            }
          }
        }
      }
    } else {
      throw ({ code: 403, message: "您的身份有误" });
    }

    return { item };
  } catch (e) {
    console.error('LessonAttendanceDao detail error:', e);
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
      throw ({ code: 403, message: "您无权添加课堂考勤" });
    }

    // 只有管理员或任课老师可以创建课堂考勤
    if (!payload.isAdmin) {
      if (payload.currentUser?.roleTemp !== 'manager') {
        throw ({ code: 403, message: "只有管理员或任课老师才能添加课堂考勤" });
      }
    }

    // 验证关联项存在性
    if (!doc.Lesson) {
      throw ({ code: 400, message: "考勤必须关联课程" });
    }
    const lesson = await LessonModel.findById(doc.Lesson);
    if (!lesson) {
      throw ({ code: 404, message: "指定的课程不存在" });
    }

    if (!doc.Student) {
      throw ({ code: 400, message: "考勤必须关联学生" });
    }
    const student = await StudentModel.findById(doc.Student);
    if (!student) {
      throw ({ code: 404, message: "指定的学生不存在" });
    }

    // 验证学生是否注册了该课程
    if (!doc.StudentCourse) {
      // 如果未提供学生课程关联，尝试自动查找
      const studentCourse = await StudentCourseModel.findOne({
        Student: doc.Student,
        Course: lesson.Course
      });

      if (!studentCourse) {
        throw ({ code: 400, message: "学生未报名此课程，无法创建考勤记录" });
      }
      doc.StudentCourse = studentCourse._id;
    } else {
      const studentCourse = await StudentCourseModel.findById(doc.StudentCourse);
      if (!studentCourse) {
        throw ({ code: 404, message: "指定的学生课程关联不存在" });
      }
    }

    // 设置机构和创建者
    doc.Org = payload.currentUser.Org;
    doc.createdBy = payload.currentUser._id;

    const { item } = await DAO.add(LessonAttendanceModel, doc, options);
    return { item };
  } catch (e) {
    console.error('LessonAttendanceDao create error:', e);
    throw e;
  }
};

const edit = async (payload = {}, _id, doc, options) => {
  try {
    // 验证目标课堂考勤是否存在
    const targetAttendance = await LessonAttendanceModel.findById(_id);
    if (!targetAttendance) {
      throw ({ code: 404, message: '课堂考勤不存在' });
    }

    // 验证权限
    if (payload.accountType !== 'User') {
      throw ({ code: 403, message: "您无权修改课堂考勤" });
    }

    if (!payload.isAdmin) {
      if (payload.currentUser?.roleTemp !== 'manager') {
        throw ({ code: 403, message: "只有管理员或任课老师才能修改课堂考勤" });
      }
      if (targetAttendance.Org.toString() !== payload.currentUser?.Org.toString()) {
        throw ({ code: 403, message: "您无权修改此课堂考勤" });
      }
    }

    // 特殊处理消课逻辑
    if (doc.lessonConsumed && !targetAttendance.lessonConsumed) {
      // 如果之前未消课而现在要消课，需要减少学生课包的剩余课时
      if (targetAttendance.StudentPack) {
        const studentPack = await StudentPackModel.findById(targetAttendance.StudentPack);
        if (studentPack && studentPack.remainingLesson > 0) {
          studentPack.remainingLesson -= 1;
          studentPack.usedLesson += 1;
          if (studentPack.remainingLesson <= 0) {
            studentPack.status = 'exhausted';
          }
          await studentPack.save();
        }
      }
    }

    targetAttendance.set(doc);
    const { item } = await DAO.edit(targetAttendance, options);

    return { item };

  } catch (e) {
    console.error('LessonAttendanceDao update error:', e);
    throw e;
  }
};

// LessonAttendance 不能被删除 remove 只需要在 把 isActive 修改为 false

module.exports = {
  LessonAttendanceDAO: {
    list,
    detail,
    add,
    edit,
  },
  LessonAttendanceModel, LessonAttendanceDOC, LessonAttendanceEnums,
}