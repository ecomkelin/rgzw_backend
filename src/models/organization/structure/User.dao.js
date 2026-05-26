const { UserModel, UserEnums, UserDOC } = require('./User.model');
const DAO = require('@models/DAO');

const list = async (payload = {}, filter, options) => {
  try {
    // 验证权限
    if (payload.accountType !== 'User') {
      throw ({ code: 403, message: "您没有权限操作User" });
    }
    if (!payload.isAdmin) {
      filter.Org = payload.currentUser?.Org;
      if (payload.currentUser?.roleTemp !== 'manager') {
        throw ({ code: 403, message: "只有超级管理员才能查看用户列表" });
      }
    }

    const { items, total } = await DAO.list(UserModel, filter, options);
    return { items, total };
  } catch (e) {
    console.error('UserDao list error:', e);
    throw e;
  }
};

const detail = async (payload = {}, _id, options) => {
  try {
    if (payload.accountType !== 'User') {
      throw ({ code: 403, message: "你没有权限访问用户" })
    }

    const { item } = await DAO.detail(UserModel, _id, options);

    if (!item) {
      throw ({ code: 404, message: "此 用户 数据已不存在" });
    }

    // 验证权限 - 管理员可以查看任何用户，普通用户只能查看自己的用户
    if (!payload.isAdmin) {
      if (payload.currentUser?.Org?.toString() !== item.Org.toString()) {
        throw ({ code: 403, message: "你没有权限访问此用户" })
      }
      if (payload.currentUser?.roleTemp !== 'manager' && payload.currentUser?._id?.toString() !== item._id.toString()) {
        throw ({ code: 403, message: "没有权限访问此用户" });
      }
    }

    return { item };
  } catch (e) {
    console.error('UserDao detail error:', e);
    throw e;
  }
};

const add = async (payload, doc) => {
  try {
    // 只有管理员可以创建用户
    if (payload.accountType !== 'User') {
      throw ({ code: 403, message: "你没有权限添加用户" })
    }
    if (!payload.isAdmin) {
      doc.Org = payload.currentUser.Org
      if (payload.currentUser.roleTemp !== 'manager') {
        throw ({ code: 403, message: "只有超级管理员才能创建用户" });
      }
    } else {
      if (!doc.Org) {
        doc.Org = payload.currentUser.Org
      }
    }

    const { item } = await DAO.add(UserModel, doc);
    return { item };
  } catch (e) {
    console.error('UserDao add error:', e);
    throw e;
  }
};

const update = async (payload = {}, _id, doc) => {
  try {
    if (payload.accountType !== 'User') {
      throw ({ code: 403, message: "你没有权限访问用户" })
    }

    // 验证目标用户是否存在
    const targetUser = await UserModel.findById(_id);
    if (!targetUser) {
      throw new e('用户不存在');
    }

    // 只有管理员可以修改任何用户，普通用户只能修改自己的用户
    if (!payload.isAdmin) {
      if (payload.currentUser.Org.toString() !== targetUser.Org.toString()) {
        throw ({ code: 403, message: "没有权限修改此用户" });
      }
      if (payload.currentUser.roleTemp !== 'manager') {
        if (payload.currentUser._id.toString() !== targetUser._id.toString()) {
          throw ({ code: 403, message: "没有权限修改此用户" });
        }
      }
    }

    // 处理密码
    if (doc.password) {
      doc.passwordHash = doc.password;
      delete doc.password;
    }

    const existing = await UserModel.findOne({ $or: [{ phone: doc.phone }, { code: doc.code }], _id: { $ne: _id } });
    if (existing) {
      throw new e('手机号或账号已被占用');
    }

    const { item } = await DAO.edit(UserModel, _id, doc);
    delete item.passwordHash; // 确保返回时不包含密码哈希字段

    return { item };

  } catch (e) {
    console.error('UserSV update error:', e);
    throw e;
  }
};

// User 不能被删除 remove 只需要在 把 isActive 修改为 false


module.exports = {
  UserDAO: {
    list,
    detail,
    add,
    update,
  },
  UserModel, UserDOC, UserEnums,
}