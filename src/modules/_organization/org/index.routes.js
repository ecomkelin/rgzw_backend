const express = require('express');
const router = express.Router();
const OrgCT = require('./controller');
const { authenticate } = require('@middlewares/auth');
const { updateVD, createVD, listVD, detailVD } = require('./middlewares/validator');
const { readPermission, createPermission, editPermission, managePermission } = require('./middlewares/permission');

// 获取列表和详情
router.post('/list', authenticate, readPermission, listVD, OrgCT.list);
router.get('/:id', authenticate, readPermission, detailVD, OrgCT.detail);

// 创建
router.post('/create', authenticate, createPermission, createVD, OrgCT.create);

// 修改
router.put('/:id', authenticate, editPermission, updateVD, OrgCT.update);

// 查看自己的帐户
router.get('/detail/self', authenticate, OrgCT.selfDetail);

module.exports = router;