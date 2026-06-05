// 自定义 API 描述配置
// 文件命名规则: [原路由文件名].desc.js (如: index.routes.desc.js)
// 此文件与 src/modules/_organization/user/index.routes.js 严格对应

module.exports = [
  {
    method: 'POST',
    path: '/list',
    description: '获取用户列表，支持分页、筛选、关联填充（仅 admin / manager）'
  },
  {
    method: 'POST',
    path: '/detail/:id',
    description: '根据 ID 获取单个员工的详细信息（仅 admin / manager）'
  },
  {
    method: 'POST',
    path: '/add',
    description: '创建新员工（同时创建/关联 Account，仅 admin / manager）'
  },
  {
    method: 'POST',
    path: '/edit/:id',
    description: '更新员工信息（仅 admin / manager）'
  },
  {
    method: 'POST',
    path: '/self',
    description: '当前登录用户自助编辑（修改 nickname / avatar，服务端自动锁定 currentUser._id）'
  }
];
