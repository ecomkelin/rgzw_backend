const express = require('express');
const router = express.Router();
const UserCT = require('./controller');
const { authenticate, userAuthorize } = require('@middlewares/auth');
const { editVD, addVD, listVD, detailVD, selfEditVD } = require('./middlewares/validator');
const { readPermission, addPermission, editPermission, managePermission } = require('./middlewares/permission');

// 获取列表和详情
router.post('/list', authenticate, readPermission, listVD, UserCT.list);
router.post('/detail/:id', authenticate, readPermission, detailVD, UserCT.detail);

// 创建用户 同时会创建 Account
router.post('/add', authenticate, addPermission, addVD, UserCT.add);

// 修改和管理用户
router.post('/edit/:id', authenticate, editPermission, editVD, UserCT.edit);

// 查看自己的用户信息
router.post('/self', authenticate, userAuthorize(), selfEditVD, UserCT.selfEdit);

module.exports = router; 