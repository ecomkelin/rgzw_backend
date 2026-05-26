// tests/setup.js
// 在所有测试之前设置模块别名
const moduleAlias = require('module-alias');
const path = require('path');

// 定义与 package.json 中 _moduleAliases 相同的别名
const aliases = {
  '@': path.resolve(__dirname, '../src'),
  '@utils': path.resolve(__dirname, '../src/utils'),
  '@models': path.resolve(__dirname, '../src/models'),
  '@routers': path.resolve(__dirname, '../src/routers'),
  '@middlewares': path.resolve(__dirname, '../src/middlewares'),
  '@modules': path.resolve(__dirname, '../src/modules'),
  '@config': path.resolve(__dirname, '../src/config')
};

for (const [alias, target] of Object.entries(aliases)) {
  moduleAlias.addAlias(alias, target);
}

// 也可以调用 register 来确保生效
moduleAlias();