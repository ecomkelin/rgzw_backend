const DAO = require('@models/DAO');
const { PackModel, PackEnums, PackDOC } = require('./Pack.model');

const list = async (payload = {}, filter, options) => {
  try {
    // 验证权限
    if (payload.accountType !== 'User') {
      throw ({ code: 403, message: "您无权查看课包列表" });
    }

    if (!payload.isAdmin) {
      if (payload.currentUser?.roleTemp !== 'manager') {
        throw ({ code: 403, message: "您无权查看课包列表" });
      }
      filter.Org = payload.currentUser.Org;
    }

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
    if (payload.accountType === 'Student') {
      throw ({ code: 403, message: "学生无法查看课包详情" });
    } else if (payload.accountType === 'User') {
      if (!payload.isAdmin) {
        if (item.Org.toString() !== payload.currentUser?.Org.toString()) {
          throw ({ code: 403, message: "您无权查看此课包" })
        }
      }
    } else {
      throw ({ code: 403, message: "您的身份有误" })
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
    if (payload.accountType !== 'User') {
      throw ({ code: 403, message: "您无权添加课包" });
    }
    // 只有管理员可以创建课包
    if (!payload.isAdmin) {
      if (payload.currentUser?.roleTemp !== 'manager') {
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
    // 验证目标课包是否存在
    const targetPack = await PackModel.findById(_id);
    if (!targetPack) {
      throw ({ code: 404, message: '课包不存在' });
    }

    // 只有管理员可以修改课包
    if (payload.accountType !== 'User') {
      throw ({ code: 403, message: "您无权修改课包" });
    }
    if (!payload.isAdmin) {
      if (payload.currentUser?.roleTemp !== 'manager') {
        throw ({ code: 403, message: "只有管理员才能修改课包" });
      }
      if (targetPack.Org.toString() !== payload.currentUser?.Org.toString()) {
        throw ({ code: 403, message: "您无权修改此课包" });
      }
    }

    if (!doc.displayName) doc.displayName = doc.name;

    targetPack.set(doc);
    const { item } = await DAO.edit(targetPack, options);

    return { item };

  } catch (e) {
    console.error('PackDao update error:', e);
    throw e;
  }
};

// Pack 不能被删除 remove 只需要在 把 isActive 修改为 false

module.exports = {
  PackDAO: {
    list,
    detail,
    add,
    edit,
  },
  PackModel, PackDOC, PackEnums,
}