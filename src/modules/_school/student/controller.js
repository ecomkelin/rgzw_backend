const AccountSV = require('../../_authorization/account/service');
const StudentSV = require('./service');
const ApiResponse = require('@utils/response');
const asyncHandler = require('@utils/asyncHandler');

class StudentCT {
  list = asyncHandler(async (req, res) => {
    try {
      const data = await StudentSV.list(req.validData, req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.error("StudentCT list error: ", error);
      return res.status(500).json(ApiResponse.serverError())
    }
  });

  detail = asyncHandler(async (req, res) => {
    try {
      const data = await StudentSV.detail(req.params.id, req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.error("StudentCT detail error: ", error);
      return res.status(500).json(ApiResponse.serverError())
    }
  });

  create = asyncHandler(async (req, res) => {
    try {
      const payload = req.payload;
      const doc_Student = req.validData?.student;

      // 如果没有提供Account，但提供了account信息，则先创建Account
      if (!doc_Student.Account) {
        if (!req.validData.account) {
          throw new Error("缺少账户信息，无法创建学生");
        }
        const doc_Account = req.validData.account;

        // 确保新账户不是管理员
        doc_Account.isAdmin = false;

        if (!doc_Account.code || !doc_Account.password || !doc_Account.name || !doc_Account.identityNo) {
          throw new Error("账户信息缺少必填字段（code、password、name、identityNo）");
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

        doc_Student.Account = data_account.item._id;
      }

      // 根据当前用户的权限和角色设置学生的Org
      if (!doc_Student.Org) {
        // 如果没有提供Org，使用当前用户所在的Org
        doc_Student.Org = payload.currentUser?.Org;
      }

      const data = await StudentSV.create(doc_Student, payload);

      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.error("StudentCT create error: ", error);
      return res.status(500).json(ApiResponse.serverError())
    }
  });

  update = asyncHandler(async (req, res) => {
    try {
      const data = await StudentSV.update(req.params.id, req.validData, req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.error("StudentCT update error: ", error);
      return res.status(500).json(ApiResponse.serverError())
    }
  });

  // 新增：激活/禁用学生
  toggleStudentStatus = asyncHandler(async (req, res) => {
    try {
      const data = await StudentSV.toggleStudentStatus(req.params.id, req.body.isActive, req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.error("StudentCT toggleStudentStatus error: ", error.message);
      return res.status(500).json(ApiResponse.serverError());
    }
  });

  // 注释：查看自己的学生信息（暂不启用）
  /*
  selfDetail = asyncHandler(async (req, res) => {
    try {
      const data = await StudentSV.selfDetail(req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.error("StudentCT selfDetail error: ", error.message)
      return res.status(500).json(ApiResponse.serverError())
    }
  });
  */

  selfUpdate = asyncHandler(async (req, res) => {
    try {
      const data = await StudentSV.selfUpdate(req.body, req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.error("StudentCT selfUpdate error: ", error)
      return res.status(500).json(ApiResponse.serverError())
    }
  });
}

module.exports = new StudentCT();