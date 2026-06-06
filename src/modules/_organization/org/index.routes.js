const express = require('express');
const router = express.Router();
const OrgCT = require('./controller');
const { authenticate } = require('@middlewares/auth');
const { editVD, addVD, listVD, detailVD } = require('./middlewares/validator');
const Permission = require('./middlewares/permission');

// 获取列表和详情
router.post('/list', authenticate, Permission.read, listVD, OrgCT.list);
router.post('/detail/:id', authenticate, Permission.read, detailVD, OrgCT.detail);

// 创建
router.post('/add', authenticate, Permission.add, addVD, OrgCT.add);

// 修改
router.post('/edit/:id', authenticate, Permission.edit, editVD, OrgCT.edit);

// 查看自己的帐户
router.post('/self', authenticate, OrgCT.selfDetail);

module.exports = router;