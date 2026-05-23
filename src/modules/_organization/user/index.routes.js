const express = require('express');
const router = express.Router();
const UserCT = require('./controller');
const { authenticate } = require('@middlewares/auth');
const { updateVD, createVD, listVD, detailVD, selfUpdateVD } = require('./middlewares/validator');
const { readPermission, createPermission, editPermission, managePermission } = require('./middlewares/permission');

// 获取列表和详情
router.post('/list', authenticate, readPermission, listVD, UserCT.list);
router.get('/:id', authenticate, readPermission, detailVD, UserCT.detail);

// 创建用户 同时会创建 Account
router.post('/create', authenticate, createPermission, createVD, UserCT.create);

// 修改和管理用户
router.put('/:id', authenticate, editPermission, updateVD, UserCT.update);

// 查看自己的用户信息
router.put('/update/self', authenticate, selfUpdateVD, UserCT.selfUpdate);

module.exports = router; 