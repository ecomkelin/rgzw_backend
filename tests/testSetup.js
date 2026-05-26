/**
 * 测试数据初始化
 * 创建测试所需的默认用户和数据
 */

// 注册模块别名
require('module-alias/register');

const { AccountModel } = require('../src/models/authorization/Account.model');
const { UserModel } = require('../src/models/organization/structure/User.model');
const { OrgModel } = require('../src/models/organization/structure/Org.model');
const { AccountDAO } = require('../src/models/authorization/Account.dao');
const argon2 = require('argon2');

/**
 * 创建默认组织
 */
const createDefaultOrg = async () => {
  const existingOrg = await OrgModel.findOne({ name: '测试机构' });
  if (existingOrg) {
    return existingOrg;
  }

  const org = new OrgModel({
    unionCode: 'TEST_UNION_CODE_001',
    name: '测试机构',
    nickname: '测试机构简称',
    phone: '13800138000',
    email: 'test@example.com',
    website: 'http://example.com',
    isMain: true,
    address: '测试地址',
    isActive: true
  });

  return await org.save();
};

/**
 * 创建默认用户
 */
const createDefaultUser = async () => {
  const defaultOrg = await createDefaultOrg();

  // 创建管理员账号
  const adminAccount = await createDefaultAccount(defaultOrg._id);

  // 创建普通用户账号
  const userAccount = await createRegularUserAccount(defaultOrg._id);

  return { adminAccount, userAccount, org: defaultOrg };
};

/**
 * 创建默认管理员账户
 */
const createDefaultAccount = async (orgId) => {
  // 先尝试查找已存在的账户，避免重复创建
  let account = await AccountModel.findOne({ code: 'ADMIN' });
  if (account) {
    // 如果账户存在，找到关联的用户并返回
    const existingUser = await UserModel.findOne({ Account: account._id });
    return {
      account: account,
      user: existingUser
    };
  }

  // 首先创建组织
  const org = await OrgModel.findById(orgId);
  if (!org) {
    throw new Error('Organization not found');
  }

  // 使用DAO层创建账户，这样密码会被正确处理
  const payload = { isAdmin: true }; // 管理员权限用于创建账户

  const newAccount = {
    code: 'ADMIN',
    password: 'admin123', // 传递明文密码，DAO层会将其转换为hash
    phone: '13800138001',
    nickname: '管理员',
    name: '系统管理员',
    identityNo: '110101199003077890',
    gender: 'male',
    accountType: 'User',
    isActive: true
  };

  const result = await AccountDAO.add(payload, newAccount);
  const savedAccount = result.item;

  // 创建关联的用户
  const user = new UserModel({
    Account: savedAccount._id,
    Org: org._id,
    roleTemp: 'manager',
    nickname: '系统管理员',
    isActive: true
  });

  const savedUser = await user.save();

  // 更新账户关联用户
  await AccountModel.findByIdAndUpdate(savedAccount._id, {
    currentUser: savedUser._id
  });

  // 返回完整的账户信息
  const fullAccount = await AccountModel.findById(savedAccount._id);

  return {
    account: fullAccount,
    user: savedUser
  };
};

/**
 * 创建普通用户账户
 */
const createRegularUserAccount = async (orgId) => {
  let account = await AccountModel.findOne({ code: 'USER' });
  if (account) {
    // 如果账户存在，找到关联的用户并返回
    const existingUser = await UserModel.findOne({ Account: account._id });
    return {
      account: account,
      user: existingUser
    };
  }

  // 首先创建组织
  const org = await OrgModel.findById(orgId);
  if (!org) {
    throw new Error('Organization not found');
  }

  // 使用DAO层创建账户，这样密码会被正确处理
  const payload = { isAdmin: true }; // 管理员权限用于创建账户

  const newAccount = {
    code: 'USER',
    password: 'user123', // 传递明文密码，DAO层会将其转换为hash
    phone: '13800138002',
    nickname: '普通用户',
    name: '测试用户',
    identityNo: '110101199003077891',
    gender: 'female',
    accountType: 'User',
    isActive: true
  };

  const result = await AccountDAO.add(payload, newAccount);
  const savedAccount = result.item;

  // 创建关联的用户
  const user = new UserModel({
    Account: savedAccount._id,
    Org: org._id,
    roleTemp: 'teacher',
    nickname: '测试用户',
    isActive: true
  });

  const savedUser = await user.save();

  // 更新账户关联用户
  await AccountModel.findByIdAndUpdate(savedAccount._id, {
    currentUser: savedUser._id
  });

  // 返回完整的账户信息
  const fullAccount = await AccountModel.findById(savedAccount._id);

  return {
    account: fullAccount,
    user: savedUser
  };
};

/**
 * 清理测试数据
 */
const cleanupTestData = async () => {
  try {
    await AccountModel.deleteMany({ code: { $in: ['ADMIN', 'USER'] } });
    await UserModel.deleteMany({ nickname: { $in: ['系统管理员', '测试用户'] } });
    await OrgModel.deleteMany({ name: '测试机构' });
  } catch (error) {
    console.error('清理测试数据失败:', error);
  }
};

module.exports = {
  createDefaultUser,
  createDefaultAccount,
  createRegularUserAccount,
  cleanupTestData,
  createDefaultOrg
};