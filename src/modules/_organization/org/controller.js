const OrgSV = require('./service');
const ApiResponse = require('../../../utils/response');
const asyncHandler = require('../../../utils/asyncHandler');

class OrgCT {
  list = asyncHandler(async (req, res) => {
    try {
      const data = await OrgSV.list(req.validData, req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.error("OrgCT list error: ", error.message)
      return res.status(500).json(ApiResponse.serverError())
    }
  });

  detail = asyncHandler(async (req, res) => {
    try {
      const data = await OrgSV.detail(req.params.id, req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.error("OrgCT detail error: ", error.message)
      return res.status(500).json(ApiResponse.serverError())
    }
  });

  create = asyncHandler(async (req, res) => {
    try {
      const data = await OrgSV.create(req.validData, req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.error("OrgCT create error: ", error.message)
      return res.status(500).json(ApiResponse.serverError())
    }
  });

  update = asyncHandler(async (req, res) => {
    try {
      const data = await OrgSV.update(req.params.id, req.validData, req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.error("OrgCT update error: ", error.message)
      return res.status(500).json(ApiResponse.serverError())
    }
  });

  selfDetail = asyncHandler(async (req, res) => {
    try {
      const data = await OrgSV.selfDetail(req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.error("OrgCT selfDetail error: ", error.message)
      return res.status(500).json(ApiResponse.serverError())
    }
  });
}

module.exports = new OrgCT();