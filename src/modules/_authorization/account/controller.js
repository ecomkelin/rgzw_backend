const Service = require('./service');
const ApiResponse = require('../../../utils/response');
const asyncHandler = require('../../../utils/asyncHandler');

class AccountCT {
  list = asyncHandler(async (req, res) => {
    try {
      console.log('AccountCT list method called for user:', req.payload._id);

      const data = await Service.list(req.validData, req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.error("AccountCT list error: ", {
        message: error.message,
        userId: req.payload._id,
        timestamp: new Date().toISOString()
      });

      // 在生产环境中，不要暴露内部错误细节
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json(ApiResponse.serverError());
      } else {
        return res.status(500).json(ApiResponse.serverError(error.message));
      }
    }
  });

  detail = asyncHandler(async (req, res) => {
    try {
      const data = await Service.detail(req.params.id, req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.error("AccountCT detail error: ", error.message);
      return res.status(500).json(ApiResponse.serverError());
    }
  });

  create = asyncHandler(async (req, res) => {
    try {
      const data = await Service.create(req.validData, req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.error("AccountCT create error: ", error.message);
      return res.status(500).json(ApiResponse.serverError());
    }
  });

  update = asyncHandler(async (req, res) => {
    try {
      const data = await Service.update(req.params.id, req.validData, req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.error("AccountCT update error: ", error.message);
      return res.status(500).json(ApiResponse.serverError());
    }
  });

  selfDetail = asyncHandler(async (req, res) => {
    try {
      const data = await Service.selfDetail(req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.error("AccountCT selfDetail error: ", error.message);
      return res.status(500).json(ApiResponse.serverError());
    }
  });

  selfUpdate = asyncHandler(async (req, res) => {
    try {
      const data = await Service.selfUpdate(req.body, req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.error("AccountCT selfUpdate error: ", error.message);
      return res.status(500).json(ApiResponse.serverError());
    }
  });
}

module.exports = new AccountCT();