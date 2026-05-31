const { RoomDAO, RoomDOC } = require('@models/organization/physical/_Room.dao');
const { deleteImmutableFront } = require('@/utils/fieldAttributes');

/**
 * 教室服务类
 * 处理与教室相关的业务逻辑
 */
class RoomSV {
  /**
   * 获取教室列表
   * @param {Object} payload - 用户身份信息
   * @param {Object} filter - 过滤条件，默认为空对象
   * @param {Object} options - 查询选项 { limit=100, skip=0, sort={}, populate=[{path: ''}] }
   * @returns {Object} 包含 items(教室列表), total(总数) 的对象
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
   * 获取教室详情
   * @param {Object} payload - 用户身份信息
   * @param {String} _id - 教室ID
   * @param {Object} options - 选项 { populate: [{ path: '' }] } 只有一个参数 populate
   * @returns {Object} 包含 item(教室详情) 的对象
   */
  async detail(payload, _id, options) {
    try {
      const { item } = await RoomDAO.detail(payload, _id, options);

      if (!item) {
        throw ({ code: 404, message: "此教室数据已不存在" });
      }

      return { item };
    } catch (e) {
      console.error('RoomSV detail error:', e);
      throw e;
    }
  }

  /**
   * 创建教室
   * @param {Object} payload - 用户身份信息
   * @param {Object} doc - 教室数据
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
   * 更新教室信息
   * @param {Object} payload - 用户身份信息
   * @param {String} _id - 教室ID
   * @param {Object} doc - 要更新的数据
   * @param {Object} options - {session} 事务
   * @returns {Object} 包含 item(更新后的教室) 的对象
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
}

module.exports = new RoomSV();