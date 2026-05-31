const DAO = require('@models/DAO');
const { StudentPackModel, StudentPackEnums, StudentPackDOC } = require('./StudentPack.model');
const { AccountModel } = require('@models/authorization/Account.dao');
const { StudentModel } = require('@models/school/student/Student.dao');
const { OrderPackModel } = require('@models/pack/OrderPack.dao');

const list = async (payload = {}, filter, options) => {
  try {
    // 验证权限
    if (payload.accountType === 'Student') {
      // 学生只能查看自己的课包
      const student = payload.currentStudent;
      if (!student) {
        throw ({ code: 403, message: "学生信息无效" });
      }
      filter.Student = student._id;
    } else if (payload.accountType === 'User') {
      if (!payload.isAdmin) {
        if (payload.currentUser?.roleTemp !== 'manager') {
          throw ({ code: 403, message: "您无权查看学生课包列表" });
        }
        filter.Org = payload.currentUser.Org;
      }
    } else {
      throw ({ code: 403, message: "您的身份有误" });
    }

    const { items, total } = await DAO.list(StudentPackModel, filter, options);
    return { items, total };
  } catch (e) {
    console.error('StudentPackDao list error:', e);
    throw e;
  }
};

const detail = async (payload = {}, _id, options) => {
  try {
    const { item } = await DAO.detail(StudentPackModel, _id, options);

    if (!item) {
      throw ({ code: 404, message: "此 学生课包 数据已不存在" });
    }

    // 验证权限
    if (payload.accountType === 'Student') {
      // 学生只能查看自己的课包
      const student = payload.currentStudent;
      if (!student || item.Student.toString() !== student._id.toString()) {
        throw ({ code: 403, message: "您无权查看此学生课包" });
      }
    } else if (payload.accountType === 'User') {
      if (!payload.isAdmin) {
        if (item.Org.toString() !== payload.currentUser?.Org.toString()) {
          throw ({ code: 403, message: "您无权查看此学生课包" });
        }
      }
    } else {
      throw ({ code: 403, message: "您的身份有误" });
    }

    return { item };
  } catch (e) {
    console.error('StudentPackDao detail error:', e);
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
      throw ({ code: 403, message: "您无权添加学生课包" });
    }

    // 只有管理员可以添加学生课包
    if (!payload.isAdmin) {
      if (payload.currentUser?.roleTemp !== 'manager') {
        throw ({ code: 403, message: "只有管理员才能添加学生课包" });
      }
    }

    // 验证关联项存在性
    if (!doc.Account) {
      throw ({ code: 400, message: "必须指定家长账户" });
    }
    const account = await AccountModel.findById(doc.Account);
    if (!account) {
      throw ({ code: 404, message: "指定的家长账户不存在" });
    }

    if (!doc.Student) {
      throw ({ code: 400, message: "必须指定学生" });
    }
    const student = await StudentModel.findById(doc.Student);
    if (!student) {
      throw ({ code: 404, message: "指定的学生不存在" });
    }

    if (!doc.Order) {
      throw ({ code: 400, message: "必须指定订单" });
    }
    const order = await OrderPackModel.findById(doc.Order);
    if (!order) {
      throw ({ code: 404, message: "指定的订单不存在" });
    }

    // 设置课包的剩余课时
    if (!doc.remainingLesson && doc.totalLesson !== undefined) {
      doc.remainingLesson = doc.totalLesson;
    }

    // 设置机构和创建者
    doc.Org = payload.currentUser.Org;
    doc.createdBy = payload.currentUser._id;

    const { item } = await DAO.add(StudentPackModel, doc, options);
    return { item };
  } catch (e) {
    console.error('StudentPackDao create error:', e);
    throw e;
  }
};

const edit = async (payload = {}, _id, doc, options) => {
  try {
    // 验证目标学生课包是否存在
    const targetStudentPack = await StudentPackModel.findById(_id);
    if (!targetStudentPack) {
      throw ({ code: 404, message: '学生课包不存在' });
    }

    // 验证权限
    if (payload.accountType !== 'User') {
      throw ({ code: 403, message: "您无权修改学生课包" });
    }

    if (!payload.isAdmin) {
      if (payload.currentUser?.roleTemp !== 'manager') {
        throw ({ code: 403, message: "只有管理员才能修改学生课包" });
      }
      if (targetStudentPack.Org.toString() !== payload.currentUser?.Org.toString()) {
        throw ({ code: 403, message: "您无权修改此学生课包" });
      }
    }

    targetStudentPack.set(doc);
    const { item } = await DAO.edit(targetStudentPack, options);

    return { item };

  } catch (e) {
    console.error('StudentPackDao update error:', e);
    throw e;
  }
};

// StudentPack 不能被删除 remove 只需要在 把 isActive 修改为 false

module.exports = {
  StudentPackDAO: {
    list,
    detail,
    add,
    edit,
  },
  StudentPackModel, StudentPackDOC, StudentPackEnums,
}