const mongoose = require('mongoose');
const AccountSV = require('../../_authorization/account/service');
const StudentSV = require('./service');
const ApiResponse = require('@utils/response');
const asyncHandler = require('@utils/asyncHandler');

class StudentCT {
  list = asyncHandler(async (req, res) => {
    try {
      const { filter, options } = req.validData || {};
      const { total, items, permFilter } = await StudentSV.list(req.payload, filter, options);

      return res.status(200).json(ApiResponse.success({ data: { total, items, options: { permFilter } } }));
    } catch (e) {
      console.error("StudentCT list error: ", e)
      return res.json(ApiResponse.error(e))
    }
  });

  detail = asyncHandler(async (req, res) => {
    try {
      const { id, options } = req.validData || {};
      const { item } = await StudentSV.detail(req.payload, id, options);

      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error("StudentCT detail error: ", e)
      return res.json(ApiResponse.error(e))
    }
  });

  add = asyncHandler(async (req, res) => {
    try {
      // 启动事务
      const session = await mongoose.startSession();
      session.startTransaction(); // 开启事务

      const payload = req.payload;
      const doc_Student = req.validData?.student;

      const data = {}
      // 如果没有提供Account，但提供了account信息，则先创建Account
      if (!doc_Student.Account) {
        if (!req.validData.account) {
          throw ({ code: 400, message: "缺少账户信息，无法创建学生" });
        }

        const doc_Account = req.validData.account;
        doc_Account.accountType = 'Student';
        const { item: itemAccount } = await AccountSV.add(payload, doc_Account, { session });
        data.itemAccount = itemAccount;

        doc_Student.Account = itemAccount._id;
      }

      const { item: itemStudent } = await StudentSV.add(payload, doc_Student, { session });
      data.itemStudent = itemStudent;

      // 全部成功 → 提交事务
      await session.commitTransaction();
      session.endSession();

      return res.status(200).json(ApiResponse.success({ data }));
    } catch (e) {
      console.error("StudentCT create error: ", e);
      return res.status(500).json(ApiResponse.error(e))
    }
  });

  edit = asyncHandler(async (req, res) => {
    try {
      const id = req.validData?.id;
      const doc = req.validData;
      delete doc.id

      const { item } = await StudentSV.edit(req.payload, id, doc);
      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error("StudentCT edit error: ", e)
      return res.status(500).json(ApiResponse.error(e))
    }
  });

  // 注释：学生账号查看自己的信息（暂不启用）
  /*
  selfDetail = asyncHandler(async (req, res) => {
    try {
      const data = await StudentSV.selfDetail(req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (e) {
      console.error("StudentCT selfDetail error: ", e);
      return res.status(500).json(ApiResponse.error(e));
    }
  });
  */

  // 注释：学生账号修改自己的信息（暂不启用）
  /*
  selfUpdate = asyncHandler(async (req, res) => {
    try {
      const data = await StudentSV.selfUpdate(req.body, req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (e) {
      console.error("StudentCT selfUpdate error: ", e)
      return res.status(500).json(ApiResponse.error(e))
    }
  });
  */
}

module.exports = new StudentCT();