const express = require('express');
const router = express.Router();
const Controller = require('./controller');
const { authenticate } = require('@middlewares/auth');
const { editVD, addVD, listVD, detailVD } = require('./middlewares/validator');
const { readPermission, addPermission, editPermission } = require('./middlewares/permission');

// 获取列表和详情
router.post('/list', authenticate, readPermission, listVD, Controller.list);
router.post('/detail/:id', authenticate, readPermission, detailVD, Controller.detail);

// 创建学生 同时会创建 Account
router.post('/add', authenticate, addPermission, addVD, Controller.add);

// 修改和管理学生
router.post('/edit/:id', authenticate, editPermission, editVD, Controller.edit);

// 注释：查看自己的学生信息（等做学生账号的时候 再启动）
// router.post('/self', authenticate, Controller.selfDetail);
// router.post('/edit/self', authenticate, selfUpdateVD, Controller.selfUpdate);

module.exports = router;