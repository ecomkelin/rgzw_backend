const express = require('express');
const router = express.Router();
const OrderPackCT = require('./controller');
const { authenticate, userAuthorize } = require('@middlewares/auth');
const { addVD, editVD, listVD, detailVD } = require('./middlewares/validator');
const { readPermission, addPermission, editPermission } = require('./middlewares/permission');

/**
 * 路由说明
 *
 * 模块路径: src/modules/order/orderPack
 * 自动加载后挂载前缀: /api/order/orderPack
 *
 * 中间件链:
 *   list / detail -> authenticate + readPermission(放行 Student/isAdmin/manager)
 *                    Student 走 list/detail 时由 DAO 二次过滤:
 *                      - Student: filter.Student = currentStudent._id(只能看自己)
 *                      - manager : filter.Org     = currentUser.Org
 *                      - isAdmin : 看全平台
 *
 *   add / edit    -> authenticate + userAuthorize()(只放行 User) + addPermission/editPermission
 *                    add 允许 isAdmin / manager
 *                    edit 仅允许 isAdmin(经理不能改)
 *
 * 不开放 remove: 订单是审计关键数据。
 */

// 列表 + 详情(允许 Student / User)
// 注意: 不挂 userAuthorize,改由 readPermission 校验身份 + DAO 二次过滤数据范围
router.post('/list', authenticate, readPermission, listVD, OrderPackCT.list);
router.post('/detail/:id', authenticate, readPermission, detailVD, OrderPackCT.detail);

// 创建 / 编辑(仅 User)
router.post('/add', authenticate, userAuthorize(), addPermission, addVD, OrderPackCT.add);
router.post('/edit/:id', authenticate, userAuthorize(), editPermission, editVD, OrderPackCT.edit);

// 物理删除暂不开放
// router.post('/remove/:id', authenticate, userAuthorize(), managePermission, removeVD, OrderPackCT.remove);

module.exports = router;
