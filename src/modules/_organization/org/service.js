const OrgMD = require('@models/organization/structure/Org.model');
const { formatOptions } = require('@utils/formatOptions');
const { deleteImmutableFront } = require('@utils/validatorModel');

class OrgSV {
  async list(query = {}, payload) {
    try {
      const { pageSize, skip, sort } = formatOptions(query.options);
      delete query.options;

      // 如果 regExp = "" 为否
      if (query.regExp) {
        query.name = { $regex: query.regExp };
      }
      delete query.regExp;

      const items = await OrgMD
        .find(query)
        .sort(sort)
        .limit(pageSize).skip(skip)
      return { items, query };
    } catch (error) {
      console.error('OrgSV list error:', error.message);
      throw error;
    }
  }
  async detail(_id, payload) {
    try {
      const item = await OrgMD.findById(_id)
      if (!item) {
        throw new Error("此数据已不存在");
      }

      return { item };
    } catch (error) {
      console.error('OrgSV detail error:', error.message);
      throw error;
    }
  }

  async create(doc, payload) {
    try {
      deleteImmutableFront(doc, OrgMD.doc);
      doc.createdBy = payload._id;
      doc.updatedBy = payload._id;
      const existing = await OrgMD.findOne({ $or: [{ unionCode: doc.unionCode }, { name: doc.name }] });
      if (existing) {
        throw new Error('具有相同统一社会信用代码或名称的组织已存在');
      }
      const item = new OrgMD(doc);
      await item.save();
      return { item };
    }
    catch (error) {
      console.error('OrgSV create error:', error.message);
      throw error;
    }
  }

  async update(_id, doc, payload) {
    try {
      deleteImmutableFront(doc, OrgMD.doc);
      doc.updatedBy = payload._id;

      const Org = await OrgMD.findById(_id);
      if (!Org) {
        throw new Error('公司不存在');
      }

      const existing = await OrgMD.findOne({ $or: [{ unionCode: doc.unionCode }, { name: doc.name }], _id: { $ne: _id } });
      if (existing) {
        throw new Error('具有相同统一社会信用代码或名称的组织已存在');
      }

      const item = Object.assign(Org, doc);
      await item.save();
      return { item };

    } catch (error) {
      console.error('OrgSV update error:', error.message);
      throw error;
    }
  }

  async selfDetail(payload) {
    try {
      const item = await OrgMD.findById(payload.Org_id)
      if (!item) {
        throw new Error("您的公司已经不存在");
      }
      if (item.isActive !== true) {
        throw new Error("您的公司已禁用");
      }
      return { item };
    } catch (error) {
      console.error('OrgSV selfDetail error:', error.message);
      throw error;
    }
  }
}

module.exports = new OrgSV(); 