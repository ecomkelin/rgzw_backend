const AccountSV = require('../../_authorization/account/service');
const UserSV = require('./service');
const ApiResponse = require('@utils/response');
const asyncHandler = require('@utils/asyncHandler');

class UserCT {
  list = asyncHandler(async (req, res) => {
    try {
      const data = await UserSV.list(req.validData, req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.error("UserCT list error: ", error);
      return res.status(500).json(ApiResponse.serverError())
    }
  });

  detail = asyncHandler(async (req, res) => {
    try {
      const data = await UserSV.detail(req.params.id, req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.error("UserCT detail error: ", error);
      return res.status(500).json(ApiResponse.serverError())
    }
  });

  create = asyncHandler(async (req, res) => {
    try {
      const payload = req.payload;
      const doc_User = req.validData?.user;

      // 如果没有提供Account，但提供了account信息，则先创建Account
      if (!doc_User.Account) {
        if (!req.validData.account) {
          throw new Error("缺少账户信息，无法创建用户");
        }
        const doc_Account = req.validData.account;

        // 确保新账户不是管理员
        doc_Account.isAdmin = false;

        if (!doc_Account.code || !doc_Account.password || !doc_Account.name || !doc_Account.identityNo) {
          throw new Error("账户信息缺少必填字段（code、password、name）");
        }
        if (doc_Account.password.length < 8 || doc_Account.password.length > 16) {
          throw new Error("账户密码长度必须在8到16个字符之间");
        }
        if (doc_Account.code.length < 4 || doc_Account.code.length > 16) {
          throw new Error("账户编码长度必须在4到16个字符之间");
        }
        if (doc_Account.name.length < 2 || doc_Account.name.length > 50) {
          throw new Error("账户名称长度必须在2到50个字符之间");
        }
        if (doc_Account.identityNo.length < 15 || doc_Account.identityNo.length > 18) {
          throw new Error("账户身份证号码长度必须在15到18个字符之间");
        }
        if (doc_Account.phone && (doc_Account.phone.length < 10 || doc_Account.phone.length > 15)) {
          throw new Error("账户电话号码长度必须在10到15个字符之间");
        }

        const data_account = await AccountSV.create(doc_Account, payload);

        doc_User.Account = data_account.item._id;
      }

      // 如果没有提供Org，且当前用户是经理，限制只能在自己的组织内创建
      if (!doc_User.Org) {
        doc_User.Org = payload.current_org_id;
      }

      const data = await UserSV.create(doc_User, payload);

      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.error("UserCT create error: ", error);
      return res.status(500).json(ApiResponse.serverError())
    }
  });

  update = asyncHandler(async (req, res) => {
    try {
      const data = await UserSV.update(req.params.id, req.validData, req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.error("UserCT update error: ", error);
      return res.status(500).json(ApiResponse.serverError())
    }
  });

  selfUpdate = asyncHandler(async (req, res) => {
    try {
      const data = await UserSV.selfUpdate(req.body, req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.error("UserCT selfUpdate error: ", error)
      return res.status(500).json(ApiResponse.serverError())
    }
  });
}

module.exports = new UserCT();