const { OrderPackDAO, OrderPackDOC } = require('@/models/pack/OrderPack.dao');
const { deleteImmutableFront } = require('@utils/fieldAttributes');

/**
 * OrderPack 业务服务
 * 封装 OrderPack 订单相关的业务逻辑，对外屏蔽 DAO 细节
 *
 * add / edit 流程会调用 deleteImmutableFront 删除标记为 immutableFront 的字段以及 _id，
 * 其余字段照常落库。OrderPack 快照字段（packName / totalLesson / validDays / priceOrigin
 * / priceRegular / priceSale）由 DAO 在 add 时从 Pack 重新拉取并覆盖。
 */
class OrderPackSV {
  /**
   * 订单列表
   * @param {Object} payload - 账户身份信息
   * @param {Object} filter  - 过滤条件
   * @param {Object} options - { limit, skip, sort, populate }
   */
  async list(payload, filter = {}, options) {
    try {
      const { items, total } = await OrderPackDAO.list(payload, filter, options);
      return { items, total };
    } catch (e) {
      console.error('OrderPackSV list error:', e);
      throw e;
    }
  }

  /**
   * 订单详情
   */
  async detail(payload, _id, options) {
    try {
      const { item } = await OrderPackDAO.detail(payload, _id, options);
      if (!item) {
        throw ({ code: 404, message: '此 课包订单 数据已不存在' });
      }
      return { item };
    } catch (e) {
      console.error('OrderPackSV detail error:', e);
      throw e;
    }
  }

  /**
   * 创建订单
   */
  async add(payload, doc, options) {
    try {
      // 移除前端不可变字段（DAO 内部会从 Pack 重新快照填充）
      deleteImmutableFront(doc, OrderPackDOC);

      const { item } = await OrderPackDAO.add(payload, doc, options);
      return { item };
    } catch (e) {
      console.error('OrderPackSV add error:', e);
      throw e;
    }
  }

  /**
   * 更新订单
   */
  async edit(payload, _id, doc, options) {
    try {
      deleteImmutableFront(doc, OrderPackDOC);

      const { item } = await OrderPackDAO.edit(payload, _id, doc, options);
      return { item };
    } catch (e) {
      console.error('OrderPackSV edit error:', e);
      throw e;
    }
  }
}

module.exports = new OrderPackSV();
