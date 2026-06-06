const express = require('express');
const router = express.Router();
const SubjectCT = require('./controller');
const { authenticate, userAuthorize } = require('@middlewares/auth');
const { editVD, addVD, listVD, detailVD } = require('./middlewares/validator');
const Permission = require('./middlewares/permission');

// 获取列表和详情
router.post('/list', authenticate, listVD, SubjectCT.list);
router.post('/detail/:id', authenticate, detailVD, SubjectCT.detail);

// 创建数据
router.post('/add', authenticate, Permission.add, addVD, SubjectCT.add);

// 修改数据
router.post('/edit/:id', authenticate, Permission.edit, editVD, SubjectCT.edit);

// 删除数据(暂时不做)
// router.post('/remove/:id', authenticate, managePermission, removeVD, SubjectCT.remove);

module.exports = router; 