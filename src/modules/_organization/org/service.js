const { OrgDAO, OrgDOC } = require('@models/organization/structure/Org.dao');
const { deleteImmutableFront } = require('@/utils/fieldAttributes');

class OrgSV {
  /**
     * 
     * @param {*} payload 
     * @param {*} filter find(filter)的过滤条件，允许根据账户的基本信息进行过滤，例如：isActive、isAdmin、gender、accountType等字段，以及关联的Nation/Province/City/Area等字段
     * @param {*} options { limit=100, skip=0, sort={}, populate=[{path: ''}] }
     * @returns 
     */
  async list(payload, filter = {}, options) {
    try {
      const { items, total, permFilter } = await OrgDAO.list(payload, filter, options);
      return { items, total, permFilter };
    } catch (e) {
      console.error('OrgSV list error:', e);
      throw e;
    }
  }

  /**
   * 获取账户详情
   * @param {*} payload 
   * @param {*} _id 
   * @param {*} options : { populate: [{ path: '' }] } 里面只有 一个参数 populate
   * @returns 
   */
  async detail(payload, _id, options) {
    try {
      const { item } = await OrgDAO.detail(payload, _id, options);

      if (!item) {
        throw ({ code: 403, message: "此数据已不存在" });
      }

      return { item };
    } catch (e) {
      console.error('OrgSV detail error:', e);
      throw e;
    }
  }

  /**
   * 
   * @param {*} doc 
   * @param {*} payload 
   * @param {*} options: {session} 事务 
   * @returns 
   */
  async add(payload, doc, options) {
    try {
      deleteImmutableFront(doc, OrgDOC);

      const { item } = await OrgDAO.add(payload, doc, options);

      return { item };
    }
    catch (e) {
      console.error('OrgSV add error:', e);
      throw e;
    }
  }

  /**
   * 
   * @param {*} payload 
   * @param {*} _id 
   * @param {*} doc 
   * @returns 
   */
  async edit(payload, _id, doc) {
    try {
      deleteImmutableFront(doc, OrgDOC);
      const { item } = await OrgDAO.edit(payload, _id, doc);
      return { item };
    } catch (e) {
      console.error('OrgSV edit error:', e);
      throw e;
    }
  }
}

module.exports = new OrgSV();