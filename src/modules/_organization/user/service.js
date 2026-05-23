const UserMD = require('@models/organization/structure/User.model');
const { formatOptions } = require('../../../utils/formatOptions');
const { deleteImmutableFront } = require('../../../utils/validatorModel');

class UserSV {
  async list(query = {}, payload) {
    try {
      const { pageSize, skip, sort } = formatOptions(query.options);
      delete query.options;

      // 如果 regExp = "" 为否
      if (query.regExp) {
        query.name = { $regex: query.regExp };
      }
      delete query.regExp;

      const items = await UserMD
        .find(query)
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
      if (!item) {
        throw new Error("此数据已不存在");
      }

      return { item };
    } catch (error) {
      console.error('UserSV detail error:', error.message);
      throw error;
    }
  }

  async create(doc, payload) {
    try {
      deleteImmutableFront(doc, UserMD.doc);
      doc.createdBy = payload._id;
      const existing = await UserMD.findOne({ Org: doc.Org, Account: doc.Account });
      if (existing) {
        throw new Error('一个账号只能在同一组织下使用唯一的身份');
      }
      const item = new UserMD(doc);
      await item.save();
      return { item };
    }
    catch (error) {
      console.error('UserSV create error:', error.message);
      throw error;
    }
  }

  async update(_id, doc, payload) {
    try {
      deleteImmutableFront(doc, UserMD.doc);

      const User = await UserMD.findById(_id);
      if (!User) {
        throw new Error('用户不存在');
      }

      const item = Object.assign(User, doc);
      await item.save();
      return { item };

    } catch (error) {
      console.error('UserSV update error:', error.message);
      throw error;
    }
  }

  async selfDetail(payload) {
    try {
      const item = await UserMD.findById(payload.User_id)
      if (!item) {
        throw new Error("您的用户已经不存在");
      }
      if (item.isActive !== true) {
        throw new Error("您的用户已禁用");
      }
      return { item };
    } catch (error) {
      console.error('UserSV selfDetail error:', error.message);
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

      const User = await UserMD.findById(payload.User_id);
      if (!User) {
        throw new Error('找不到您的身份数据');
      }
      if (User.isActive !== true) {
        throw new Error("您的帐户已禁用");
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