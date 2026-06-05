// 自定义API描述配置
// 文件命名规则: [原路由文件名].desc.js (如: index.routes.desc.js)

module.exports = [
  {
    method: 'POST',
    path: '/login',
    description: '用户登录，返回访问令牌和用户信息'
  },
  {
    method: 'GET',
    path: '/refresh-token',
    description: '使用刷新令牌获取新的访问令牌'
  },
  {
    method: 'POST',
    path: '/switch-role/:id',
    description: '在同一账户下切换 currentUser (User账户) 或 currentStudent (Student账户) 身份, 重新签发访问令牌和刷新令牌'
  },
  {
    method: 'GET',
    path: '/logout',
    description: '用户登出，清除登录状态'
  }
];