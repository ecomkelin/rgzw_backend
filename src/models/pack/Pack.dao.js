const DAO = require('@models/DAO');
const { PackModel, PackEnums, PackDOC } = require('./Pack.model');
const { OrderPackModel } = require('./OrderPack.model');
const { userPayloadChecker, studentPayloadChecker, payloadChecker } = require('@utils/payloadChecker');

const list = async (payload = {}, filter, options) => {
  try {
    if (payload.accountType === 'User') {
      userPayloadChecker(payload);
      if (!payload.isAdmin) {
        filter.Org = payload.currentUser?.Org;
      }
    } else if (payload.accountType === 'Student') {
      studentPayloadChecker(payload);
      filter.isActive = true;
    } else {
      throw ({ code: 403, message: "您的身份有误" });
    }
    // 学生用户 

    const { items, total } = await DAO.list(PackModel, filter, options);
    return { items, total };
  } catch (e) {
    console.error('PackDao list error:', e);
    throw e;
  }
};

const detail = async (payload = {}, _id, options) => {
  try {
    const { item } = await DAO.detail(PackModel, _id, options);

    if (!item) {
      throw ({ code: 404, message: "此 课包 数据已不存在" });
    }

    // 验证权限
    if (payload.accountType === 'User') {
      userPayloadChecker(payload);
      if (!payload.isAdmin) {
        if (item.Org.toString() !== payload.currentUser.Org.toString()) {
          throw ({ code: 403, message: "您无权查看此课包" })
        }
      }
    } else if (payload.accountType === 'Student') {
      studentPayloadChecker(payload);
      if (item.isActive !== true) {
        throw ({ code: 403, message: "您无权查看此课包" })
      }
      if (item.Org.toString() !== payload.currentStudent.Org.toString()) {
        throw ({ code: 403, message: "您无权查看此课包" })
      }
    } else {
      throw ({ code: 403, message: "您的身份有误" });
    }

    return { item };
  } catch (e) {
    console.error('PackDao detail error:', e);
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
    // 只有管理员可以创建课包
    if (!payload.isAdmin) {
      if (payload.currentUser.roleTemp !== 'manager') {
        throw ({ code: 403, message: "只有管理员才能创建课包" });
      }
    }

    doc.Org = payload.currentUser.Org;
    doc.createdBy = payload.currentUser._id;

    const { item } = await DAO.add(PackModel, doc, options);
    return { item };
  } catch (e) {
    console.error('PackDao create error:', e);
    throw e;
  }
};

const edit = async (payload = {}, _id, doc, options) => {
  try {
    userPayloadChecker(payload);
    // 验证目标课包是否存在
    const targetPack = await PackModel.findById(_id);
    if (!targetPack) {
      throw ({ code: 404, message: '课包不存在' });
    }

    // 只有管理员可以修改课包
    if (!payload.isAdmin) {
      if (payload.currentUser.roleTemp !== 'manager') {
        throw ({ code: 403, message: "只有管理员才能修改课包" });
      }
      if (targetPack.Org.toString() !== payload.currentUser.Org.toString()) {
        throw ({ code: 403, message: "您无权修改此非本公司的课包" });
      }
    }

    doc.updatedBy = payload.currentUser._id;
    targetPack.set(doc);
    const { item } = await DAO.edit(targetPack, options);

    return { item };

  } catch (e) {
    console.error('PackDao update error:', e);
    throw e;
  }
};

// 删除
const remove = async (payload, _id, options) => {
  try {
    userPayloadChecker(payload);

    // 验证目标课包是否存在
    const targetPack = await PackModel.findById(_id);
    if (!targetPack) {
      throw ({ code: 404, message: '课包不存在' });
    }

    // 只有管理员可以删除课包
    if (!payload.isAdmin) {
      if (payload.currentUser.roleTemp !== 'manager') {
        throw ({ code: 403, message: "只有管理员才能删除课包" });
      }
      if (targetPack.Org.toString() !== payload.currentUser.Org.toString()) {
        throw ({ code: 403, message: "您无权删除此非本公司的课包" });
      }
    }

    // 删除课包前，检查是否有订单关联
    const existRelatedOrderPack = await OrderPackModel.countDocuments({ Pack: _id });
    if (existRelatedOrderPack > 0) {
      throw ({ code: 400, message: "无法删除，此课包有相关订单关联" });
    }

    const { item } = await DAO.remove(PackModel, _id, options);
    return { item };

  } catch (e) {
    console.error('PackDao delete error:', e);
    throw e;
  }
};

module.exports = {
  PackDAO: {
    list,
    detail,
    add,
    edit,
    remove,
  },
  PackModel, PackDOC, PackEnums,
}