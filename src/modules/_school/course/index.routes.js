const express = require('express');
const router = express.Router();
const CourseCT = require('./controller');
const { authenticate } = require('@middlewares/auth');
const { editVD, addVD, listVD, detailVD } = require('./middlewares/validator');
const Permission = require('./middlewares/permission');

// 获取列表和详情
router.post('/list', authenticate, listVD, CourseCT.list);
router.post('/detail/:id', authenticate, detailVD, CourseCT.detail);

// 创建数据
router.post('/add', authenticate, Permission.add, addVD, CourseCT.add);

// 修改数据
router.post('/edit/:id', authenticate, Permission.edit, editVD, CourseCT.edit);

// 删除数据(暂时不做)
// router.post('/remove/:id', authenticate, removeVD, CourseCT.remove);

module.exports = router; 