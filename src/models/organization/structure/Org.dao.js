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
    // 验证权限 - 管理员可以查看任何公司，普通用户只能查看自己的公司
    if (!payload.isAdmin) {
      if (payload.accountType === 'User') {
        if (payload.currentUser?.Org.toString() !== _id.toString()) {
          throw ({ code: 403, message: "没有权限访问此公司" });
        }
      } else if (payload.accountType === 'Student') {
        if (payload.currentStudent?.Org.toString() !== _id.toString()) {
          throw ({ code: 403, message: "没有权限访问此公司" });
        }
      } else {
        throw ({ code: 403, message: "您的身份错误" });
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
    // 只有管理员可以创建公司
    if (!payload.isAdmin) {
      throw ({ code: 403, message: "只有超级管理员才能创建公司" });
    }

    if (!doc.nickname) doc.nickname = doc.name;
    doc.createdBy = payload.currentUser?._id;

    const existFilter = [{ unionCode: doc.unionCode }];
    if (doc.name) existFilter.push({ name: doc.name });
    if (doc.nickname) existFilter.push({ nickname: doc.nickname });
    const existing = await AccountModel.findOne({ $or: existFilter });
    if (existing) {
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
    // 只有管理员可以修改公司
    if (!payload.isAdmin) {
      throw ({ code: 403, message: "没有权限修改公司" });
    }

    // 验证目标公司是否存在
    const targetOrg = await OrgModel.findById(_id);
    if (!targetOrg) {
      throw ({ code: 11000, message: '公司不存在' });
    }

    const existFilter = [{ unionCode: doc.unionCode }];
    if (doc.name) existFilter.push({ name: doc.name });
    if (doc.nickname) existFilter.push({ nickname: doc.nickname });
    const existing = await OrgModel.findOne({ _id: { $ne: _id }, $or: existFilter });
    if (existing) {
      throw ({ code: 11000, message: '统一社会编号或公司名称已被存在' });
    }

    targetOrg.set(doc);
    const { item } = await DAO.edit(targetOrg, _id, doc);

    return { item };
  } catch (e) {
    console.error('OrgSV edit error:', e);
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