const PackSV = require('./service');
const ApiResponse = require('@utils/response');

/**
 * 控制器类
 * 处理相关HTTP请求
 */
class PackCT {
  /**
   * 获取列表信息
   * @param {Object} req - HTTP请求对象
   * @param {Object} res - HTTP响应对象
   */
  list = async (req, res) => {
    try {
      const { filter, options } = req.validData || {};
      const { total, items } = await PackSV.list(req.payload, filter, options);

      return res.status(200).json(ApiResponse.success({ data: { total, items} }));
    } catch (e) {
      console.error("PackCT list error: ", e);
      return res.json(ApiResponse.error(e));
    }
  };

  /**
   * 获取详情信息
   * @param {Object} req - HTTP请求对象
   * @param {Object} res - HTTP响应对象
   */
  detail = async (req, res) => {
    try {
      const { id, options } = req.validData || {};
      const { item } = await PackSV.detail(req.payload, id, options);

      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error("PackCT detail error: ", e);
      return res.json(ApiResponse.error(e));
    }
  };

  /**
   * 创建信息
   * @param {Object} req - HTTP请求对象
   * @param {Object} res - HTTP响应对象
   */
  add = async (req, res) => {
    try {
      const { item } = await PackSV.add(req.payload, req.validData);

      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error("PackCT add error: ", e);
      return res.status(500).json(ApiResponse.error(e));
    }
  };

  /**
   * 更新信息
   * @param {Object} req - HTTP请求对象
   * @param {Object} res - HTTP响应对象
   */
  edit = async (req, res) => {
    try {
      const id = req.validData?.id;
      const doc = req.validData;
      delete doc.id;

      const { item } = await PackSV.edit(req.payload, id, doc);
      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error("PackCT edit error: ", e);
      return res.status(500).json(ApiResponse.error(e));
    }
  };

  /**
   * 删除信息
   * @param {Object} req - HTTP请求对象
   * @param {Object} res - HTTP响应对象
   */
  // remove = async (req, res) => {
  //   try {
  //     const id = req.validData?.id;
  //     const { item } = await PackSV.remove(req.payload, id);
  //     return res.status(200).json(ApiResponse.success({ data: { item } }));
  //   } catch (e) {
  //     console.error("PackCT remove error: ", e);
  //     return res.status(500).json(ApiResponse.error(e));
  //   }
  // };
}

module.exports = new PackCT();