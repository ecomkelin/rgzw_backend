const express = require('express');
const router = express.Router();
const Controller = require('./controller');
const { authenticate } = require('../../../middlewares/auth');
const { updateVD, listVD, detailVD, selfUpdateVD } = require('./middlewares/validator');
const { readPermission, createPermission, editPermission, managePermission } = require('./middlewares/permission');

// 获取列表和详情
router.post('/list', authenticate, readPermission, listVD, Controller.list);
router.get('/:id', authenticate, readPermission, detailVD, Controller.detail);

// 创建  创建新用户或者新学生时 创建一个账号
// 注意：一个账号只能在同一组织下使用唯一的身份（User），因此在创建用户时需要确保同一账号在同一组织下没有重复的身份
// router.post('/create', authenticate, createPermission, createVD, Controller.create);

// 修改
router.put('/:id', authenticate, editPermission, updateVD, Controller.update);

// 自己的帐户
router.get('/detail/self', authenticate, Controller.selfDetail);
router.put('/update/self', authenticate, selfUpdateVD, Controller.selfUpdate);

module.exports = router; 