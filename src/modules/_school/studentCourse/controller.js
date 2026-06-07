const StudentCourseSV = require('./service');
const ApiResponse = require('@utils/response');

/**
 * StudentCourse 控制器
 * 处理学生选课（StudentCourse）相关 HTTP 请求
 *
 * 业务背景: 学生确认上课后, 管理员在管理后台手动 add 选课记录
 */
class StudentCourseCT {
  /**
   * 获取学生选课列表
   */
  list = async (req, res) => {
    try {
      const { filter, options } = req.validData || {};
      const { total, items } = await StudentCourseSV.list(req.payload, filter, options);

      return res.status(200).json(ApiResponse.success({ data: { total, items } }));
    } catch (e) {
      console.error('StudentCourseCT list error:', e);
      const statusCode = e.code || 500;
      return res.status(statusCode).json(ApiResponse.error(e));
    }
  };

  /**
   * 获取学生选课详情
   */
  detail = async (req, res) => {
    try {
      const { id, options } = req.validData || {};
      const { item } = await StudentCourseSV.detail(req.payload, id, options);

      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error('StudentCourseCT detail error:', e);
      const statusCode = e.code || 500;
      return res.status(statusCode).json(ApiResponse.error(e));
    }
  };

  /**
   * 添加学生选课 (学生确认上课后, 管理员填写)
   */
  add = async (req, res) => {
    try {
      const { item } = await StudentCourseSV.add(req.payload, req.validData);
      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error('StudentCourseCT add error:', e);
      const statusCode = e.code || 500;
      return res.status(statusCode).json(ApiResponse.error(e));
    }
  };

  /**
   * 编辑学生选课 (调整 StudentPack / status / remark 等)
   */
  edit = async (req, res) => {
    try {
      const id = req.validData?.id;
      const doc = { ...req.validData };
      delete doc.id;

      const { item } = await StudentCourseSV.edit(req.payload, id, doc);
      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error('StudentCourseCT edit error:', e);
      const statusCode = e.code || 500;
      return res.status(statusCode).json(ApiResponse.error(e));
    }
  };
}

module.exports = new StudentCourseCT();
