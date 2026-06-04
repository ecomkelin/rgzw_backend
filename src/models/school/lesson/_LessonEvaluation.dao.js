const DAO = require('@models/DAO');
const { LessonEvaluationModel, LessonEvaluationEnums, LessonEvaluationDOC } = require('./LessonEvaluation.model');
const { LessonModel } = require('@models/school/lesson/Lesson.dao');
const { StudentModel } = require('@models/school/student/Student.dao');
const { UserModel } = require('@models/organization/structure/User.dao');

const list = async (payload = {}, filter, options) => {
  try {
    // 验证权限
    if (payload.accountType === 'Student') {
      // 学生只能查看自己的评价
      const student = payload.currentStudent;
      if (!student) {
        throw ({ code: 403, message: "学生信息无效" });
      }
      filter.Student = student._id;
    } else if (payload.accountType === 'User') {
      if (!payload.isAdmin) {
        if (payload.currentUser.roleTemp !== 'manager') {
          // 老师只能查看自己评价的或自己授课课程的评价
          filter.$or = [
            { Teacher: payload.currentUser._id },
            { 'Lesson.Course.mainTeacher': payload.currentUser._id },
            { 'Lesson.Course.assistantTeacher': payload.currentUser._id }
          ];
        }
        filter.Org = payload.currentUser.Org;
      }
    } else {
      throw ({ code: 403, message: "您的身份有误" });
    }

    const { items, total } = await DAO.list(LessonEvaluationModel, filter, options);
    return { items, total };
  } catch (e) {
    console.error('LessonEvaluationDao list error:', e);
    throw e;
  }
};

const detail = async (payload = {}, _id, options) => {
  try {
    const { item } = await DAO.detail(LessonEvaluationModel, _id, options);

    if (!item) {
      throw ({ code: 404, message: "此 课堂评价 数据已不存在" });
    }

    // 验证权限
    if (payload.accountType === 'Student') {
      // 学生只能查看自己的评价
      const student = payload.currentStudent;
      if (!student || item.Student.toString() !== student._id.toString()) {
        throw ({ code: 403, message: "您无权查看此课堂评价" });
      }
    } else if (payload.accountType === 'User') {
      if (!payload.isAdmin) {
        if (item.Org.toString() !== payload.currentUser.Org.toString()) {
          throw ({ code: 403, message: "您无权查看此课堂评价" });
        }
      }
    } else {
      throw ({ code: 403, message: "您的身份有误" });
    }

    return { item };
  } catch (e) {
    console.error('LessonEvaluationDao detail error:', e);
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
      throw ({ code: 403, message: "您无权添加课堂评价" });
    }

    // 只有管理员或任课老师可以添加课堂评价
    if (!payload.isAdmin) {
      if (payload.currentUser.roleTemp !== 'manager') {
        // 老师只能评价自己授课的课程
        if (!doc.Teacher || doc.Teacher.toString() !== payload.currentUser._id.toString()) {
          throw ({ code: 403, message: "您只能评价自己授课的课程" });
        }
      }
    }

    // 验证关联项存在性
    if (!doc.Lesson) {
      throw ({ code: 400, message: "评价必须关联课程" });
    }
    const lesson = await LessonModel.findById(doc.Lesson);
    if (!lesson) {
      throw ({ code: 404, message: "指定的课程不存在" });
    }

    if (!doc.Student) {
      throw ({ code: 400, message: "评价必须关联学生" });
    }
    const student = await StudentModel.findById(doc.Student);
    if (!student) {
      throw ({ code: 404, message: "指定的学生不存在" });
    }

    if (!doc.Teacher) {
      throw ({ code: 400, message: "评价必须关联评价老师" });
    }
    const teacher = await UserModel.findById(doc.Teacher);
    if (!teacher) {
      throw ({ code: 404, message: "指定的老师不存在" });
    }

    // 检查是否已存在评价（每节课每个学生只允许一个评价）
    const existing = await LessonEvaluationModel.findOne({
      Lesson: doc.Lesson,
      Student: doc.Student
    });
    if (existing) {
      throw ({ code: 400, message: "此课程此学生已有评价记录" });
    }

    // 设置机构和创建者
    doc.Org = payload.currentUser.Org;
    doc.createdBy = payload.currentUser._id;

    const { item } = await DAO.add(LessonEvaluationModel, doc, options);
    return { item };
  } catch (e) {
    console.error('LessonEvaluationDao create error:', e);
    throw e;
  }
};

const edit = async (payload = {}, _id, doc, options) => {
  try {
    // 验证目标课堂评价是否存在
    const targetEvaluation = await LessonEvaluationModel.findById(_id);
    if (!targetEvaluation) {
      throw ({ code: 404, message: '课堂评价不存在' });
    }

    // 验证权限
    if (payload.accountType !== 'User') {
      throw ({ code: 403, message: "您无权修改课堂评价" });
    }

    if (!payload.isAdmin) {
      if (payload.currentUser.roleTemp !== 'manager') {
        // 只有评价老师或管理员可以修改评价
        if (targetEvaluation.Teacher.toString() !== payload.currentUser._id.toString()) {
          throw ({ code: 403, message: "您无权修改此课堂评价" });
        }
      }
      if (targetEvaluation.Org.toString() !== payload.currentUser.Org.toString()) {
        throw ({ code: 403, message: "您无权修改此课堂评价" });
      }
    }

    targetEvaluation.set(doc);
    const { item } = await DAO.edit(targetEvaluation, options);

    return { item };

  } catch (e) {
    console.error('LessonEvaluationDao update error:', e);
    throw e;
  }
};

// LessonEvaluation 不能被删除 remove 只需要在 把 isActive 修改为 false

module.exports = {
  LessonEvaluationDAO: {
    list,
    detail,
    add,
    edit,
  },
  LessonEvaluationModel, LessonEvaluationDOC, LessonEvaluationEnums,
}