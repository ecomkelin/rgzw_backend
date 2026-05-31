const mongoose = require('mongoose');
const AccountSV = require('../../_authorization/account/service');
const UserSV = require('./service');
const ApiResponse = require('@utils/response');

/**
 * 用户控制器类
 * 处理用户相关HTTP请求
 */
class UserCT {
  /**
   * 获取用户列表
   * @param {Object} req - HTTP请求对象
   * @param {Object} res - HTTP响应对象
   */
  list = async (req, res) => {
    try {
      const { filter, options } = req.validData || {};
      const { total, items, permFilter } = await UserSV.list(req.payload, filter, options);

      return res.status(200).json(ApiResponse.success({ data: { total, items, options: { permFilter } } }));
    } catch (e) {
      console.error("UserCT list error: ", e);
      return res.json(ApiResponse.error(e));
    }
  };

  /**
   * 获取用户详情
   * @param {Object} req - HTTP请求对象
   * @param {Object} res - HTTP响应对象
   */
  detail = async (req, res) => {
    try {
      const { id, options } = req.validData || {};
      const { item } = await UserSV.detail(req.payload, id, options);

      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error("UserCT detail error: ", e);
      return res.json(ApiResponse.error(e));
    }
  };

  /**
   * 创建用户（同时创建账户）
   * @param {Object} req - HTTP请求对象
   * @param {Object} res - HTTP响应对象
   */
  add = async (req, res) => {
    try {
      let session = null;   // 事务会话

      if (process.env.ACID === 'true') {
        // 启动事务
        session = await mongoose.startSession();
        session.startTransaction(); // 开启事务
      }

      const payload = req.payload;
      const doc_User = req.validData?.user;

      const data = {};

      // 如果没有提供Account，但提供了account信息，则先创建Account
      if (!doc_User.Account) {
        if (!req.validData.account) {
          throw ({ code: 400, message: "缺少账户信息，无法创建用户" });
        }

        const doc_Account = req.validData.account;
        doc_Account.accountType = 'User';

        const { item: itemAccount } = await AccountSV.add(payload, doc_Account, { session });
        data.itemAccount = itemAccount;

        doc_User.Account = itemAccount._id;
      }

      const { item: itemUser } = await UserSV.add(payload, doc_User, { session });
      data.itemUser = itemUser;

      if (process.env.ACID === 'true') {
        // 全部成功 → 提交事务
        await session.commitTransaction();
        session.endSession();
      }


      return res.status(200).json(ApiResponse.success({ data }));
    } catch (e) {
      console.error("UserCT create error: ", e);
      return res.status(500).json(ApiResponse.error(e));
    }
  };

  /**
   * 更新用户信息
   * @param {Object} req - HTTP请求对象
   * @param {Object} res - HTTP响应对象
   */
  edit = async (req, res) => {
    try {
      const id = req.validData?.id;
      const doc = req.validData;
      delete doc.id;

      const { item } = await UserSV.edit(req.payload, id, doc);
      return res.status(200).json(ApiResponse.success({ data: { item } }));
    } catch (e) {
      console.error("UserCT edit error: ", e);
      return res.status(500).json(ApiResponse.error(e));
    }
  };

  /**
   * 更新个人信息
   * @param {Object} req - HTTP请求对象
   * @param {Object} res - HTTP响应对象
   */
  selfEdit = async (req, res) => {
    try {
      const data = await UserSV.selfUpdate(req.body, req.payload);
      return res.status(200).json(ApiResponse.success(data));
    } catch (e) {
      console.error("UserCT selfUpdate error: ", e);
      return res.status(500).json(ApiResponse.error(e));
    }
  };
}

module.exports = new UserCT();