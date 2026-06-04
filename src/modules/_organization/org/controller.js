const OrgSV = require('./service');
const ApiResponse = require('@utils/response');
const { payloadChecker } = require('@utils/payloadChecker');
class OrgCT {
  list = async (req, res) => {
    try {
      const { filter, options } = req.validData || {};
      const { total, items } = await OrgSV.list(req.payload, filter, options);

      return res.status(200).json(ApiResponse.success({ data: { total, items } }));
    } catch (e) {
      console.error("OrgCT list error: ", e)
      return res.json(ApiResponse.error(e))
    }
  };

  detail = async (req, res) => {
    try {
      const { id, options } = req.validData || {};
      const { item } = await OrgSV.detail(req.payload, id, options);

      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error("OrgCT detail error: ", e)
      return res.json(ApiResponse.error(e))
    }
  };

  add = async (req, res) => {
    try {
      const doc = req.validData;
      const { item } = await OrgSV.add(req.payload, doc);
      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error("OrgCT add error: ", e)
      return res.json(ApiResponse.error(e))
    }
  };

  edit = async (req, res) => {
    try {
      const id = req.validData?.id;
      const doc = req.validData;
      delete doc.id

      const { item } = await OrgSV.edit(req.payload, id, doc);
      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error("OrgCT edit error: ", e)
      return res.json(ApiResponse.error(e))
    }
  };

  selfDetail = async (req, res) => {
    try {
      payloadChecker(req.payload);
      const payload = req.payload;
      const id = payload.accountType === 'User' ? payload.currentUser.Org : payload.currentStudent.Org;

      const { options = {} } = req.validData || {};
      const { item } = await OrgSV.detail(payload, id, options);

      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error("OrgCT selfDetail error: ", e)
      return res.json(ApiResponse.error(e))
    }
  };
}

module.exports = new OrgCT();