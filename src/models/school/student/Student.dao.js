const DAO = require('@models/DAO');
const { StudentModel, StudentEnums, StudentDOC } = require('./Student.model');
const { AccountModel } = require('@models/authorization/Account.dao');
const { OrgModel } = require('@models/organization/structure/Org.dao');
const { userPayloadChecker, studentPayloadChecker, payloadChecker } = require('@utils/payloadChecker');

const list = async (payload = {}, filter, options) => {
  try {
    // 验证权限, 学生账号 只能用populate查看自己的学生信息，
    // 普通用户账号只能查看自己机构的学生信息
    userPayloadChecker(payload);

    if (!payload.isAdmin) {
      filter.Org = payload.currentUser.Org;
    }
    if (payload.currentUser.roleTemp !== 'manager') {
      throw ({ code: 403, message: "您无权查看学生列表" });
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
      studentPayloadChecker(payload);
      if (item._id.toString() !== payload.currentStudent._id.toString()) {
        throw ({ code: 403, message: "您无权查看此学生" })
      }
    } else if (payload.accountType === 'User') {
      userPayloadChecker(payload);
      if (!payload.isAdmin) {
        if (item.Org !== payload.currentUser.Org) {
          throw ({ code: 403, message: "您无权查看此学生" })
        }
      }
      /** ** 普通用户 查看学生的规则 比如 自己上课的学生 */
      if (payload.currentUser.roleTemp !== 'manager') {
        throw ({ code: 403, message: "您无权查看学生" })
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
    userPayloadChecker(payload);
    // 只有管理员可以创建学生
    if (payload.currentUser.roleTemp !== 'manager') {
      throw ({ code: 403, message: "只有管理员才能创建学生" });
    }
    doc.Org = payload.currentUser.Org;

    if (!doc.displayName) doc.displayName = doc.name;
    if (!doc.Nation) delete doc.Nation;
    if (!doc.Province) delete doc.Province;
    if (!doc.City) delete doc.City;
    if (!doc.Area) delete doc.Area;

    if (!doc.Account) {
      throw ({ code: 400, message: "学生必须加入 账号信息" });
    }
    const activeAccount = await AccountModel.countDocuments({ _id: doc.Account, isActive: true, accountType: 'Student' });
    if (activeAccount === 0) {
      throw ({ code: 404, message: "没有此账号 或者 被禁用 或者 账号类型不是Student" });
    }
    const activeOrg = await OrgModel.countDocuments({ _id: doc.Org, isActive: true });
    if (activeOrg === 0) {
      throw ({ code: 400, message: "所属机构没有找到或者被禁用" });
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
    if (payload.accountType === 'Student') {
      studentPayloadChecker(payload);
      if (payload.currentStudent._id.toString() !== targetStudent._id.toString()) {
        throw ({ code: 403, message: "没有权限修改其他学生信息" });
      }
      if (doc.isActive === false) {
        throw ({ code: 403, message: "不能修改 禁用信息" });
      }
    } else if (payload.accountType === 'User') {
      userPayloadChecker(payload);
      doc.updatedBy = payload.currentUser._id;
      if (payload.currentUser.roleTemp !== 'manager') {
        throw ({ code: 403, message: "没有权限修改学生信息" });
      }
      if (payload.currentUser.Org.toString() !== targetStudent.Org.toString()) {
        throw ({ code: 403, message: "需要本公司管理员的权限 才能修改此学生" });
      }
    } else {
      throw ({ code: 403, message: "您的身份出现了错误" });
    }

    if (!doc.displayName) doc.displayName = doc.name;
    if (!doc.Nation) delete doc.Nation;
    if (!doc.Province) delete doc.Province;
    if (!doc.City) delete doc.City;
    if (!doc.Area) delete doc.Area;

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