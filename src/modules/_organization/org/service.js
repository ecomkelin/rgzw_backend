const OrgMD = require('@models/organization/structure/Org.model');
const UserMD = require('@models/organization/structure/User.model');
const StudentMD = require('@models/student/Student.model');
const AccountMD = require('@models/authorization/Account.model');
const { formatOptions } = require('@utils/formatOptions');
const { deleteImmutableFront } = require('@utils/validatorModel');

class OrgSV {
  /**
   * 获取机构列表
   * - 管理员可查看所有机构
   * - 普通用户只能查看自己所在机构
   */
  async list(query = {}, payload) {
    try {
      const { pageSize, skip, sort } = formatOptions(query.options);
      delete query.options;

      // 如果 regExp = "" 为否
      if (query.regExp) {
        query.name = { $regex: query.regExp };
      }
      delete query.regExp;

      // 权限控制
      if (payload.isAdmin) {
        // 管理员可以查看所有机构
        const items = await OrgMD
          .find(query)
          .sort(sort)
          .limit(pageSize).skip(skip)

        return { items, query };
      } else {
        // 普通用户只能查看自己所在的机构
        const user = await UserMD.findOne({ Account: payload._id });
        if (!user) {
          return { items: [], query: {} };
        }

        query._id = user.Org; // 限制查询为用户所在的机构

        const items = await OrgMD
          .find(query)
          .sort(sort)
          .limit(pageSize).skip(skip)

        return { items, query };
      }
    } catch (error) {
      console.error('OrgSV list error:', error.message);
      throw error;
    }
  }

  /**
   * 获取机构详情
   * - 管理员可查看任何机构
   * - 普通用户只能查看自己所在机构
   */
  async detail(_id, payload) {
    try {
      if (payload.isAdmin) {
        // 管理员可以查看任何机构
        const item = await OrgMD.findById(_id);
        if (!item) {
          throw new Error("此数据已不存在");
        }
        return { item };
      } else {
        // 普通用户只能查看自己所在的机构
        const user = await UserMD.findOne({ Account: payload._id });
        if (!user) {
          throw new Error("用户不存在");
        }

        if (user.Org.toString() !== _id.toString()) {
          throw new Error("没有权限访问此机构");
        }

        const item = await OrgMD.findById(_id);
        if (!item) {
          throw new Error("此数据已不存在");
        }

        return { item };
      }
    } catch (error) {
      console.error('OrgSV detail error:', error.message);
      throw error;
    }
  }

  /**
   * 创建机构
   * - 只有管理员可以创建
   */
  async create(doc, payload) {
    try {
      // 验证权限
      const account = await AccountMD.findById(payload._id);
      if (!account || !account.isAdmin) {
        throw new Error("只有管理员才能创建机构");
      }

      deleteImmutableFront(doc, OrgMD.doc);
      doc.createdBy = payload._id;
      doc.updatedBy = payload._id;

      // 检查是否已经有主机构
      if (doc.isMain) {
        const existingMainOrg = await OrgMD.findOne({ isMain: true });
        if (existingMainOrg) {
          throw new Error('已经存在一个主机构，不能创建更多主机构');
        }
      }

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

  /**
   * 更新机构
   * - 只有管理员可以更新
   */
  async update(_id, doc, payload) {
    try {
      // 验证权限
      const account = await AccountMD.findById(payload._id);
      if (!account || !account.isAdmin) {
        throw new Error("只有管理员才能更新机构");
      }

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

  /**
   * 获取自己的机构详情
   * - 检查机构是否处于活跃状态
   */
  async selfDetail(payload) {
    try {
      const account = await AccountMD.findById(payload._id);
      if (!account || !account.isActive) {
        throw new Error("账户不存在或者被禁用");
      }
      if (account.accountType !== 'User' || account.currentUser == null) {
        throw new Error("账户类型不正确或者没有关联的用户");
      }

      const user = await UserMD.findById(account.currentUser).populate('Org');
      if (!user || !user.isActive) {
        throw new Error("用户不存在或者被禁用");
      }
      if (!user.Org) {
        throw new Error("用户没有关联的机构");
      }

      const item = await OrgMD.findById(user.Org)
      if (!item || !item.isActive) {
        throw new Error("您的公司已经不存在或已被禁用");
      }
      return { item };
    } catch (error) {
      console.error('OrgSV selfDetail error:', error.message);
      throw error;
    }
  }

  /**
   * 根据机构ID检查是否活跃
   * - 如果机构不活跃，相关用户和学生应无法使用
   */
  async isOrgActive(orgId) {
    const org = await OrgMD.findById(orgId);
    return org && org.isActive === true;
  }
}

module.exports = new OrgSV();