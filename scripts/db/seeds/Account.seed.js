const { AccountModel, AccountDAO } = require('@models/authorization/Account.dao');
const { OrgModel } = require('@models/organization/structure/Org.dao');
const { UserModel } = require('@models/organization/structure/User.dao');
const { StudentModel } = require('@models/school/student/Student.dao');

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
    phone: '15800946986',  // 添加唯一电话号码
    passwordHash: 'Test1234@',  // 直接使用明文密码，让模型处理哈希
    accountType: 'User',  // 指定账户类型
    currentUser: "693e7c42963e26d1f80344ac",  // 指向梓潼学校的用户
    name: '李科霖',
    identityNo: '370829198710230000',
    birthday: new Date('1987-10-23'),
    isAdmin: true,
    isActive: true,
    sort: 100
  }, {
    _id: "693e7c42963e26d1f80344ba",
    code: 'ADMIN002',
    phone: '15281679349',  // 添加唯一电话号码
    passwordHash: 'Test1234@',  // 直接使用明文密码，让模型处理哈希
    accountType: 'User',  // 指定账户类型
    currentUser: "693e7c42963e26d1f80344bc",  // 指向梓潼学校的用户
    name: '高艺齐',
    identityNo: '580829199202250000',
    birthday: new Date('1992-02-25'),
    isAdmin: true,
    isActive: true,
    sort: 100
  }, {
    _id: "693e7c42963e26d1f80344b2",
    code: 'YuJia',
    phone: '15281679359',  // 添加唯一电话号码
    passwordHash: 'Manager1234',  // 直接使用明文密码，让模型处理哈希
    accountType: 'User',  // 指定账户类型
    currentUser: "693e7c42963e26d1f80344d3",  // 指向梓潼学校的用户
    name: '张宇佳',
    identityNo: '580829200404210000',
    birthday: new Date('2004-04-21'),
    isAdmin: true,
    isActive: true,
    sort: 100
  }, {
    _id: "693e7c42963e26d1f80344a2",
    code: 'yangHong',
    phone: '13800138003',  // 添加唯一电话号码
    passwordHash: 'Test1234',  // 直接使用明文密码，让模型处理哈希
    accountType: 'User',  // 指定账户类型
    currentUser: "693e7c42963e26d1f80345bc",
    name: '杨小红',
    identityNo: "580829199505150001",
    birthday: new Date('1995-05-15'),
    isAdmin: false,
    isActive: true,
  }, {
    _id: "693e7c42963e26d1f80344d2",
    code: 'yuYang',
    phone: '13800138002',  // 添加唯一电话号码
    passwordHash: 'Test1234',  // 直接使用明文密码，让模型处理哈希
    accountType: 'User',  // 指定账户类型
    currentUser: "693e7c42963e26d1f80344b8",
    name: '于邵阳',
    identityNo: "580829199505150002",
    birthday: new Date('1995-05-15'),
    isAdmin: false,
    isActive: true,
  }, {
    _id: "693e7c42963e26d1f80356d2",
    code: 'peiShiHao',
    phone: '13800138112',  // 添加唯一电话号码
    passwordHash: 'Student1234',  // 直接使用明文密码，让模型处理哈希
    accountType: 'Student',  // 指定账户类型
    currentUser: "693e7c42963e26d1f8034418",
    name: '裴仕豪',
    identityNo: "580829201805150001",
    birthday: new Date('2018-05-15'),
    isAdmin: false,
    isActive: true,
  }, {
    _id: "693e7c42963e26d1f80346d2",
    code: 'wangXingYu',
    phone: '13800138012',  // 添加唯一电话号码
    passwordHash: 'Student1234',  // 直接使用明文密码，让模型处理哈希
    accountType: 'Student',  // 指定账户类型
    currentUser: "693e7c42963e26d1f8034428",
    name: '王兴宇',
    identityNo: "580829201805150002",
    birthday: new Date('2018-05-15'),
    isAdmin: false,
    isActive: true,
  }
];

