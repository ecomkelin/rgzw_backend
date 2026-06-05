const { OrgModel, OrgEnums, OrgDOC } = require('./Org.model');
const DAO = require('@models/DAO');
const { userPayloadChecker } = require('@utils/payloadChecker');

const list = async (payload = {}, filter, options) => {
  try {
    userPayloadChecker(payload);
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
    userPayloadChecker(payload);
    // 验证权限 - 管理员可以查看任何公司，普通用户只能查看自己的公司
    if (!payload.isAdmin) {
      if (payload.currentUser.Org.toString() !== _id.toString()) {
        throw ({ code: 403, message: "没有权限访问此公司" });
      }
    }

    const { item } = await DAO.detail(OrgModel, _id, options);

    if (!item) {
      throw ({ code: 404, message: "此 公司 数据已不存在" });
    }

    return { item };
  } catch (e) {
    console.error('OrgDao detail error:', e);
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
    // 只有管理员可以创建公司
    if (!payload.isAdmin) {
      throw ({ code: 403, message: "只有超级管理员才能创建公司" });
    }

    doc.createdBy = payload.currentUser._id;

    if (doc.isMain === true) {
      const existingMain = await OrgModel.countDocuments({ isMain: true });
      if (existingMain > 0) {
        throw ({ code: 400, message: '已经存在一个主公司，无法创建另一个主公司' });
      }
    }

    const existFilter = [];
    if (doc.unionCode) existFilter.push({ unionCode: doc.unionCode });
    if (doc.name) existFilter.push({ name: doc.name });
    if (doc.nickname) existFilter.push({ nickname: doc.nickname });
    const existing = await OrgModel.countDocuments({ $or: existFilter });
    if (existing > 0) {
      throw ({ code: 400, message: '统一账号或公司名称或公司简称已被占用' });
    }

    const { item } = await DAO.add(OrgModel, doc, options);
    return { item };
  } catch (e) {
    console.error('OrgDao add error:', e);
    throw e;
  }
};

/**
 * 
 * @param {*} payload 
 * @param {*} _id 
 * @param {*} doc 
 * @param {*} options: {session} 事务 
 * @returns 
 */
const edit = async (payload = {}, _id, doc, options) => {
  try {
    userPayloadChecker(payload);
    if (doc.isActive == false) {
      if (payload.currentUser.Org === _id) {
        throw ({ code: 400, message: "不能禁用当前用户的公司" });
      }
    }
    // 只有管理员可以修改公司
    if (!payload.isAdmin) {
      throw ({ code: 403, message: "没有权限修改公司" });
    }

    // 验证目标公司是否存在
    const targetOrg = await OrgModel.findById(_id);
    if (!targetOrg) {
      throw ({ code: 404, message: '公司不存在' });
    }

    if (doc.isMain === true) {
      const existingMain = await OrgModel.countDocuments({ _id: { $ne: _id }, isMain: true });
      if (existingMain > 0) {
        throw ({ code: 400, message: '已经存在一个主公司，无法创建另一个主公司' });
      }
    }

    const existingFilter = { _id: { $ne: _id } };
    const existFilter = [];
    if (doc.nickname && doc.nickname !== targetOrg.nickname) existFilter.push({ nickname: doc.nickname });
    if (existFilter.length > 0) {
      existingFilter['$or'] = existFilter;
      const existing = await OrgModel.countDocuments(existingFilter);
      if (existing > 0) {
        throw ({ code: 400, message: '统一社会编号或公司名称或公司简称已被存在' });
      }
    }

    doc.updatedBy = payload.currentUser._id;
    targetOrg.set(doc);
    const { item } = await DAO.edit(targetOrg, options);

    return { item };
  } catch (e) {
    console.error('OrgDao edit error:', e);
    throw e;
  }
};

// org 不能被删除 remove 只需要在 把 isActive 修改为 false

module.exports = {
  OrgDAO: {
    list,
    detail,
    add,
    edit,
  },
  OrgModel, OrgDOC, OrgEnums,
}