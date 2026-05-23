const express = require('express');
const router = express.Router();
const Controller = require('./controller');
const { authenticate } = require('../../../middlewares/auth');
const { updateVD, createVD, listVD, detailVD, selfUpdateVD } = require('./middlewares/validator');
const { readPermission, createPermission, editPermission, managePermission } = require('./middlewares/permission');

// 获取列表和详情
router.post('/list', authenticate, readPermission, listVD, Controller.list);
router.get('/:id', authenticate, readPermission, detailVD, Controller.detail);

// 创建用户 同时会创建 Account
router.post('/create', authenticate, createPermission, createVD, Controller.create);

// 修改和管理用户
router.put('/:id', authenticate, editPermission, updateVD, Controller.update);

// 查看自己的用户信息
router.put('/update/self', authenticate, selfUpdateVD, Controller.selfUpdate);

module.exports = router; 