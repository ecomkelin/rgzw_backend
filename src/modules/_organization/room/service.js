const { RoomDAO, RoomDOC } = require('@/models/organization/physical/Room.dao');
const { deleteImmutableFront } = require('@/utils/fieldAttributes');

/**
 * 数据服务类
 * 处理与数据相关的业务逻辑
 */
class RoomSV {
  /**
   * 获取数据列表
   * @param {Object} payload - 账户身份信息
   * @param {Object} filter - 过滤条件，默认为空对象
   * @param {Object} options - 查询选项 { limit=100, skip=0, sort={}, populate=[{path: ''}] }
   * @returns {Object} 包含 items(数据列表), total(总数)
   */
  async list(payload, filter = {}, options) {
    try {
      const { items, total } = await RoomDAO.list(payload, filter, options);
      return { items, total };
    } catch (e) {
      console.error('RoomSV list error:', e);
      throw e;
    }
  }

  /**
   * 获取数据详情
   * @param {Object} payload - 账户身份信息
   * @param {String} _id - 数据库ID
   * @param {Object} options - 选项 { populate: [{ path: '' }] } 只有一个参数 populate
   * @returns {Object} 包含 item(数据详情) 的对象
   */
  async detail(payload, _id, options) {
    try {
      const { item } = await RoomDAO.detail(payload, _id, options);

      if (!item) {
        throw ({ code: 404, message: "此数据已不存在" });
      }

      return { item };
    } catch (e) {
      console.error('RoomSV detail error:', e);
      throw e;
    }
  }

  /**
   * 创建数据
   * @param {Object} payload - 账户身份信息
   * @param {Object} doc - 数据数据
   * @param {Object} options - {session} 事务 
   */
  async add(payload, doc, options) {
    try {
      // 删除不允许从前端修改的字段
      deleteImmutableFront(doc, RoomDOC);

      const { item } = await RoomDAO.add(payload, doc, options);

      return { item };
    }
    catch (e) {
      console.error('RoomSV add error:', e);
      throw e;
    }
  }

  /**
   * 更新数据信息
   * @param {Object} payload - 账户身份信息
   * @param {String} _id - 数据ID
   * @param {Object} doc - 要更新的数据
   * @param {Object} options - {session} 事务 
   * @returns {Object} 包含 item(更新后的数据) 的对象
   */
  async edit(payload, _id, doc, options) {
    try {
      // 删除不允许从前端修改的字段
      deleteImmutableFront(doc, RoomDOC);

      const { item } = await RoomDAO.edit(payload, _id, doc, options);
      return { item };
    } catch (e) {
      console.error('RoomSV edit error:', e);
      throw e;
    }
  }

  /**
   * 删除数据信息
   * @param {Object} payload - 账户身份信息
   * @param {String} _id - 数据ID
   * @param {Object} options - {session} 事务 
   * @returns {Object} 包含 item(更新后的数据) 的对象
   */
  // async remove(payload, _id, options) {
  //   try {
  //     const { item } = await RoomDAO.remove(payload, _id, options);
  //     return { item };
  //   } catch (e) {
  //     console.error('RoomSV remove error:', e);
  //     throw e;
  //   }
  // }
}

module.exports = new RoomSV();