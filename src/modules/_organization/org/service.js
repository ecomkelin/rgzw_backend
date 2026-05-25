const { OrgModel, OrgDOC } = require('@models/organization/structure/Org.dao');
const { deleteImmutableFront } = require('@/utils/fieldAttributes');

class OrgSV {
  /**
   * 获取机构列表
   * - 管理员可查看所有机构
   * - 普通用户只能查看自己所在机构
   */
  async list(query = {}, payload) {
    try {
      delete query.options;

      // 如果 regExp = "" 为否
      if (query.regExp) {
        query.name = { $regex: query.regExp };
      }
      delete query.regExp;

      // 权限控制
      // 管理员可以查看所有机构
      if (!payload.isAdmin) {
        throw new Error("管理员没有权限查看机构列表");
      }
      const items = await OrgModel
        .find(query)
        .sort(sort)
        .limit(pageSize).skip(skip)

      return { items, query };
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
      // 管理员可以查看任何机构
      if (!payload.isAdmin) {
        throw new Error("管理员没有权限查看机构详情");
      }
      const item = await OrgModel.findById(_id);
      if (!item) {
        throw new Error("此数据已不存在");
      }
      return { item };
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
      if (!payload.isAdmin) {
        throw new Error("只有管理员才能创建机构");
      }

      deleteImmutableFront(doc, OrgDOC);
      doc.createdBy = payload.currentUser?._id;

      // 检查是否已经有主机构
      if (doc.isMain) {
        const existingMainOrg = await OrgModel.findOne({ isMain: true });
        if (existingMainOrg) {
          throw new Error('已经存在一个主机构，不能创建更多主机构');
        }
      }

      const existing = await OrgModel.findOne({ $or: [{ unionCode: doc.unionCode }, { name: doc.name }] });
      if (existing) {
        throw new Error('具有相同统一社会信用代码或名称的组织已存在');
      }

      const item = new OrgModel(doc);
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
      if (!payload.isAdmin) {
        throw new Error("只有管理员才能更新机构");
      }

      deleteImmutableFront(doc, OrgModel.doc);

      const Org = await OrgModel.findById(_id);
      if (!Org) {
        throw new Error('公司不存在');
      }

      const existing = await OrgModel.findOne({ $or: [{ unionCode: doc.unionCode }, { name: doc.name }], _id: { $ne: _id } });
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
      if (payload.accountType !== 'User' || payload.currentUser == null) {
        throw new Error("账户类型不正确或者没有关联的用户");
      }
      if (!payload.currentUser._id || !payload.currentUser.Org) {
        throw new Error("用户没有关联的机构");
      }

      const item = await OrgModel.findById(payload.currentUser.Org);
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
    const org = await OrgModel.findById(orgId);
    return org && org.isActive === true;
  }
}

module.exports = new OrgSV();