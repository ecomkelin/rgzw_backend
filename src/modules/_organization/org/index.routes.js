const express = require('express');
const router = express.Router();
const Controller = require('./controller');
const { authenticate } = require('../../../middlewares/auth');
const { updateVD, createVD, listVD, detailVD } = require('./middlewares/validator');
const { readPermission, createPermission, editPermission } = require('./middlewares/permission');

// 获取列表和详情
router.post('/list', authenticate, readPermission, listVD, Controller.list);
router.get('/:id', authenticate, readPermission, detailVD, Controller.detail);

// 创建
router.post('/create', authenticate, createPermission, createVD, Controller.create);

// 修改
router.put('/:id', authenticate, editPermission, updateVD, Controller.update);

// 查看自己的帐户
router.get('/detail/self', authenticate, Controller.selfDetail);

module.exports = router; 