const UserMD = require('@models/organization/structure/User.model');
const AccountMD = require('@models/authorization/Account.model');
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
        if (payload.roleSimp !== 'manager') {
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
        if (payload.roleSimp === 'manager' && item.Org.toString() !== payload.currentUser?.Org.toString()) {
          throw new Error("没有权限查看其他公司的用户");
        } else if (!payload.roleSimp) {
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
        if (payload.roleSimp === 'manager') {
          // 如果指定了Org，必须与当前用户所在Org相同
          if (doc.Org && doc.Org.toString() !== payload.currentUser?.Org.toString()) {
            throw new Error("经理只能为自己的公司创建用户");
          }
          // 如果没有指定Org，默认设置为当前用户所在Org
          if (!doc.Org) {
            doc.Org = payload.currentUser?.Org;
          }
        } else {
          throw new Error("没有权限创建用户");
        }
      }

      // 如果没有指定Account，且提供了account信息，则创建新账户
      if (!doc.Account && doc.account) {
        // 检查是否为管理员才能创建账户
        if (!payload.isAdmin) {
          throw new Error("只有管理员可以创建账户");
        }

        // 创建新的账户
        const accountData = doc.account;

        // 确保新创建的账户不是管理员
        accountData.isAdmin = false;

        // 处理密码
        if (accountData.password) {
          accountData.passwordHash = accountData.password;
          delete accountData.password;
        }

        deleteImmutableFront(accountData, AccountMD.doc);
        accountData.createdBy = payload._id;
        accountData.updatedBy = payload._id;

        const existing = await AccountMD.findOne({
          $or: [
            { code: accountData.code },
            { phone: accountData.phone ? accountData.phone : null }
          ]
        });

        if (existing && (existing.code === accountData.code || (accountData.phone && existing.phone === accountData.phone))) {
          throw new Error('手机号或账号已被占用');
        }

        const newAccount = new AccountMD(accountData);
        await newAccount.save();
        doc.Account = newAccount._id;
      } else if (!doc.Account) {
        throw new Error("必须提供Account信息或account创建信息");
      }

      // 如果没有提供Org，但提供了Account，尝试从Account获取相关信息
      if (!doc.Org && doc.Account) {
        // 在非管理员情况下，使用当前用户所在Org
        if (!payload.isAdmin && payload.roleSimp === 'manager') {
          doc.Org = payload.currentUser?.Org;
        }
      }

      deleteImmutableFront(doc, UserMD.doc);
      doc.createdBy = payload._id;

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
        if (payload.roleSimp === 'manager' && targetUser.Org.toString() !== payload.currentUser?.Org.toString()) {
          throw new Error("没有权限更新其他公司的用户");
        } else if (!payload.roleSimp) {
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

      const Account = await AccountMD.findById(payload._id);
      if (!Account || !Account.isActive) {
        throw new Error("您的账户信息不存在或已被禁用");
      }
      if (Account.accountType !== 'User' || !Account.currentUser) {
        throw new Error("您的账户没有关联的用户身份");
      }
      const user = await UserMD.findById(Account.currentUser);
      if (!user || !user.isActive) {
        throw new Error('找不到您的身份数据或者您的身份已被禁用');
      }
      const item = Object.assign(user, doc);
      await item.save();
      return { item };
    } catch (error) {
      console.error('UserSV selfUpdate error:', error.message);
      throw error;
    }
  }
}

module.exports = new UserSV(); 