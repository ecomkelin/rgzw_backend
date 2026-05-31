const express = require('express');
const router = express.Router();
const RoomCT = require('./controller');
const { authenticate, userAuthorize } = require('@middlewares/auth');
const { editVD, addVD, listVD, detailVD } = require('./middlewares/validator');
const { readPermission, createPermission, editPermission, managePermission } = require('./middlewares/permission');

// 获取列表和详情
router.post('/list', authenticate, readPermission, listVD, RoomCT.list);
router.post('/detail/:id', authenticate, readPermission, detailVD, RoomCT.detail);

// 创建教室
router.post('/add', authenticate, createPermission, addVD, RoomCT.add);

// 修改教室
router.post('/edit/:id', authenticate, editPermission, editVD, RoomCT.edit);

module.exports = router;