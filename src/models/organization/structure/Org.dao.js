const { OrgModel, OrgEnums, OrgDOC } = require('./Org.model');
const DAO = require('@models/DAO');

const list = async (payload = {}, filter, options) => {
  try {
    // 验证权限
    if (!payload.isAdmin) {
      throw ({ code: 403, message: "只有超级管理员才能查看公司列表" });
    }

    const { items, total } = await DAO.list(OrgModel, filter, options);
    return { items, total };
  } catch (e) {
    console.error('OrgDao list error:', e);
    throw e;
  }
};

const detail = async (payload = {}, _id, options) => {
  try {
    const { item } = await DAO.detail(OrgModel, _id, options);

    if (!item) {
      throw ({ code: 404, message: "此 公司 数据已不存在" });
    }

    // 验证权限 - 管理员可以查看任何公司，普通用户只能查看自己的公司
    if (!payload.isAdmin && item._id.toString() !== payload.currentUser?.Org.toString()) {
      throw ({ code: 403, message: "没有权限访问此公司" });
    }

    return { item };
  } catch (e) {
    console.error('OrgDao detail error:', e);
    throw e;
  }
};

const create = async (payload, doc) => {
  try {
    // 只有管理员可以创建公司
    if (!payload.isAdmin) {
      throw ({ code: 403, message: "只有超级管理员才能创建公司" });
    }

    const { item } = await DAO.add(OrgModel, doc);
    return { item };
  } catch (e) {
    console.error('OrgDao create error:', e);
    throw e;
  }
};

const update = async (payload = {}, _id, doc) => {
  try {
    // 验证目标公司是否存在
    const targetOrg = await OrgModel.findById(_id);
    if (!targetOrg) {
      throw new e('公司不存在');
    }

    // 只有管理员可以修改任何公司，普通用户只能修改自己的公司
    if (!payload.isAdmin && targetOrg._id.toString() !== payload._id.toString()) {
      throw ({ code: 403, message: "没有权限修改此公司" });
    }

    // 处理密码
    if (doc.password) {
      doc.passwordHash = doc.password;
      delete doc.password;
    }

    const existing = await OrgModel.findOne({ $or: [{ phone: doc.phone }, { code: doc.code }], _id: { $ne: _id } });
    if (existing) {
      throw new e('手机号或账号已被占用');
    }

    const { item } = await DAO.edit(OrgModel, _id, doc);
    delete item.passwordHash; // 确保返回时不包含密码哈希字段

    return { item };

  } catch (e) {
    console.error('OrgSV update error:', e);
    throw e;
  }
};

module.exports = {
  OrgDAO: {
    list,
    detail,
    create,
    update,
  },
  OrgModel, OrgDOC, OrgEnums,
}