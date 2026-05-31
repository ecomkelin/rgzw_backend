const RoomSV = require('./service');
const ApiResponse = require('@utils/response');
const asyncHandler = require('@utils/asyncHandler');

/**
 * 教室控制器类
 * 处理教室相关HTTP请求
 */
class RoomCT {

  /**
   * 获取教室列表
   * @param {Object} req - HTTP请求对象
   * @param {Object} res - HTTP响应对象
   */
  list = async (req, res) => {
    try {
      const { filter, options } = req.validData || {};
      const { total, items } = await RoomSV.list(req.payload, filter, options);

      return res.status(200).json(ApiResponse.success({ data: { total, items } }));
    } catch (e) {
      console.error("RoomCT list error: ", e);
      return res.json(ApiResponse.error(e));
    }
  };

  /**
   * 获取教室详情
   * @param {Object} req - HTTP请求对象
   * @param {Object} res - HTTP响应对象
   */
  detail = async (req, res) => {
    try {
      const { id, options } = req.validData || {};
      const { item } = await RoomSV.detail(req.payload, id, options);

      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error("RoomCT detail error: ", e);
      return res.json(ApiResponse.error(e));
    }
  };

  /**
   * 创建教室
   * @param {Object} req - HTTP请求对象
   * @param {Object} res - HTTP响应对象
   */
  add = async (req, res) => {
    try {
      const doc = req.validData;

      const { item } = await RoomSV.add(req.payload, doc);

      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error("RoomCT add error: ", e);
      return res.status(500).json(ApiResponse.error(e));
    }
  };

  /**
   * 更新教室信息
   * @param {Object} req - HTTP请求对象
   * @param {Object} res - HTTP响应对象
   */
  edit = async (req, res) => {
    try {
      const id = req.validData?.id;
      const doc = req.validData;
      delete doc.id;

      const { item } = await RoomSV.edit(req.payload, id, doc);
      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error("RoomCT edit error: ", e);
      return res.status(500).json(ApiResponse.error(e));
    }
  };
}

module.exports = new RoomCT();