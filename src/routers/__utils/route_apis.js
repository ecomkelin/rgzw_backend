const express = require("express");
const router = express.Router();
const RouteCollector = require("@utils/routeCollector");
const cache = require("@utils/cache");

/**
 * 应用分页到数组
 */
function applyPagination(array, page, limit) {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  return {
    items: array.slice(startIndex, endIndex),
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(array.length / limit),
      totalItems: array.length,
      hasNext: endIndex < array.length,
      hasPrev: startIndex > 0,
      pageSize: limit
    }
  };
}

/**
 * 对API进行排序
 */
function sortRoutes(routes, sortBy, order) {
  if (!sortBy) return routes;

  const validSortFields = ['path', 'method', 'description', 'code'];
  if (!validSortFields.includes(sortBy)) {
    sortBy = 'path'; // 默认按路径排序
  }

  const multiplier = order === 'desc' ? -1 : 1;

  return [...routes].sort((a, b) => {
    let valA = a[sortBy.toLowerCase()];
    let valB = b[sortBy.toLowerCase()];

    // 确保比较值为字符串
    if (typeof valA !== 'string') valA = String(valA);
    if (typeof valB !== 'string') valB = String(valB);

    valA = valA.toLowerCase();
    valB = valB.toLowerCase();

    if (valA < valB) return -1 * multiplier;
    if (valA > valB) return 1 * multiplier;
    return 0;
  });
}

/**
 * 获取过滤后的API列表
 */
function getFilteredRoutes(routes, { module, method, keyword, path }) {
  let filteredRoutes = routes;

  if (module) {
    filteredRoutes = filteredRoutes.filter((route) =>
      route.routerPath.startsWith(`/${module}`)
    );
  }

  if (method) {
    filteredRoutes = filteredRoutes.filter((route) =>
      route.method.toLowerCase() === method.toLowerCase()
    );
  }

  if (path) {
    const searchPath = path.toLowerCase();
    filteredRoutes = filteredRoutes.filter((route) =>
      route.routerPath.toLowerCase().includes(searchPath)
    );
  }

  if (keyword) {
    const searchKeyword = keyword.toLowerCase();
    filteredRoutes = filteredRoutes.filter((route) =>
      route.routerPath.toLowerCase().includes(searchKeyword) ||
      route.description.toLowerCase().includes(searchKeyword)
    );
  }

  return filteredRoutes;
}

// API路由处理器
const apiRoutes = {
  // 获取API列表（已优化）
  getApis: (req, res) => {
    try {
      const { module, method, keyword, path, page = 1, limit = 20, sortBy = 'path', order = 'asc' } = req.query;

      // 验证分页参数
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20)); // 限制最大每页数量为100

      // 生成缓存键，包含查询参数和分页参数
      const cacheKey = `routes_list_${module || 'all'}_${method || 'all'}_${keyword || 'all'}_${path || 'all'}_page${pageNum}_limit${limitNum}_sort${sortBy}_${order}`;
      const cachedResult = cache.get(cacheKey);

      if (cachedResult) {
        return res.json(cachedResult);
      }

      const routes = RouteCollector.getRoutes();
      const filteredRoutes = getFilteredRoutes(routes, { module, method, keyword, path });
      const sortedRoutes = sortRoutes(filteredRoutes, sortBy, order);
      const paginatedResult = applyPagination(sortedRoutes, pageNum, limitNum);

      const result = {
        code: 200,
        success: true,
        data: paginatedResult,
        query: {
          module,
          method,
          keyword,
          path,
          page: pageNum,
          limit: limitNum,
          sortBy,
          order
        },
      };

      // 将结果存储到缓存，设置较短的过期时间（2分钟）因为API可能经常变化
      cache.set(cacheKey, result, 2 * 60 * 1000);

      res.json(result);
    } catch (error) {
      console.error('Error in getApis:', error);
      res.status(500).json({
        code: 500,
        success: false,
        message: '获取API列表时发生错误',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // 注意：已移除 getStructuredApis 功能，现在专注于优化列表功能
};

module.exports = apiRoutes;