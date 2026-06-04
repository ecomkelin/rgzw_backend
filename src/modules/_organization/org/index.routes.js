const express = require('express');
const router = express.Router();
const OrgCT = require('./controller');
const { authenticate, userAuthorize } = require('@middlewares/auth');
const { editVD, addVD, listVD, detailVD } = require('./middlewares/validator');
const { readPermission, addPermission, editPermission } = require('./middlewares/permission');

// 获取列表和详情
router.post('/list', authenticate, readPermission, listVD, OrgCT.list);
router.post('/detail/:id', authenticate, readPermission, detailVD, OrgCT.detail);

// 创建
router.post('/add', authenticate, addPermission, addVD, OrgCT.add);

// 修改
router.post('/edit/:id', authenticate, editPermission, editVD, OrgCT.edit);

// 查看自己的帐户
router.post('/self', authenticate, OrgCT.selfDetail);

module.exports = router;