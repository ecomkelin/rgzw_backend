const express = require('express');
const router = express.Router();
const StudentCT = require('./controller');
const { authenticate } = require('@middlewares/auth');
const { editVD, addVD, listVD, detailVD, selfDetailVD, selfEditVD } = require('./middlewares/validator');
const Permission = require('./middlewares/permission');

// 获取列表和详情
router.post('/list', authenticate, Permission.read, listVD, StudentCT.list);
router.post('/detail/:id', authenticate, Permission.read, detailVD, StudentCT.detail); //

// 创建学生 同时会创建 Account
router.post('/add', authenticate, Permission.add, addVD, StudentCT.add);

// 修改和管理学生
router.post('/edit/:id', authenticate, Permission.edit, editVD, StudentCT.edit);

// 注释：查看自己的学生信息（等做学生账号的时候 再启动）
router.post('/self', authenticate, Permission.selfStudent, selfDetailVD, StudentCT.selfDetail);
router.post('/self/edit', authenticate, Permission.selfStudent, selfEditVD, StudentCT.selfEdit);

module.exports = router;