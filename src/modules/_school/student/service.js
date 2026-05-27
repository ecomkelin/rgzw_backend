const { StudentDAO, StudentDOC } = require('@models/school/student/Student.dao');
const { deleteImmutableFront } = require('@/utils/fieldAttributes');

class StudentSV {
  /**
     * 
     * @param {*} payload 
     * @param {*} filter find(filter)的过滤条件，允许根据账户的基本信息进行过滤，例如：isActive、isAdmin、gender、accountType等字段，以及关联的Nation/Province/City/Area等字段
     * @param {*} options { limit=100, skip=0, sort={}, populate=[{path: ''}] }
     * @returns 
     */
  async list(payload, filter = {}, options) {
    try {
      const { items, total, permFilter } = await StudentDAO.list(payload, filter, options);
      return { items, total, permFilter };
    } catch (e) {
      console.error('StudentSV list error:', e);
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
      const { item } = await StudentDAO.detail(payload, _id, options);

      if (!item) {
        throw ({ code: 404, message: "此数据已不存在" });
      }

      return { item };
    } catch (e) {
      console.error('StudentSV detail error:', e);
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
      deleteImmutableFront(doc, StudentDOC);

      const { item } = await StudentDAO.add(payload, doc, options);

      return { item };
    }
    catch (e) {
      console.error('StudentSV add error:', e);
      throw e;
    }
  }

  /**
   * 
   * @param {*} payload 
   * @param {*} _id 
   * @param {*} doc 
   * @param {*} options - {session} 事务  
   * @returns 
   */
  async edit(payload, _id, doc, options) {
    try {
      deleteImmutableFront(doc, StudentDOC);
      const { item } = await StudentDAO.edit(payload, _id, doc, options);
      return { item };
    } catch (e) {
      console.error('StudentSV edit error:', e);
      throw e;
    }
  }
}

module.exports = new StudentSV(); 