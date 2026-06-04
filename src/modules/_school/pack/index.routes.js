const express = require('express');
const router = express.Router();
const PackCT = require('./controller');
const { authenticate, userAuthorize } = require('@middlewares/auth');
const { editVD, addVD, listVD, detailVD } = require('./middlewares/validator');
const { readPermission, addPermission, editPermission } = require('./middlewares/permission');

// 获取列表和详情
router.post('/list', authenticate, userAuthorize(), readPermission, listVD, PackCT.list);
router.post('/detail/:id', authenticate, userAuthorize(), readPermission, detailVD, PackCT.detail);

// 创建数据
router.post('/add', authenticate, userAuthorize(), addPermission, addVD, PackCT.add);

// 修改数据
router.post('/edit/:id', authenticate, userAuthorize(), editPermission, editVD, PackCT.edit);

// 删除数据(暂时不做)
// router.post('/remove/:id', authenticate, userAuthorize(), managePermission, removeVD, PackCT.remove);

module.exports = router; 