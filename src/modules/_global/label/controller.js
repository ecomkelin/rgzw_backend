const LabelSV = require('./service');
const ApiResponse = require('../../../utils/response');
const asyncHandler = require('../../../utils/asyncHandler');

class LabelCT {
  list = asyncHandler(async (req, res) => {
    try {
      const { items, query, pagination } = await LabelSV.list(req.validData, req.payload);
      return res.status(200).json(ApiResponse.success({
        items,
        query,
        pagination
      }));
    } catch (error) {
      console.error("LabelCT list error: ", error.message);
      return res.status(500).json(ApiResponse.serverError())
    }
  });

  detail = asyncHandler(async (req, res) => {
    try {
      const data = await LabelSV.detail(req.params.id, req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      if (error.message === "此数据已不存在") {
        return res.status(404).json(ApiResponse.notFoundError("标签不存在"));
      } else if (error.message.includes("无权") || error.message.includes("其他公司")) {
        return res.status(403).json(ApiResponse.forbiddenError("无权访问该标签"));
      }
      console.error("LabelCT detail error: ", error.message);
      return res.status(500).json(ApiResponse.serverError())
    }
  });

  create = asyncHandler(async (req, res) => {
    try {
      const data = await LabelSV.create(req.validData, req.payload);
      return res.status(201).json(ApiResponse.success(data));
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json(ApiResponse.error("标签名称已存在"));
      }
      console.error("LabelCT create error: ", error.message);
      return res.status(500).json(ApiResponse.serverError())
    }
  });

  update = asyncHandler(async (req, res) => {
    try {
      const data = await LabelSV.update(req.params.id, req.validData, req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      if (error.message === '标签不存在') {
        return res.status(404).json(ApiResponse.notFoundError("标签不存在"));
      } else if (error.message.includes("无权限")) {
        return res.status(403).json(ApiResponse.forbiddenError("无权修改该标签"));
      } else if (error.code === 11000) {
        return res.status(409).json(ApiResponse.error("标签名称已存在"));
      }
      console.error("LabelCT update error: ", error.message);
      return res.status(500).json(ApiResponse.serverError())
    }
  });

  delete = asyncHandler(async (req, res) => {
    try {
      // 检查是否请求软删除
      const softDelete = req.query.softDelete === 'true' || req.body.softDelete === true;
      const data = await LabelSV.delete(req.params.id, req.payload, softDelete);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      if (error.message === '标签不存在') {
        return res.status(404).json(ApiResponse.notFoundError("标签不存在"));
      } else if (error.message.includes("无权限")) {
        return res.status(403).json(ApiResponse.forbiddenError("无权删除该标签"));
      }
      console.error("LabelCT delete error: ", error.message);
      return res.status(500).json(ApiResponse.serverError())
    }
  });

  deleteIds = asyncHandler(async (req, res) => {
    try {
      // 检查是否请求软删除
      const softDelete = req.query.softDelete === 'true' || req.body.softDelete === true;
      const data = await LabelSV.deleteMany(req.validData, req.payload, softDelete);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      if (error.message.includes("ids必须是数组")) {
        return res.status(400).json(ApiResponse.badRequestError(error.message));
      }
      console.error("LabelCT deleteIds error: ", error.message);
      return res.status(500).json(ApiResponse.serverError())
    }
  });
}

module.exports = new LabelCT(); 