const express = require('express');
const router = express.Router();
const StudentCourseCT = require('./controller');
const { authenticate } = require('@middlewares/auth');
const { addVD, editVD, listVD, detailVD } = require('./middlewares/validator');
const Permission = require('./middlewares/permission');

// 列表 + 详情(允许 Student / Manager / Admin)
// 不挂 userAuthorize, 改由 Permission.read 校验身份 + DAO 二次过滤数据范围
router.post('/list', authenticate, Permission.read, listVD, StudentCourseCT.list);
router.post('/detail/:id', authenticate, Permission.read, detailVD, StudentCourseCT.detail);

// 添加 (仅 manager / admin) - 学生确认上课后由管理员填写
router.post('/add', authenticate, Permission.write, addVD, StudentCourseCT.add);

// 编辑 (仅 manager / admin) - 调整 StudentPack / status / remark 等
router.post('/edit/:id', authenticate, Permission.write, editVD, StudentCourseCT.edit);

module.exports = router;
