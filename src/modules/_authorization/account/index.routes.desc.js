// 自定义 API 描述配置
// 文件命名规则: [原路由文件名].desc.js (如: index.routes.desc.js)
// 此文件与 src/modules/_authorization/account/index.routes.js 严格对应

module.exports = [
  {
    method: 'POST',
    path: '/list',
    description: '获取账号列表（仅管理员）'
  },
  {
    method: 'POST',
    path: '/detail/:id',
    description: '获取指定账号的详细信息（仅管理员）'
  },
  {
    method: 'POST',
    path: '/edit/:id',
    description: '更新指定账号的信息（仅管理员）'
  },
  {
    method: 'POST',
    path: '/self',
    description: '获取当前登录账号的信息'
  },
  {
    method: 'POST',
    path: '/edit/self',
    description: '更新当前登录账号的信息（昵称/密码）'
  }
];
