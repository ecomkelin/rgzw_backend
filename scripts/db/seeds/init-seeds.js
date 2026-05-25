const { initializeAccounts } = require('./Account.seed');

// 定义模块初始化顺序（依赖关系）
const INIT_ORDER = [
  'Accounts'        // 账户数据
];

const INIT_FUNCTIONS = {
  Accounts: initializeAccounts,
};



// 初始化函数，按照顺序执行
async function initializeAll(modules = INIT_ORDER) {
  for (const module of modules) {
    if (INIT_FUNCTIONS[module]) {
      console.info(`初始化${module}数据...`);
      await INIT_FUNCTIONS[module]();
      console.info(`${module}数据初始化完成`);
    } else {
      console.warn(`未找到模块 ${module} 的初始化函数`);
    }
  }
}
// 为了单独初始化某个数据
const initializeSpecific = async (moduleNames) => {
  if (!Array.isArray(moduleNames)) {
    moduleNames = [moduleNames];
  }
  return initializeAll(moduleNames);
}
module.exports = {
  initializeAll,
  initializeSpecific
}; 