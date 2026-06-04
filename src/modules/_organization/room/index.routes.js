const express = require('express');
const router = express.Router();
const RoomCT = require('./controller');
const { authenticate, userAuthorize } = require('@middlewares/auth');
const { editVD, addVD, listVD, detailVD, removeVD } = require('./middlewares/validator');
const { readPermission, addPermission, editPermission, managePermission } = require('./middlewares/permission');

// 获取列表和详情
router.post('/list', authenticate, userAuthorize(), readPermission, listVD, RoomCT.list);
router.post('/detail/:id', authenticate, userAuthorize(), readPermission, detailVD, RoomCT.detail);

// 创建数据
router.post('/add', authenticate, userAuthorize(), addPermission, addVD, RoomCT.add);

// 修改数据
router.post('/edit/:id', authenticate, userAuthorize(), editPermission, editVD, RoomCT.edit);

// 删除数据()
// router.post('/remove/:id', authenticate, userAuthorize(), managePermission, removeVD, RoomCT.remove);

module.exports = router;