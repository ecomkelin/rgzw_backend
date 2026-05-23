// 自定义API描述配置
// 文件命名规则: [原路由文件名].desc.js (如: index.routes.desc.js)

module.exports = [
  {
    method: 'POST',
    path: '/list',
    description: '获取用户列表，支持分页和筛选功能'
  },
  {
    method: 'GET',
    path: '/:id',
    description: '根据ID获取单个用户的详细信息'
  },
  {
    method: 'POST',
    path: '/create',
    description: '创建新用户'
  },
  {
    method: 'PUT',
    path: '/:id',
    description: '根据ID更新用户信息'
  },
  {
    method: 'GET',
    path: '/detail/self',
    description: '获取当前登录用户的个人信息'
  },
  {
    method: 'PUT',
    path: '/update/self',
    description: '更新当前登录用户的个人信息'
  }
];