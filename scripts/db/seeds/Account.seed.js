const argon2 = require('argon2');
const AccountModel = require('@models/authorization/Account.model');
const OrgModel = require('@models/organization/structure/Org.model');
const UserModel = require('@models/organization/structure/User.model');

const orgSeeds = [
  {
    _id: "693e7b24b558d56179c0f7ae",
    name: '梓潼县人工智网科技培训学校有限公司',
    isMain: true,  // 设置为主机构
    nickname: '梓潼智网学校',
    unionCode: '91510725MAEKMMYW9W',
  },
  {
    _id: "693e7b24b558d56179c0f7af",  // 第二个组织ID
    name: '绵阳市智慧教育培训中心',
    isMain: false,  // 不设置为主机构
    nickname: '绵阳智慧教育',
    unionCode: '91510725MAEKMMYX01',
  }
];

// 使用明文密码，让Account模型的pre-save钩子处理哈希
const rawAccountSeeds = [
  {
    _id: "693e7c42963e26d1f80344aa",
    code: 'ADMIN001',
    phone: '13800138001',  // 添加唯一电话号码
    passwordHash: 'Test1234@',  // 直接使用明文密码，让模型处理哈希
    accountType: 'User',  // 指定账户类型
    currentUser: "693e7c42963e26d1f80344ac",  // 指向梓潼学校的用户
    name: '系统管理员',
    identityNo: '370829198001010000',
    birthday: new Date('1980-01-01'),
    isAdmin: true,
    isActive: true,
    sort: 100
  }, {
    _id: "693e7c42963e26d1f80344b2",
    code: 'TCH001',
    phone: '13800138003',  // 添加唯一电话号码
    passwordHash: 'Test1234@',  // 直接使用明文密码，让模型处理哈希
    accountType: 'User',  // 指定账户类型
    currentUser: "693e7c42963e26d1f80344b8",
    name: '老师',
    identityNo: "370829198505150001",
    birthday: new Date('1985-05-15'),
    isAdmin: false,
    isActive: true,
  }
];

const userSeeds = [
  // ADMIN001 在梓潼学校的用户信息
  {
    Account: '693e7c42963e26d1f80344aa',
    _id: "693e7c42963e26d1f80344ac",
    roleSimp: 'manager',
    nickname: '系统管理员',
    Org: '693e7b24b558d56179c0f7ae',  // 梓潼学校
  },
  // ADMIN001 在绵阳智慧教育的用户信息
  {
    Account: '693e7c42963e26d1f80344aa',
    _id: "693e7c42963e26d1f80344c0",  // 新的用户ID
    roleSimp: 'manager',
    nickname: '绵阳校区管理员',
    Org: '693e7b24b558d56179c0f7af',  // 绵阳智慧教育
  },
  // TCH001 的用户信息
  {
    Account: '693e7c42963e26d1f80344b2',
    _id: "693e7c42963e26d1f80344b8",
    roleSimp: 'teacher',
    nickname: '老师',
    Org: '693e7b24b558d56179c0f7ae',  // 梓潼学校
  }
];


async function initializeAccounts() {
  try {
    // 清空现有数据
    await AccountModel.deleteMany({});
    await OrgModel.deleteMany({});
    await UserModel.deleteMany({});

    // 创建组织
    const orgDocs = await OrgModel.insertMany(orgSeeds);
    console.info(`已创建组织: ${orgDocs.map(o => o.name).join(', ')}`);

    // 创建账户
    const accountDocs = await AccountModel.insertMany(rawAccountSeeds);
    console.info(`已创建账户: ${accountDocs.map(a => a.code).join(', ')}`);

    // 创建用户
    const userDocs = await UserModel.insertMany(userSeeds);
    console.info(`已创建用户档案: ${userDocs.map(u => u.nickname).join(', ')}`);

    // 批量插入数据
    console.info('用户数据初始化成功');
  } catch (error) {
    console.error('用户数据初始化失败:', error);
    throw error;
  }
}

// 将原始未加密的数据导出，以便测试使用
module.exports = {
  initializeAccounts,
  rawAccountSeeds  // 导出原始未加密的种子数据供测试使用
};