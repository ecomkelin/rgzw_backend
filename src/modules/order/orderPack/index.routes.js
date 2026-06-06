const express = require('express');
const router = express.Router();
const OrderPackCT = require('./controller');
const { authenticate, userAuthorize, studentAuthorize } = require('@middlewares/auth');
const { addVD, editVD, listVD, detailVD } = require('./middlewares/validator');
const Permission = require('./middlewares/permission');


// 列表 + 详情(允许 Student / User)
// 注意: 不挂 userAuthorize,改由 readPermission 校验身份 + DAO 二次过滤数据范围
router.post('/list', authenticate, Permission.read, listVD, OrderPackCT.list);
router.post('/detail/:id', authenticate, Permission.read, detailVD, OrderPackCT.detail);

// 创建 (manager)
router.post('/add', authenticate, Permission.add, addVD, OrderPackCT.add);
// 用户自己创建 最好脱离DAO 重新写
// router.post('/self/add', authenticate, studentAuthorize(), selfAddVD, OrderPackCT.add);

// 编辑(admin)
router.post('/edit/:id', authenticate, Permission.edit, editVD, OrderPackCT.edit);

// 物理删除暂不开放
// router.post('/remove/:id', authenticate, managePermission, removeVD, OrderPackCT.remove);

module.exports = router;
