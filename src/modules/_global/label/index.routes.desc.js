// 高级标签API描述配置
// 为高级路由提供详细功能说明

module.exports = [
  {
    method: 'POST',
    path: '/restore/:id',
    description: '恢复已软删除的标签'
  },
  {
    method: 'DELETE',
    path: '/permanent/:id',
    description: '永久删除已标记为删除的标签'
  },
  {
    method: 'POST',
    path: '/deleted-list',
    description: '获取已软删除的标签列表'
  }
];