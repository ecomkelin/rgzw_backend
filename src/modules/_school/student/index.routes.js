const express = require('express');
const router = express.Router();
const Controller = require('./controller');
const { authenticate } = require('@middlewares/auth');
const { updateVD, createVD, listVD, detailVD, selfUpdateVD } = require('./middlewares/validator');
const { readPermission, createPermission, editPermission, managePermission } = require('./middlewares/permission');

// 获取列表和详情
router.post('/list', authenticate, readPermission, listVD, Controller.list);
router.get('/:id', authenticate, readPermission, detailVD, Controller.detail);

// 创建学生 同时会创建 Account
router.post('/create', authenticate, createPermission, createVD, Controller.create);

// 修改和管理学生
router.put('/:id', authenticate, editPermission, updateVD, Controller.update);
router.patch('/:id/status', authenticate, managePermission, detailVD, Controller.toggleStudentStatus);

// 注释：查看自己的学生信息（暂不启用）
// router.get('/self/detail', authenticate, Controller.selfDetail);
// router.put('/update/self', authenticate, selfUpdateVD, Controller.selfUpdate);

module.exports = router;