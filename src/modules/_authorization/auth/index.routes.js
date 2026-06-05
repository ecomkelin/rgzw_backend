const express = require('express');
const router = express.Router();
const AuthCT = require('./controller');
const { authenticate } = require('@middlewares/auth');
const { loginVD, switchRoleVD } = require('./middlewares/validator');

// 登录路由
router.post('/login', loginVD, AuthCT.login);

// 刷新令牌路由
router.get('/refresh-token', AuthCT.refreshToken);

// 切换身份路由
router.post('/switch-role/:id', authenticate, switchRoleVD, AuthCT.switchRole);

// 登出路由
router.get('/logout', authenticate, AuthCT.logout);


module.exports = router; 