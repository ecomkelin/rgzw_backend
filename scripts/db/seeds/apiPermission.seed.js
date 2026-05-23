const ApiPermission = require('@models/_auth/roleApi/ApiPermission.model');
const RouteCollector = require('@utils/routeCollector');

const apiPermissionSeedData = [
  // 公司管理
  {
    apiMethod: 'POST',
    apiPath: '/company',
    description: '创建公司'
  },
  {
    apiMethod: 'GET',
    apiPath: '/company',
    description: '获取公司列表'
  },
  {
    apiMethod: 'GET',
    apiPath: '/company/:id',
    description: '获取公司详情'
  },
  {
    apiMethod: 'PUT',
    apiPath: '/company/:id',
    description: '更新公司信息'
  },
  {
    apiMethod: 'DELETE',
    apiPath: '/company/:id',
    description: '删除公司'
  },

  // 部门管理
  {
    apiMethod: 'POST',
    apiPath: '/department',
    description: '创建部门'
  },
  {
    apiMethod: 'GET',
    apiPath: '/department',
    description: '获取部门列表'
  },
  {
    apiMethod: 'GET',
    apiPath: '/department/:id',
    description: '获取部门详情'
  },
  {
    apiMethod: 'PUT',
    apiPath: '/department/:id',
    description: '更新部门信息'
  },
  {
    apiMethod: 'DELETE',
    apiPath: '/department/:id',
    description: '删除部门'
  },

  // 产品管理
  {
    apiMethod: 'POST',
    apiPath: '/product',
    description: '创建产品'
  },
  {
    apiMethod: 'GET',
    apiPath: '/product',
    description: '获取产品列表'
  },
  {
    apiMethod: 'GET',
    apiPath: '/product/:id',
    description: '获取产品详情'
  },
  {
    apiMethod: 'PUT',
    apiPath: '/product/:id',
    description: '更新产品信息'
  },
  {
    apiMethod: 'DELETE',
    apiPath: '/product/:id',
    description: '删除产品'
  }
];

async function initializeApiPermissions() {
  try {
    // 清空现有数据
    await ApiPermission.deleteMany({});

    // 从路由收集器获取所有路由  XXXXXX 获取不到
    const routes = RouteCollector.getRoutes();

    // 将路由信息转换为API权限数据
    const apiPermissions = routes.map(route => ({
      apiMethod: route.method,
      apiPath: route.routerPath,
      description: route.description
    }));
    // 批量插入数据
    await ApiPermission.insertMany(apiPermissions);
    console.info('API权限数据初始化成功');

    return apiPermissions;
  } catch (error) {
    console.error('API权限数据初始化失败:', error);
    throw error;
  }
}

module.exports = {
  initializeApiPermissions,
  apiPermissionSeedData
}; 