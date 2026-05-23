const Service_Account = require('../../_authorization/account/service');
const Service = require('./service');
const ApiResponse = require('../../../utils/response');
const asyncHandler = require('../../../utils/asyncHandler');

class UserCT {
  list = asyncHandler(async (req, res) => {
    try {
      const data = await Service.list(req.validData, req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.error("UserCT list error: ", error.message)
      return res.status(500).json(ApiResponse.serverError())
    }
  });

  detail = asyncHandler(async (req, res) => {
    try {
      const data = await Service.detail(req.params.id, req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.error("UserCT detail error: ", error.message)
      return res.status(500).json(ApiResponse.serverError())
    }
  });

  create = asyncHandler(async (req, res) => {
    try {
      const payload = req.payload;
      const doc_User = req.validData?.user;
      if (!doc_User.Account) {
        const doc_Account = req.validData.account;
        const data_account = await Service_Account.create({ doc_Account, payload });

        doc_User.Account = data_account.item._id;
        if (!doc_User.Org) doc_User.Org = payload.Org_id;
      }

      const data = await Service.create(doc_User, payload);

      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.error("UserCT create error: ", error.message)
      return res.status(500).json(ApiResponse.serverError())
    }
  });

  update = asyncHandler(async (req, res) => {
    try {
      const data = await Service.update(req.params.id, req.validData, req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.error("UserCT update error: ", error.message)
      return res.status(500).json(ApiResponse.serverError())
    }
  });

  selfDetail = asyncHandler(async (req, res) => {
    try {
      const data = await Service.selfDetail(req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.error("UserCT selfDetail error: ", error.message)
      return res.status(500).json(ApiResponse.serverError())
    }
  });
  selfUpdate = asyncHandler(async (req, res) => {
    try {
      const data = await Service.selfUpdate(req.body, req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.error("UserCT selfUpdate error: ", error.message)
      return res.status(500).json(ApiResponse.serverError())
    }
  });
}

module.exports = new UserCT(); 