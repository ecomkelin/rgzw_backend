// 自定义 API 描述配置
// 文件命名规则: [原路由文件名].desc.js (如: index.routes.desc.js)
// 此文件与 src/modules/_authorization/auth/index.routes.js 严格对应

module.exports = [
  {
    method: 'POST',
    path: '/login',
    description: '用户登录，返回访问令牌和账户信息（refreshToken 通过 HttpOnly Cookie 设置）'
  },
  {
    method: 'GET',
    path: '/refresh-token',
    description: '使用刷新令牌（来自 Cookie）获取新的访问令牌'
  },
  {
    method: 'POST',
    path: '/switch-role/:id',
    description: '在同一账户下切换 currentUser (User 账户) 或 currentStudent (Student 账户) 身份，重新签发访问令牌和刷新令牌'
  },
  {
    method: 'POST',
    path: '/logout',
    description: '用户登出，清除 session 并清空 refreshToken Cookie'
  }
];
