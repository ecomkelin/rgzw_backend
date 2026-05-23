const express = require('express');
const router = express.Router();
const Controller = require('./controller');
const { authenticate } = require('../../../middlewares/auth');
const { createVD, updateVD, listVD, detailVD, selfUpdateVD } = require('./middlewares/validator');
const { readPermission, createPermission, editPermission } = require('./middlewares/permission');

// 获取列表和详情
router.post('/list', authenticate, readPermission, listVD, Controller.list);
router.get('/:id', authenticate, readPermission, detailVD, Controller.detail);

// 创建 不能单独创建账户，账户由管理员在创建用户或学生时自动创建
// router.post('/create', authenticate, createPermission, createVD, Controller.create);

// 修改
router.put('/:id', authenticate, editPermission, updateVD, Controller.update);

// 自己的帐户
router.get('/detail/self', authenticate, Controller.selfDetail);
router.put('/update/self', authenticate, selfUpdateVD, Controller.selfUpdate);

module.exports = router; 