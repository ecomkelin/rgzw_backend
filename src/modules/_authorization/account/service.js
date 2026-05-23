const AccountMD = require('@models/authorization/Account.model');
const UserMD = require('@models/organization/structure/User.model');
const StudentMD = require('@models/student/Student.model');
const { formatOptions } = require('@utils/formatOptions');
const { deleteImmutableFront } = require('@utils/validatorModel');

class AccountSV {
  /**
   * 获取账户列表
   * - 只有管理员可以查看所有账户
   */
  async list(query = {}, payload) {
    try {
      // 验证权限
      if (!payload.isAdmin) {
        throw new Error("只有管理员才能查看账户列表");
      }

      const { pageSize, skip, sort } = formatOptions(query.options);
      delete query.options;

      // 如果 regExp = "" 为否
      if (query.regExp) {
        query.name = { $regex: query.regExp, $options: 'i' };
      }
      delete query.regExp;

      const items = await AccountMD
        .find(query)
        .sort(sort)
        .limit(pageSize).skip(skip)

      return { items, query };
    } catch (error) {
      console.error('AccountSV list error:', error.message);
      throw error;
    }
  }

  /**
   * 获取账户详情
   * - 管理员可以查看任何账户
   * - 普通用户只能查看自己的账户及关联信息
   */
  async detail(_id, payload) {
    try {
      if (payload.isAdmin) {
        // 管理员可以查看任何账户
        const item = await AccountMD.findById(_id)
          .populate('currentUser', '_id nickname roleSimp Org isActive')
          .populate('currentStudent', '_id name displayName isActive');

        if (!item) {
          throw new Error("此数据已不存在");
        }

        return { item };
      } else {
        // 普通用户只能查看自己的账户
        if (_id.toString() !== payload._id.toString()) {
          throw new Error("没有权限访问此账户");
        }

        // 获取自己的账户及关联信息
        const item = await AccountMD.findById(_id)
          .populate('currentUser', '_id nickname roleSimp Org isActive')
          .populate('currentStudent', '_id name displayName isActive');

        if (!item) {
          throw new Error("此数据已不存在");
        }

        if (!item.isActive) {
          throw new Error("账户已被禁用");
        }

        return { item };
      }
    } catch (error) {
      console.error('AccountSV detail error:', error.message);
      throw error;
    }
  }

  /**
   * 创建账户
   * - 只有管理员可以创建账户
   * - 所有新创建的账户isAdmin都为false
   */
  async create(doc, payload) {
    try {
      // 验证权限
      if (!payload.isAdmin) {
        throw new Error("只有管理员才能创建账户");
      }

      // 确保新创建的账户不是管理员
      doc.isAdmin = false;

      // 处理密码
      if (doc.password) {
        doc.passwordHash = doc.password;
        delete doc.password;
      }

      deleteImmutableFront(doc, AccountMD.doc);
      doc.createdBy = payload.currentUser?._id;

      const existing = await AccountMD.findOne({ $or: [{ code: doc.code }, { phone: doc.phone }] });
      if (existing) {
        throw new Error('手机号或账号已被占用');
      }

      const item = new AccountMD(doc);
      await item.save();

      // 返回时排除密码哈希字段
      const populatedItem = await AccountMD.findById(item._id)
        .populate('currentUser', '_id nickname roleSimp Org isActive')
        .populate('currentStudent', '_id name displayName isActive');

      return { item: populatedItem };
    }
    catch (error) {
      console.error('AccountSV create error:', error.message);
      throw error;
    }
  }

  /**
   * 更新账户
   * - 只有管理员可以更新账户
   * - 管理员状态不可更改
   */
  async update(_id, doc, payload) {
    try {
      // 验证目标账户是否存在
      const targetAccount = await AccountMD.findById(_id);
      if (!targetAccount) {
        throw new Error('账户不存在');
      }

      // 防止修改isAdmin字段
      if (doc.isAdmin !== undefined) {
        throw new Error("管理员状态不可更改");
      }

      // 处理密码
      if (doc.password) {
        doc.passwordHash = doc.password;
        delete doc.password;
      }

      deleteImmutableFront(doc, AccountMD.doc);

      const existing = await AccountMD.findOne({ $or: [{ phone: doc.phone }, { code: doc.code }], _id: { $ne: _id } });
      if (existing) {
        throw new Error('手机号或账号已被占用');
      }

      const item = Object.assign(targetAccount, doc);
      await item.save();

      // 返回时排除密码哈希字段
      const populatedItem = await AccountMD.findById(item._id)
        .populate('currentUser', '_id nickname roleSimp Org isActive')
        .populate('currentStudent', '_id name displayName isActive');

      return { item: populatedItem };
    } catch (error) {
      console.error('AccountSV update error:', error.message);
      throw error;
    }
  }

  /**
   * 获取自己的账户详情
   * - 返回账户基本信息以及关联的Users和Students
   */
  async selfDetail(payload) {
    try {
      const item = await AccountMD.findById(payload._id)
        .populate('currentUser', '_id nickname roleSimp Org isActive')
        .populate('currentStudent', '_id name displayName isActive');

      if (!item) {
        throw new Error("您的账户已不存在");
      }
      if (!item.isActive) {
        throw new Error("您的账户已被禁用");
      }

      // 只返回必要的信息给用户自己
      const result = {
        _id: item._id,
        code: item.code,
        name: item.name,
        nickname: item.nickname,
        phone: item.phone,
        isActive: item.isActive,
        isAdmin: item.isAdmin,
        accountType: item.accountType,
        currentUser: item.currentUser,
        currentStudent: item.currentStudent,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      };

      return { item: result };
    } catch (error) {
      console.error('AccountSV selfDetail error:', error.message);
      throw error;
    }
  }

  /**
   * 修改自己的账户
   * - 只能修改密码和昵称
   */
  async selfUpdate(doc, payload) {
    try {
      // 清理不允许修改的字段
      delete doc.isAdmin;
      delete doc.code;
      delete doc.phone;
      delete doc.identityNo;
      delete doc.accountType;
      delete doc.currentUser;
      delete doc.currentStudent;
      delete doc.isActive;
      delete doc.createdBy;

      // 只允许修改密码和昵称
      const allowedFields = ['password', 'nickname', 'passwordHash'];
      const filteredDoc = {};
      console.log(1111, 'AccountSV selfUpdate input doc:', doc);
      for (const [key, value] of Object.entries(doc)) {
        if (allowedFields.includes(key)) {
          filteredDoc[key] = value;
        }
      }

      const Account = await AccountMD.findById(payload._id);
      if (!Account || !Account.isActive) {
        throw new Error('找不到您的账户数据或者账户已被禁用');
      }

      // 处理密码
      if (filteredDoc.password) {
        filteredDoc.passwordHash = filteredDoc.password;
        delete filteredDoc.password;
      }

      const item = Object.assign(Account, filteredDoc);
      await item.save();

      // 返回时不包含密码哈希
      const result = {
        _id: item._id,
        code: item.code,
        name: item.name,
        nickname: item.nickname,
        phone: item.phone,
        isActive: item.isActive,
        isAdmin: item.isAdmin,
        accountType: item.accountType,
        currentUser: item.currentUser,
        currentStudent: item.currentStudent,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      };

      return { item: result };
    } catch (error) {
      console.error('AccountSV selfUpdate error:', error.message);
      throw error;
    }
  }

}

module.exports = new AccountSV();