const userSeeds = [
  // ADMIN001 在梓潼学校的用户信息
  {
    Account: '693e7c42963e26d1f80344aa',
    _id: "693e7c42963e26d1f80344ac",
    roleTemp: 'manager',
    nickname: '李校长',
    Org: '693e7b24b558d56179c0f7ae',  // 梓潼学校
  },
  // ADMIN001 在绵阳智慧教育的用户信息
  {
    Account: '693e7c42963e26d1f80344aa',
    _id: "693e7c42963e26d1f80344c0",  // 新的用户ID
    roleTemp: 'manager',
    nickname: '李老师',
    Org: '693e7b24b558d56179c0f7af',  // 绵阳智慧教育
  },
  // ADMIN002 在梓潼学校的用户信息
  {
    Account: '693e7c42963e26d1f80344ba',
    _id: "693e7c42963e26d1f80344bc",
    roleTemp: 'manager',
    nickname: '高校长',
    Org: '693e7b24b558d56179c0f7ae',  // 梓潼学校
  },
  // ADMIN002 在绵阳智慧教育的用户信息
  {
    Account: '693e7c42963e26d1f80344ba',
    _id: "693e7c42963e26d1f80344d0",  // 新的用户ID
    roleTemp: 'manager',
    nickname: '高老师',
    Org: '693e7b24b558d56179c0f7af',  // 绵阳智慧教育
  },
  {
    Account: '693e7c42963e26d1f80344b2',
    _id: "693e7c42963e26d1f80344d3",  // 新的用户ID
    roleTemp: 'manager',
    nickname: '张老师',
    Org: '693e7b24b558d56179c0f7ae',  // 绵阳智慧教育
  },
  // yangHong 在梓潼学校的用户信息
  {
    Account: '693e7c42963e26d1f80344a2',
    _id: "693e7c42963e26d1f80345bc",
    roleTemp: 'teacher',
    nickname: '杨老师',
    Org: '693e7b24b558d56179c0f7ae',  // 梓潼学校
  },
  // TCH001 的用户信息
  {
    Account: '693e7c42963e26d1f80344d2',
    _id: "693e7c42963e26d1f80344b8",
    roleTemp: 'teacher',
    nickname: '老师',
    Org: '693e7b24b558d56179c0f7ae',  // 梓潼学校
  }
];

//学生信息
const studentSeeds = [
  {
    Account: '693e7c42963e26d1f80356d2',
    _id: "693e7c42963e26d1f8034418",
    name: '裴仕豪',
    identityNo: "580829201805150001",
    birthday: new Date('2018-05-15'),
    Org: '693e7b24b558d56179c0f7ae',  // 梓潼学校
  }, {
    Account: '693e7c42963e26d1f80346d2',
    _id: "693e7c42963e26d1f8034428",
    name: '王兴宇',
    identityNo: "580829201805150002",
    birthday: new Date('2018-05-15'),
    Org: '693e7b24b558d56179c0f7ae',  // 梓潼学校
  }
]


async function initializeAccounts() {
  try {
    // 清空现有数据
    await AccountModel.deleteMany({});
    await OrgModel.deleteMany({});
    await UserModel.deleteMany({});
    await StudentModel.deleteMany({});

    // 创建组织
    const orgDocs = await OrgModel.insertMany(orgSeeds);
    console.info(`已创建组织: ${orgDocs.map(o => o.name).join(', ')}`);

    // 创建账户
    const seedPayload = {
      accountType: "User",
      isAdmin: true
    }
    for (const rawAccountSeed of rawAccountSeeds) {
      const { item } = await AccountDAO.add(seedPayload, rawAccountSeed);
      console.info(`已创建账户: ${item.code}`);
    }

    // 创建用户
    const userDocs = await UserModel.insertMany(userSeeds);
    console.info(`已创建用户档案: ${userDocs.map(u => u.nickname).join(', ')} `);

    // 创建学生
    const studentDocs = await StudentModel.insertMany(studentSeeds);
    console.info(`已创建用户档案: ${studentDocs.map(u => u.nickname).join(', ')} `);

    // 批量插入数据
    console.info('用户数据初始化成功');
  } catch (e) {
    console.error('用户数据初始化失败:', e);
    throw e;
  }
}

// 将原始未加密的数据导出，以便测试使用
module.exports = {
  initializeAccounts,
  rawAccountSeeds  // 导出原始未加密的种子数据供测试使用
};