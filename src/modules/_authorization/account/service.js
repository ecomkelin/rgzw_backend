const { AccountDAO, AccountDOC } = require('@models/authorization/Account.dao');
const { deleteImmutableFront } = require('@/utils/fieldAttributes');


class AccountSV {
  /**
   * 
   * @param {*} payload 
   * @param {*} filter find(filter)的过滤条件，允许根据账户的基本信息进行过滤，例如：isActive、isAdmin、gender、accountType等字段，以及关联的Nation/Province/City/Area等字段
   * @param {*} options { limit=100, skip=0, sort={}, populate=[{path: ''}] }
   * @returns 
   */
  async list(payload, filter = {}, options) {
    try {
      const { items, total, permFilter } = await AccountDAO.list(payload, filter, options);
      return { items, total, permFilter };
    } catch (error) {
      console.error('AccountSV list error:', error.message);
      throw error;
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
      const item = await AccountDAO.detail(payload, _id, options);

      if (!item) {
        throw new Error("此数据已不存在");
      }

      return { item };
    } catch (error) {
      console.error('AccountSV detail error:', error.message);
      throw error;
    }
  }

  /**
   * 
   * @param {*} doc 
   * @param {*} payload 
   * @returns 
   */
  async add(payload, doc) {
    try {
      deleteImmutableFront(doc, AccountDOC);

      const { item } = await AccountDAO.add(payload, doc);

      return { item };
    }
    catch (error) {
      console.error('AccountSV add error:', error.message);
      throw error;
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
      deleteImmutableFront(doc, AccountDOC);
      const { item } = await AccountDAO.edit(payload, _id, doc);
      return { item };
    } catch (error) {
      console.error('AccountSV edit error:', error.message);
      throw error;
    }
  }

}

module.exports = new AccountSV();