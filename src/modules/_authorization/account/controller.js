const AccountSV = require('./service');
const ApiResponse = require('@utils/response');
const asyncHandler = require('@utils/asyncHandler');

class AccountCT {
  list = asyncHandler(async (req, res) => {
    try {
      const { filter, options } = req.validData || {};
      const { total, items, permFilter } = await AccountSV.list(req.payload, filter, options);

      return res.status(200).json(ApiResponse.success({ data: { total, items, options: { permFilter } } }));
    } catch (e) {
      console.error("AccountCT list error: ", e);
      return res.json(ApiResponse.error(e));
    }
  });

  detail = asyncHandler(async (req, res) => {
    try {
      const { id, options } = req.validData || {};
      const { item } = await AccountSV.detail(req.payload, id, options);

      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error("AccountCT detail error: ", e);
      return res.json(ApiResponse.error(e));
    }
  });

  edit = asyncHandler(async (req, res) => {
    try {
      const id = req.validData?.id;
      const doc = req.validData;
      delete doc.id

      const { item } = await AccountSV.edit(req.payload, req.params.id, req.validData);
      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error("AccountCT edit error: ", e);
      return res.json(ApiResponse.error(e));
    }
  });

  selfDetail = asyncHandler(async (req, res) => {
    try {
      const id = req.payload._id;
      const { options = [] } = req.validData || {};
      const { item } = await AccountSV.detail(req.payload, id, options);

      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error("AccountCT selfDetail error: ", e);
      return res.json(ApiResponse.error(e));
    }
  });

  selfEdit = asyncHandler(async (req, res) => {
    try {
      const id = req.payload?._id;
      const doc = req.validData
      const data = await AccountSV.edit(req.payload, id, doc);

      return res.status(200).json(ApiResponse.success({ data }));
    } catch (e) {
      console.error("AccountCT selfUpdate error: ", e);
      return res.json(ApiResponse.error(e));
    }
  });

}

module.exports = new AccountCT();