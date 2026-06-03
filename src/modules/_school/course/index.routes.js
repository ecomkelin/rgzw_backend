const express = require('express');
const router = express.Router();
const CourseCT = require('./controller');
const { authenticate, userAuthorize } = require('@middlewares/auth');
const { editVD, addVD, listVD, detailVD, removeVD } = require('./middlewares/validator');
const { readPermission, createPermission, editPermission, managePermission } = require('./middlewares/permission');

// 获取列表和详情
router.post('/list', authenticate, userAuthorize(), readPermission, listVD, CourseCT.list);
router.post('/detail/:id', authenticate, userAuthorize(), readPermission, detailVD, CourseCT.detail);

// 创建数据
router.post('/add', authenticate, userAuthorize(), createPermission, addVD, CourseCT.add);

// 修改数据
router.post('/edit/:id', authenticate, userAuthorize(), editPermission, editVD, CourseCT.edit);

// 删除数据(暂时不做)
// router.post('/remove/:id', authenticate, userAuthorize(), managePermission, removeVD, CourseCT.remove);

module.exports = router; 