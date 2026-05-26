const fs = require("fs");
const path = require("path");
const RouteCollector = require("@utils/routeCollector");

/**
 * 递归加载路由文件
 * @param {string} dir - 要加载的目录路径
 * @param {object} router - Express路由实例
 * @param {string} basePrefix - 基础路由前缀
 */
function loadRoutesRecursively(dir, router, basePrefix = '') {
  try {
    // 检查当前目录是否以 双下滑下 （__） 开头，如果是则跳过整个目录
    const currentDir = path.basename(dir);
    if (currentDir.startsWith('__')) {
      return;
    }

    // 读取 dir 目录下的内容
    const items = fs.readdirSync(dir, { withFileTypes: true });

    // 找出非文件夹(即文件)子内容 而且如果结尾为router.js的文件 则处理该路由文件
    items
      .filter(item => !item.isDirectory() && item.name.endsWith('.routes.js'))
      .forEach(file => {
        const routePath = path.join(dir, file.name);
        loadRouteFile(routePath, router, dir, basePrefix);
      });

    // 递归处理子目录， 如果目录名不以 __ 开头 则继续递归加载子目录下
    items
      .filter(item => item.isDirectory() && !item.name.startsWith('__'))
      .forEach(dirent => {
        // 使用 dirent.name 获取目录名，并与当前目录路径拼接
        const subDir = path.join(dir, dirent.name);
        loadRoutesRecursively(subDir, router, basePrefix);
      });
  } catch (error) {
    console.error(`❌ 加载目录失败: ${dir}`, error);
    throw error;
  }
}

/**
 * 加载单个路由文件
 */
function loadRouteFile(routePath, router, dir, basePrefix) {
  try {
    const moduleRouter = require(routePath);

    if (!moduleRouter || !moduleRouter.stack) {
      throw ({ code: 400, message: `${routePath} 不是有效的路由模块` });
    }

    // 尝试加载对应的描述配置文件 (例如: index.routes.desc.js)
    const descFilePath = routePath.replace('.routes.js', '.routes.desc.js');
    if (fs.existsSync(descFilePath)) {
      try {
        const descriptions = require(descFilePath);
        if (Array.isArray(descriptions)) {
          // 为描述数组中的每个描述项添加路由前缀
          const routePrefix = getRoutePath(dir);
          const descriptionsWithPrefix = descriptions.map(desc => ({
            ...desc,
            prefix: desc.prefix || routePrefix
          }));
          RouteCollector.setDescriptionBatch(descriptionsWithPrefix);
        } else if (descriptions && typeof descriptions === 'object') {
          // 如果导出的是对象形式，则转换为数组
          const routePrefix = getRoutePath(dir);
          const descArray = Object.entries(descriptions).map(([key, descConfig]) => {
            const [method, path] = key.split(' ');
            return {
              method,
              path,
              prefix: getRoutePath(dir),
              description: descConfig.description || descConfig
            };
          });
          RouteCollector.setDescriptionBatch(descArray);
        }
      } catch (descError) {
        console.warn(`⚠️ 加载描述文件失败: ${descFilePath}`, descError);
      }
    }

    // 获取不包含下划线文件夹的路由前缀
    const routePrefix = getRoutePath(dir);
    const finalPrefix = routePrefix ? basePrefix + '/' + routePrefix : basePrefix;
    // 收集路由信息
    moduleRouter.stack.forEach(layer => {
      if (layer.route) {
        const route = layer.route;
        const routePath = route.path;
        Object.keys(route.methods).forEach(method => {
          if (route.methods[method]) {
            RouteCollector.addRoute(method, routePath, finalPrefix);
          }
        });
      }
    });

    // 注册路由
    router.use(finalPrefix, moduleRouter);
    console.info(`✅ 已加载路由: -> ${finalPrefix}  文件: ${getRelativePathFromSrc(routePath)}`);
  } catch (error) {
    console.error(`❌ 加载路由文件失败: ${getRelativePathFromSrc(routePath)}`, error);
    throw error;
  }
}

/**
 * 处理路由路径，跳过带下划线的文件夹
 */
function getRoutePath(dir) {
  const modulesDir = path.join(process.cwd(), 'src/modules');
  const relativePath = path.relative(modulesDir, dir);

  // 将路径分割成段，过滤掉带下划线的文件夹名
  const pathSegments = relativePath.split(path.sep)
    .filter(segment => !segment.includes('_'));

  return pathSegments.join('/');
}

/**
 * 获取从src开始的相对路径
 */
function getRelativePathFromSrc(fullPath) {
  const srcIndex = fullPath.indexOf('src');
  return srcIndex !== -1 ? fullPath.slice(srcIndex) : fullPath;
}

module.exports = loadRoutesRecursively; 