const express = require('express');
const router = express.Router();
const UserCT = require('./controller');
const { authenticate } = require('@middlewares/auth');
const { editVD, addVD, listVD, detailVD, selfDetailVD } = require('./middlewares/validator');
const Permission = require('./middlewares/permission');

// 获取列表和详情
router.post('/list', authenticate, Permission.read, listVD, UserCT.list);
router.post('/detail/:id', authenticate, Permission.read, detailVD, UserCT.detail);

// 创建用户 同时会创建 Account
router.post('/add', authenticate, Permission.add, addVD, UserCT.add);

// 修改和管理用户
router.post('/edit/:id', authenticate, Permission.edit, editVD, UserCT.edit);

// 查看自己的用户信息
router.post('/self', authenticate, Permission.selfDetail, selfDetailVD, UserCT.selfEdit);

module.exports = router; 