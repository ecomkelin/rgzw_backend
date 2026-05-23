const express = require('express');
const router = express.Router();
const Controller = require('./controller');
const { authenticate } = require('../../../middlewares/auth');
const { updateVD, createVD, listVD, detailVD, selfUpdateVD } = require('./middlewares/validator');
const { readPermission, createPermission, editPermission } = require('./middlewares/permission');

// 获取列表和详情
router.post('/list', authenticate, readPermission, listVD, Controller.list);
router.get('/:id', authenticate, readPermission, detailVD, Controller.detail);
// 修改
router.put('/:id', authenticate, editPermission, updateVD, Controller.update);

// 查看自己的帐户
router.get('/self/list', authenticate, Controller.selfDetail);
router.put('/self/update', authenticate, selfUpdateVD, Controller.selfUpdate);

// 创建
// 在一个Account的基础上创建User 不创建Account
router.post('/add', authenticate, createPermission, createVD, Controller.create);
// 创建User 并且创建Account
router.post('/create', authenticate, createPermission, createVD, Controller.create);

// 用户 不可删除

module.exports = router; 