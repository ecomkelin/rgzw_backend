const DAO = require('@models/DAO');
const { LessonWorkModel, LessonWorkDOC } = require('./LessonWork.model');
const { LessonModel } = require('@models/school/lesson/Lesson.dao');
const { StudentModel } = require('@models/school/student/Student.dao');
const { SubjectModel } = require('@models/school/course/Subject.dao');
const { CourseModel } = require('@models/school/course/Course.dao');

const list = async (payload = {}, filter, options) => {
  try {
    // 验证权限
    if (payload.accountType === 'Student') {
      // 学生只能查看自己的作品
      const student = payload.currentStudent;
      if (!student) {
        throw ({ code: 403, message: "学生信息无效" });
      }
      filter.Student = student._id;
    } else if (payload.accountType === 'User') {
      if (!payload.isAdmin) {
        if (payload.currentUser.roleTemp !== 'manager') {
          // 老师只能查看自己授课课程的作品
          filter.$or = [
            { 'Lesson.Course.mainTeacher': payload.currentUser._id },
            { 'Lesson.Course.assistantTeacher': payload.currentUser._id }
          ];
        }
        filter.Org = payload.currentUser.Org;
      }
    } else {
      throw ({ code: 403, message: "您的身份有误" });
    }

    const { items, total } = await DAO.list(LessonWorkModel, filter, options);
    return { items, total };
  } catch (e) {
    console.error('LessonWorkDao list error:', e);
    throw e;
  }
};

const detail = async (payload = {}, _id, options) => {
  try {
    const { item } = await DAO.detail(LessonWorkModel, _id, options);

    if (!item) {
      throw ({ code: 404, message: "此 课堂作品 数据已不存在" });
    }

    // 验证权限
    if (payload.accountType === 'Student') {
      // 学生只能查看自己的作品
      const student = payload.currentStudent;
      if (!student || item.Student.toString() !== student._id.toString()) {
        throw ({ code: 403, message: "您无权查看此课堂作品" });
      }
    } else if (payload.accountType === 'User') {
      if (!payload.isAdmin) {
        if (item.Org.toString() !== payload.currentUser.Org.toString()) {
          throw ({ code: 403, message: "您无权查看此课堂作品" });
        }
      }
    } else {
      throw ({ code: 403, message: "您的身份有误" });
    }

    return { item };
  } catch (e) {
    console.error('LessonWorkDao detail error:', e);
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
      throw ({ code: 403, message: "您无权添加课堂作品" });
    }

    // 只有管理员、任课老师或学生本人可以添加课堂作品
    if (!payload.isAdmin) {
      if (payload.currentUser.roleTemp !== 'manager') {
        // 老师或学生本人可以添加
        const lesson = await LessonModel.findById(doc.Lesson);
        if (!lesson) {
          throw ({ code: 404, message: "指定的课程不存在" });
        }

        const course = await CourseModel.findById(lesson.Course);
        if (!course) {
          throw ({ code: 404, message: "指定的课程不存在" });
        }

        // 检查是否为老师或学生本人
        if (payload.accountType === 'User') {
          // 老师可以添加
          if (course.mainTeacher.toString() !== payload.currentUser._id.toString() &&
              course.assistantTeacher.toString() !== payload.currentUser._id.toString()) {
            throw ({ code: 403, message: "您无权为此课程添加作品" });
          }
        } else if (payload.accountType === 'Student') {
          // 学生本人可以添加
          if (!payload.currentStudent || doc.Student.toString() !== payload.currentStudent._id.toString()) {
            throw ({ code: 403, message: "您只能添加自己的作品" });
          }
        } else {
          throw ({ code: 403, message: "您的身份有误" });
        }
      }
    }

    // 验证关联项存在性
    if (!doc.Lesson) {
      throw ({ code: 400, message: "作品必须关联课程" });
    }
    const lesson = await LessonModel.findById(doc.Lesson);
    if (!lesson) {
      throw ({ code: 404, message: "指定的课程不存在" });
    }

    if (!doc.Student) {
      throw ({ code: 400, message: "作品必须关联学生" });
    }
    const student = await StudentModel.findById(doc.Student);
    if (!student) {
      throw ({ code: 404, message: "指定的学生不存在" });
    }

    // 如果未提供Subject或Course，则从Lesson中复制
    if (!doc.Subject) {
      const lessonDoc = await LessonModel.findById(doc.Lesson).populate('Course');
      if (lessonDoc && lessonDoc.Course) {
        doc.Subject = lessonDoc.Course.Subject;
        doc.Course = lessonDoc.Course._id;
      }
    }

    // 设置机构和创建者
    doc.Org = payload.currentUser.Org;
    if (payload.currentUser) {
      doc.createdBy = payload.currentUser._id;
    }

    const { item } = await DAO.add(LessonWorkModel, doc, options);
    return { item };
  } catch (e) {
    console.error('LessonWorkDao create error:', e);
    throw e;
  }
};

const edit = async (payload = {}, _id, doc, options) => {
  try {
    // 验证目标课堂作品是否存在
    const targetWork = await LessonWorkModel.findById(_id);
    if (!targetWork) {
      throw ({ code: 404, message: '课堂作品不存在' });
    }

    // 验证权限
    if (payload.accountType !== 'User') {
      if (payload.accountType === 'Student') {
        // 学生只能修改自己的作品
        if (targetWork.Student.toString() !== payload.currentStudent._id.toString()) {
          throw ({ code: 403, message: "您无权修改此课堂作品" });
        }
      } else {
        throw ({ code: 403, message: "您无权修改课堂作品" });
      }
    } else {
      if (!payload.isAdmin) {
        if (payload.currentUser.roleTemp !== 'manager') {
          // 老师只能修改自己课程的作品或学生本人修改
          const lesson = await LessonModel.findById(targetWork.Lesson);
          const course = await CourseModel.findById(lesson.Course);

          if (course.mainTeacher.toString() !== payload.currentUser._id.toString() &&
              course.assistantTeacher.toString() !== payload.currentUser._id.toString()) {
            // 检查是否为学生本人
            if (payload.currentStudent && targetWork.Student.toString() === payload.currentStudent._id.toString()) {
              // 学生可以修改自己的作品
            } else {
              throw ({ code: 403, message: "您无权修改此课堂作品" });
            }
          }
        }
        if (targetWork.Org.toString() !== payload.currentUser.Org.toString()) {
          throw ({ code: 403, message: "您无权修改此课堂作品" });
        }
      }
    }

    targetWork.set(doc);
    const { item } = await DAO.edit(targetWork, options);

    return { item };

  } catch (e) {
    console.error('LessonWorkDao update error:', e);
    throw e;
  }
};

// LessonWork 不能被删除 remove 只需要在 把 isActive 修改为 false

module.exports = {
  LessonWorkDAO: {
    list,
    detail,
    add,
    edit,
  },
  LessonWorkModel, LessonWorkDOC,
}