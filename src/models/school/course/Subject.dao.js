const DAO = require('@models/DAO');
const { CourseModel } = require('./Course.model');
const { SubjectModel, SubjectDOC, SubjectEnums } = require('./Subject.model');
const { userPayloadChecker, studentPayloadChecker, payloadChecker } = require('@utils/payloadChecker');

const list = async (payload = {}, filter, options) => {
  try {
    // 验证权限
    if (payload.accountType === 'Student') {
      studentPayloadChecker(payload);
      // 学生只能查看激活且展示的科目
      filter.isShow = true;
      filter.isActive = true;
    } else if (payload.accountType === 'User') {
      userPayloadChecker(payload);
      if (!payload.isAdmin) {
        filter.Org = payload.currentUser.Org;
      }
    } else {
      throw ({ code: 403, message: "您的身份有误" });
    }

    const { items, total } = await DAO.list(SubjectModel, filter, options);
    return { items, total };
  } catch (e) {
    console.error('SubjectDao list error:', e);
    throw e;
  }
};

const detail = async (payload = {}, _id, options) => {
  try {
    const { item } = await DAO.detail(SubjectModel, _id, options);

    if (!item) {
      throw ({ code: 404, message: "此 科目 数据已不存在" });
    }

    // 验证权限
    if (payload.accountType === 'Student') {
      studentPayloadChecker(payload);
      // 学生只能查看激活且展示的科目
      if (!item.isShow || !item.isActive) {
        throw ({ code: 403, message: "您无权查看此科目" });
      }
    } else if (payload.accountType === 'User') {
      userPayloadChecker(payload);
      if (!payload.isAdmin) {
        if (item.Org.toString() !== payload.currentUser.Org.toString()) {
          throw ({ code: 403, message: "您无权查看此科目" })
        }
      }
    } else {
      throw ({ code: 403, message: "您的身份有误" })
    }

    return { item };
  } catch (e) {
    console.error('SubjectDao detail error:', e);
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
    // 只有管理员可以创建科目
    if (payload.currentUser.roleTemp !== 'manager') {
      throw ({ code: 403, message: "只有管理员才能创建科目" });
    }

    doc.Org = payload.currentUser.Org;
    doc.createdBy = payload.currentUser._id;

    const { item } = await DAO.add(SubjectModel, doc, options);
    return { item };
  } catch (e) {
    console.error('SubjectDao create error:', e);
    throw e;
  }
};

const edit = async (payload = {}, _id, doc, options) => {
  try {
    // 验证权限
    userPayloadChecker(payload);
    if (payload.currentUser.roleTemp !== 'manager') {
      throw ({ code: 403, message: "只有管理员才能修改科目" });
    }

    // 验证目标科目是否存在
    const targetSubject = await SubjectModel.findById(_id);
    if (!targetSubject) {
      throw ({ code: 404, message: '科目不存在' });
    }

    if (targetSubject.Org.toString() !== payload.currentUser.Org.toString()) {
      throw ({ code: 403, message: "您需要本公司管理员的权限 修改此科目" });
    }

    doc.updatedBy = payload.currentUser._id;
    targetSubject.set(doc);
    const { item } = await DAO.edit(targetSubject, options);

    return { item };

  } catch (e) {
    console.error('SubjectDao update error:', e);
    throw e;
  }
};

// 删除
// const remove = async (payload = {}, _id, options) => {
//   try {
//     userPayloadChecker(payload);
//     // 验证目标科目是否存在
//     const targetSubject = await SubjectModel.findById(_id);
//     if (!targetSubject) {
//       throw ({ code: 404, message: '科目不存在' });
//     }

//     if (!payload.isAdmin) {
//       if (payload.currentUser.roleTemp !== 'manager') {
//         throw ({ code: 403, message: "只有管理员才能删除科目" });
//       }
//       if (targetSubject.Org.toString() !== payload.currentUser.Org.toString()) {
//         throw ({ code: 403, message: "您无权删除此科目" });
//       }
//     }

//     // 验证是否有课程关联
//     const existRelatedCourse = await CourseModel.countDocuments({ Subject: _id });
//     if (existRelatedCourse > 0) {
//       throw ({ code: 400, message: "无法删除，此数据有相关课程关联" });
//     }

//     const { item } = await DAO.remove(SubjectModel, _id, options);
//     return { item };

//   } catch (e) {
//     console.error('SubjectDao delete error:', e);
//     throw e;
//   }
// }

module.exports = {
  SubjectDAO: {
    list,
    detail,
    add,
    edit,
    // remove
  },
  SubjectModel,
  SubjectDOC,
  SubjectEnums
}