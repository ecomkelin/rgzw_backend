class RouteCollector {
  static routes = new Map();
  static manualDescriptions = new Map(); // 存储手动设置的描述

  // 标准化路径，处理尾部斜杠的问题
  static normalizePath(path) {
    return path.endsWith('/') ? path : path + '/';
  }

  // 手动设置单个路由描述
  static setDescription(method, path, prefix = '', description) {
    const fullPath = prefix
      ? `/${prefix}${path}`.replace(/\/+/g, '/')
      : path;

    const normalizedPath = path.includes(':') ? fullPath : this.normalizePath(fullPath);
    const code = `${method.toUpperCase()}:${normalizedPath}`;

    this.manualDescriptions.set(code, description);
  }

  // 批量设置路由描述
  static setDescriptionBatch(descriptions) {
    descriptions.forEach(({ method, path, prefix, description }) => {
      this.setDescription(method, path, prefix, description);
    });
  }

  // 修改 addRoute 方法，接收路由前缀
  static addRoute(method, path, prefix = '', description = '') {
    // 组合完整路径
    const fullPath = prefix
      ? `/${prefix}${path}`.replace(/\/+/g, '/')
      : path;

    const normalizedPath = path.includes(':') ? fullPath : this.normalizePath(fullPath);
    const code = `${method.toUpperCase()}:${normalizedPath}`;

    // 使用手动设置的描述或生成默认描述
    const finalDescription = this.manualDescriptions.get(code) || description || this.generateDescription(method, path);

    this.routes.set(code, {
      code,
      description: finalDescription,
      routerPath: normalizedPath,
      method: method.toUpperCase()
    });
  }

  static getRoutes() {
    return Array.from(this.routes.values());
  }

  // 根据路由信息生成默认描述
  static generateDescription(method, path) {
    const actionMap = {
      'GET': path.includes('/:') ? '获取' : '查询',
      'POST': '创建',
      'PUT': '更新',
      'DELETE': '删除',
      'PATCH': '修改'
    };

    // 获取资源名称
    const resource = path.split('/')[1];
    const action = actionMap[method.toUpperCase()] || '操作';

    if (path.includes('/:')) {
      return `${action}指定${resource}`;
    }
    return `${action}${resource}`;
  }
}

module.exports = RouteCollector; 
