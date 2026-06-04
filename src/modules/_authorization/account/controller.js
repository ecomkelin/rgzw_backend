const AccountSV = require('./service');
const ApiResponse = require('@utils/response');

class AccountCT {
  list = async (req, res) => {
    try {
      const { filter: filterInput, options } = req.validData || {};
      const { total, items } = await AccountSV.list(req.payload, filterInput, options);

      return res.status(200).json(ApiResponse.success({ data: { total, items } }));
    } catch (e) {
      console.error("AccountCT list error: ", e);
      return res.json(ApiResponse.error(e));
    }
  }

  detail = async (req, res) => {
    try {
      const { id, options } = req.validData || {};
      const { item } = await AccountSV.detail(req.payload, id, options);

      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error("AccountCT detail error: ", e);
      return res.json(ApiResponse.error(e));
    }
  };

  add = async (req, res) => {
    try {
      const { item } = await AccountSV.add(req.payload, req.validData);
      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error("AccountCT add error: ", e);
      return res.json(ApiResponse.error(e));
    }
  };

  edit = async (req, res) => {
    try {
      const id = req.validData?.id;
      const doc = req.validData;
      delete doc.id

      const { item } = await AccountSV.edit(req.payload, id, doc);
      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error("AccountCT edit error: ", e);
      return res.json(ApiResponse.error(e));
    }
  };

  selfDetail = async (req, res) => {
    try {
      const id = req.payload._id;
      const { options = [] } = req.validData || {};
      const { item } = await AccountSV.detail(req.payload, id, options);

      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error("AccountCT selfDetail error: ", e);
      return res.json(ApiResponse.error(e));
    }
  };

  selfEdit = async (req, res) => {
    try {
      const id = req.payload._id;
      const doc = req.validData;
      delete doc.id
      const { item } = await AccountSV.edit(req.payload, id, doc);

      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error("AccountCT selfEdit error: ", e);
      return res.json(ApiResponse.error(e));
    }
  };

}

module.exports = new AccountCT();