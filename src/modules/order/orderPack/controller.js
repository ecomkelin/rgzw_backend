const OrderPackSV = require('./service');
const ApiResponse = require('@utils/response');

/**
 * OrderPack 控制器
 * 处理课包订单（OrderPack）相关 HTTP 请求
 */
class OrderPackCT {
  /**
   * 获取订单列表
   */
  list = async (req, res) => {
    try {
      const { filter, options } = req.validData || {};
      const { total, items } = await OrderPackSV.list(req.payload, filter, options);

      return res.status(200).json(ApiResponse.success({ data: { total, items } }));
    } catch (e) {
      console.error('OrderPackCT list error:', e);
      const statusCode = e.code || 500;
      return res.status(statusCode).json(ApiResponse.error(e));
    }
  };

  /**
   * 获取订单详情
   */
  detail = async (req, res) => {
    try {
      const { id, options } = req.validData || {};
      const { item } = await OrderPackSV.detail(req.payload, id, options);

      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error('OrderPackCT detail error:', e);
      const statusCode = e.code || 500;
      return res.status(statusCode).json(ApiResponse.error(e));
    }
  };

  /**
   * 创建订单
   */
  add = async (req, res) => {
    try {
      const { item } = await OrderPackSV.add(req.payload, req.validData);

      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error('OrderPackCT add error:', e);
      const statusCode = e.code || 500;
      return res.status(statusCode).json(ApiResponse.error(e));
    }
  };

  /**
   * 更新订单（如修改支付状态、支付方式、交易号等）
   */
  edit = async (req, res) => {
    try {
      const id = req.validData?.id;
      const doc = { ...req.validData };
      delete doc.id;

      const { item } = await OrderPackSV.edit(req.payload, id, doc);
      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error('OrderPackCT edit error:', e);
      const statusCode = e.code || 500;
      return res.status(statusCode).json(ApiResponse.error(e));
    }
  };
}

module.exports = new OrderPackCT();
