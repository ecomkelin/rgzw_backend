const express = require('express');
const router = express.Router();
const StudentPackCT = require('./controller');
const { authenticate } = require('@middlewares/auth');
const { addVD, editVD, listVD, detailVD } = require('./middlewares/validator');
const Permission = require('./middlewares/permission');

// 列表 + 详情(允许 Student / Manager / Admin)
// 不挂 userAuthorize, 改由 readPermission 校验身份 + DAO 二次过滤数据范围
router.post('/list', authenticate, Permission.read, listVD, StudentPackCT.list);
router.post('/detail/:id', authenticate, Permission.read, detailVD, StudentPackCT.detail);

// 手动添加 (仅超管, resource='free' 赠送)
router.post('/add', authenticate, Permission.add, addVD, StudentPackCT.add);

// 编辑 (仅超管)
router.post('/edit/:id', authenticate, Permission.edit, editVD, StudentPackCT.edit);

module.exports = router;
