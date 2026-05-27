const express = require('express');
const router = express.Router();
const AccountCT = require('./controller');
const { authenticate } = require('../../../middlewares/auth');
const { addVD, editVD, listVD, detailVD, selfVD, selfEditVD } = require('./middlewares/validator');
const { readPermission, editPermission, addPermission } = require('./middlewares/permission');

// 获取列表和详情
router.post('/list', authenticate, readPermission, listVD, AccountCT.list);
router.post('/detail/:id', authenticate, readPermission, detailVD, AccountCT.detail);

// 创建  创建新用户或者新学生时 创建一个账号
// 注意：一个账号只能在同一组织下使用唯一的身份（User），因此在创建用户时需要确保同一账号在同一组织下没有重复的身份
router.post('/add', authenticate, addPermission, addVD, AccountCT.add);

// 修改
router.post('/edit/:id', authenticate, editPermission, editVD, AccountCT.edit);

// 自己的帐户
router.post('/self', authenticate, selfVD, AccountCT.selfDetail);
router.post('/edit/self', authenticate, selfEditVD, AccountCT.selfEdit);

module.exports = router; 