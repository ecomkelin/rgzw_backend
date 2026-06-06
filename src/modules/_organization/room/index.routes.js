const express = require('express');
const router = express.Router();
const RoomCT = require('./controller');
const { authenticate } = require('@middlewares/auth');
const { editVD, addVD, listVD, detailVD } = require('./middlewares/validator');
const Permission = require('./middlewares/permission');

// 获取列表和详情
router.post('/list', authenticate, listVD, RoomCT.list);
router.post('/detail/:id', authenticate, detailVD, RoomCT.detail);

// 创建数据
router.post('/add', authenticate, Permission.add, addVD, RoomCT.add);

// 修改数据
router.post('/edit/:id', authenticate, Permission.edit, editVD, RoomCT.edit);

// 删除数据()
// router.post('/remove/:id', authenticate, managePermission, removeVD, RoomCT.remove);

module.exports = router;