const { UserDAO, UserDOC } = require('@models/organization/structure/User.dao');
const { deleteImmutableFront } = require('@/utils/fieldAttributes');

/**
 * 用户服务类
 * 处理与用户相关的业务逻辑
 */
class UserSV {
  /**
   * 获取用户列表
   * @param {Object} payload - 用户身份信息
   * @param {Object} filter - 过滤条件，默认为空对象
   * @param {Object} options - 查询选项 { limit=100, skip=0, sort={}, populate=[{path: ''}] }
   * @returns {Object} 包含 items(用户列表), total(总数), permFilter(权限过滤器) 的对象
   */
  async list(payload, filter = {}, options) {
    try {
      const { items, total, permFilter } = await UserDAO.list(payload, filter, options);
      return { items, total, permFilter };
    } catch (e) {
      console.error('UserSV list error:', e);
      throw e;
    }
  }

  /**
   * 获取用户详情
   * @param {Object} payload - 用户身份信息
   * @param {String} _id - 用户ID
   * @param {Object} options - 选项 { populate: [{ path: '' }] } 只有一个参数 populate
   * @returns {Object} 包含 item(用户详情) 的对象
   */
  async detail(payload, _id, options) {
    try {
      const { item } = await UserDAO.detail(payload, _id, options);

      if (!item) {
        throw ({ code: 404, message: "此数据已不存在" });
      }

      return { item };
    } catch (e) {
      console.error('UserSV detail error:', e);
      throw e;
    }
  }

  /**
   * 创建用户
   * @param {Object} payload - 用户身份信息
   * @param {Object} doc - 用户数据
   * @param {Object} options - {session} 事务 
   */
  async add(payload, doc, options) {
    try {
      // 删除不允许从前端修改的字段
      deleteImmutableFront(doc, UserDOC);

      const { item } = await UserDAO.add(payload, doc, options);

      return { item };
    }
    catch (e) {
      console.error('UserSV add error:', e);
      throw e;
    }
  }

  /**
   * 更新用户信息
   * @param {Object} payload - 用户身份信息
   * @param {String} _id - 用户ID
   * @param {Object} doc - 要更新的数据
   * @param {Object} options - {session} 事务 
   * @returns {Object} 包含 item(更新后的用户) 的对象
   */
  async edit(payload, _id, doc, options) {
    try {
      // 删除不允许从前端修改的字段
      deleteImmutableFront(doc, UserDOC);

      const { item } = await UserDAO.edit(payload, _id, doc, options);
      return { item };
    } catch (e) {
      console.error('UserSV edit error:', e);
      throw e;
    }
  }
}

module.exports = new UserSV();