const AccountMD = require('@models/authorization/Account.model');
const { formatOptions } = require('@utils/formatOptions');
const { deleteImmutableFront } = require('@utils/validatorModel');

class AccountSV {
  async list(query = {}, payload) {
    try {
      const { pageSize, skip, sort } = formatOptions(query.options);
      delete query.options;

      // 如果 regExp = "" 为否
      if (query.regExp) {
        query.name = { $regex: query.regExp };
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
  async detail(_id, payload) {
    try {
      const item = await AccountMD.findById(_id)
      if (!item) {
        throw new Error("此数据已不存在");
      }

      return { item };
    } catch (error) {
      console.error('AccountSV detail error:', error.message);
      throw error;
    }
  }
  async create(doc, payload) {
    try {
      deleteImmutableFront(doc, AccountMD.doc);
      doc.createdBy = payload._id;
      doc.updatedBy = payload._id;
      const existing = await AccountMD.findOne({ $or: [{ code: doc.code }, { phone: doc.phone }] });
      if (existing) {
        throw new Error('手机号或账号已被占用');
      }
      const item = new AccountMD(doc);
      await item.save();
      return { item };
    }
    catch (error) {
      console.error('AccountSV create error:', error.message);
      throw error;
    }
  }
  async update(_id, doc, payload) {
    try {
      deleteImmutableFront(doc, AccountMD.doc);
      doc.updatedBy = payload._id;

      const Account = await AccountMD.findById(_id);
      if (!Account) {
        throw new Error('帐户不存在');
      }

      const existing = await AccountMD.findOne({ $or: [{ phone: doc.phone }, { code: doc.code }], _id: { $ne: _id } });
      if (existing) {
        throw new Error('手机号或账号已被占用');
      }

      if (doc.password) doc.passwordHash = doc.password;

      const item = Object.assign(Account, doc);
      await item.save();
      return { item };

    } catch (error) {
      console.error('AccountSV update error:', error.message);
      throw error;
    }
  }

  async selfDetail(payload) {
    try {
      const item = await AccountMD.findById(payload._id)
      if (!item) {
        throw new Error("您的帐户已经不存在");
      }
      if (item.isActive !== true) {
        throw new Error("您的帐户已禁用");
      }
      return { item };
    } catch (error) {
      console.error('AccountSV selfDetail error:', error.message);
      throw error;
    }
  }
  async selfUpdate(doc, payload) {
    try {
      delete doc._id;
      for (const key in AccountMD.doc) {
        const field = AccountMD.doc[key];
        if (field.immutableFront === true) delete doc[key]
      }
      doc.updatedBy = payload._id;

      const Account = await AccountMD.findById(payload._id);
      if (!Account) {
        throw new Error('找不到您的帐户数据');
      }
      if (Account.isActive !== true) {
        throw new Error("您的帐户已禁用");
      }
      if (doc.password) doc.passwordHash = doc.password;
      const item = Object.assign(Account, doc);
      await item.save();
      return { item };

    } catch (error) {
      console.error('AccountSV selfUpdate error:', error.message);
      throw error;
    }
  }
}

module.exports = new AccountSV(); 