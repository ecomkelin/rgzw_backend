const { StudentModel, StudentEnums, StudentDOC } = require('./Student.model');
const DAO = require('@models/DAO');

const list = async (payload = {}, filter, options) => {
  try {
    // 验证权限
    if (payload.accountType !== 'User') {
      throw ({ code: 403, message: "您无权查看学生列表" });
    }
    if (!payload.isAdmin) {
      filter.Org = payload.currentUser.Org;
      if (payload.currentUser?.roleTemp !== 'manager') {
        throw ({ code: 403, message: "您无权查看学生列表" });
      }
    }

    const { items, total } = await DAO.list(StudentModel, filter, options);
    return { items, total };
  } catch (e) {
    console.error('StudentDao list error:', e);
    throw e;
  }
};

const detail = async (payload = {}, _id, options) => {
  try {
    const { item } = await DAO.detail(StudentModel, _id, options);

    if (!item) {
      throw ({ code: 404, message: "此 学生 数据已不存在" });
    }

    // 验证权限 - 管理员可以查看任何学生，普通用户只能查看自己的学生
    if (payload.accountType === 'Student') {
      if (item._id.toString() !== payload.currentStudent?.Student.toString()) {
        throw ({ code: 403, message: "您无权查看此学生" })
      }
    } else if (payload.accountType === 'User') {
      if (!payload.isAdmin) {
        if (item.Org !== payload.currentUser?.Org) {
          throw ({ code: 403, message: "您无权查看此学生" })
        }
      }
    } else {
      throw ({ code: 403, message: "您的身份有误" })
    }

    return { item };
  } catch (e) {
    console.error('StudentDao detail error:', e);
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
      throw ({ code: 403, message: "您无权添加学生" });
    }
    // 只有管理员可以创建学生
    if (!payload.isAdmin) {
      doc.Org = payload.currentUser.Org;
      if (payload.currentUser?.roleTemp !== 'manager') {
        throw ({ code: 403, message: "只有超级管理员才能创建学生" });
      }
    }

    const { item } = await DAO.add(StudentModel, doc, options);
    return { item };
  } catch (e) {
    console.error('StudentDao create error:', e);
    throw e;
  }
};

const edit = async (payload = {}, _id, doc, options) => {
  try {
    // 验证目标学生是否存在
    const targetStudent = await StudentModel.findById(_id);
    if (!targetStudent) {
      throw ({ code: 404, message: '学生不存在' });
    }

    // 只有管理员可以修改任何学生，普通用户只能修改自己的学生
    if (!payload.isAdmin) {
      if (payload.accountType === 'User') {
        if (payload.currentStudent?._id?.toString() !== targetStudent._id.toString()) {
          throw ({ code: 403, message: "没有权限修改此学生" });
        }
      } else if (payload.accountType === 'Student') {
        if (payload.currentUser?.Org.toString() !== targetStudent.Org.toString()) {
          throw ({ code: 403, message: "没有权限修改此学生" });
        }
        if (payload.currentUser.roleTemp !== 'manager') {
          throw ({ code: 403, message: "没有权限修改学生信息" });
        }
      } else {
        throw ({ code: 403, message: "您的身份出现了错误" });
      }
    }

    // 处理密码
    if (doc.password) {
      doc.passwordHash = doc.password;
      delete doc.password;
    }

    // const existing = await StudentModel.findOne({ $or: [{ identityID: doc.identityID }], _id: { $ne: _id } });
    // if (existing) {
    //   throw ({ code: 11000, message: '手机号或账号已被占用' });
    // }

    targetStudent.set(doc);
    const { item } = await DAO.edit(targetStudent, options);
    delete item.passwordHash; // 确保返回时不包含密码哈希字段

    return { item };

  } catch (e) {
    console.error('StudentSV update error:', e);
    throw e;
  }
};

// Student 不能被删除 remove 只需要在 把 isActive 修改为 false

module.exports = {
  StudentDAO: {
    list,
    detail,
    add,
    edit,
  },
  StudentModel, StudentDOC, StudentEnums,
}