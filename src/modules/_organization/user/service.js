const UserMD = require('@models/organization/structure/User.model');
const { formatOptions } = require('@utils/formatOptions');
const { deleteImmutableFront } = require('@utils/validatorModel');

class UserSV {
  async list(query = {}, payload = {}) {
    try {
      if (!payload.isAdmin) {
        // 管理员可以查看所有用户
        query.Org = payload.currentUser?.Org; // 经理只能查看自己公司的用户
      }

      const { pageSize, skip, sort } = formatOptions(query.options);
      delete query.options;

      // 如果 regExp = "" 为否
      if (query.regExp) {
        query.nickname = { $regex: query.regExp, $options: 'i' };
      }
      delete query.regExp;

      // 权限控制：管理员可以查看所有，经理只能查看自己公司的
      if (!payload.isAdmin) {
        if (payload.currentUser.roleTemp !== 'manager') {
          throw new Error("没有权限查看用户列表");
        } else {
          query.Org = payload.currentUser?.Org; // 经理只能查看自己公司的用户
        }
      }

      const items = await UserMD
        .find(query)
        .populate('Account', 'code name phone isActive isAdmin')
        .populate('Org', 'name isMain')
        .sort(sort)
        .limit(pageSize).skip(skip)

      return { items, query };
    } catch (error) {
      console.error('UserSV list error:', error.message);
      throw error;
    }
  }

  async detail(_id, payload) {
    try {
      const item = await UserMD.findById(_id)
        .populate('Account', 'code name phone isActive isAdmin')
        .populate('Org', 'name isMain');

      if (!item) {
        throw new Error("此数据已不存在");
      }

      // 权限控制：管理员可以查看任意用户，经理只能查看自己公司的用户
      if (!payload.isAdmin) {
        if (payload.currentUser.roleTemp === 'manager' && item.Org.toString() !== payload.currentUser?.Org.toString()) {
          throw new Error("没有权限查看其他公司的用户");
        } else {
          throw new Error("没有权限查看用户信息");
        }
      }

      return { item };
    } catch (error) {
      console.error('UserSV detail error:', error.message);
      throw error;
    }
  }

  async create(doc, payload) {
    try {
      // 权限验证：管理员可以为任意公司创建用户，经理只能为自己公司创建用户
      if (!payload.isAdmin) {
        if (payload.currentUser.roleTemp === 'manager') {
          // 如果指定了Org，必须与当前用户所在Org相同
          doc.Org = payload.currentUser?.Org;
        } else {
          throw new Error("没有权限创建用户");
        }
      } else {
        if (!doc.Org) {
          doc.Org = payload.currentUser?.Org;
        }
      }


      deleteImmutableFront(doc, UserMD.doc);
      doc.createdBy = payload.currentUser?._id;

      // 检查同一账号在同一组织下是否有重复的身份
      const existing = await UserMD.findOne({ Org: doc.Org, Account: doc.Account });
      if (existing) {
        throw new Error('一个账号只能在同一组织下使用唯一的身份');
      }

      const item = new UserMD(doc);
      await item.save();

      // 返回时填充相关数据
      const populatedItem = await UserMD.findById(item._id)
        .populate('Account', 'code name phone isActive isAdmin')
        .populate('Org', 'name isMain');

      return { item: populatedItem };
    }
    catch (error) {
      console.error('UserSV create error:', error.message);
      throw error;
    }
  }

  async update(_id, doc, payload) {
    try {
      // 权限验证：管理员可以更新任意用户，经理只能更新自己公司的用户
      const targetUser = await UserMD.findById(_id);
      if (!targetUser) {
        throw new Error('用户不存在');
      }

      if (!payload.isAdmin) {
        delete doc.isActive; // 经理不能修改用户的激活状态
        delete doc.Org; // 经理不能修改用户的组织归属

        if (payload.currentUser?.roleTemp === 'manager' && targetUser.Org.toString() !== payload.currentUser?.Org.toString()) {
          throw new Error("没有权限更新其他公司的用户");
        } else {
          throw new Error("没有权限更新用户");
        }
      }

      // 不允许修改某些关键字段
      delete doc.Account; // 不允许更换账户
      delete doc.Org;     // 不允许更换组织

      deleteImmutableFront(doc, UserMD.doc);
      doc.updatedBy = payload._id;

      const item = Object.assign(targetUser, doc);
      await item.save();

      // 返回时填充相关数据
      const populatedItem = await UserMD.findById(item._id)
        .populate('Account', 'code name phone isActive isAdmin')
        .populate('Org', 'name isMain');

      return { item: populatedItem };
    } catch (error) {
      console.error('UserSV update error:', error.message);
      throw error;
    }
  }


  async selfUpdate(doc, payload) {
    try {
      delete doc._id;
      for (const key in UserMD.doc) {
        const field = UserMD.doc[key];
        if (field.immutableFront === true) delete doc[key]
      }

      const User = await UserMD.findById(payload.currentUser);
      if (!User || !User.isActive) {
        throw new Error('找不到您的身份数据或者您的身份已被禁用');
      }
      const item = Object.assign(User, doc);
      await item.save();
      return { item };
    } catch (error) {
      console.error('UserSV selfUpdate error:', error.message);
      throw error;
    }
  }
}

module.exports = new UserSV(); 