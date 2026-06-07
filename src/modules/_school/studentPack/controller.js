const StudentPackSV = require('./service');
const ApiResponse = require('@utils/response');

/**
 * StudentPack 控制器
 * 处理学生课包（StudentPack）相关 HTTP 请求
 */
class StudentPackCT {
  /**
   * 获取学生课包列表
   */
  list = async (req, res) => {
    try {
      const { filter, options } = req.validData || {};
      const { total, items } = await StudentPackSV.list(req.payload, filter, options);

      return res.status(200).json(ApiResponse.success({ data: { total, items } }));
    } catch (e) {
      console.error('StudentPackCT list error:', e);
      const statusCode = e.code || 500;
      return res.status(statusCode).json(ApiResponse.error(e));
    }
  };

  /**
   * 获取学生课包详情
   */
  detail = async (req, res) => {
    try {
      const { id, options } = req.validData || {};
      const { item } = await StudentPackSV.detail(req.payload, id, options);

      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error('StudentPackCT detail error:', e);
      const statusCode = e.code || 500;
      return res.status(statusCode).json(ApiResponse.error(e));
    }
  };

  /**
   * 手动添加 free 赠送课包
   * 仅超管 (Account.isAdmin === true)
   */
  add = async (req, res) => {
    try {
      const { item } = await StudentPackSV.add(req.payload, req.validData);

      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error('StudentPackCT add error:', e);
      const statusCode = e.code || 500;
      return res.status(statusCode).json(ApiResponse.error(e));
    }
  };

  /**
   * 编辑学生课包 (调整 status / 剩余课时 / 过期时间 等)
   * 仅超管
   */
  edit = async (req, res) => {
    try {
      const id = req.validData?.id;
      const doc = { ...req.validData };
      delete doc.id;

      const { item } = await StudentPackSV.edit(req.payload, id, doc);
      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error('StudentPackCT edit error:', e);
      const statusCode = e.code || 500;
      return res.status(statusCode).json(ApiResponse.error(e));
    }
  };
}

module.exports = new StudentPackCT();
