/**
 * 初始化 Org / Account / User / Student
 *
 * 设计: Account 只承载登录态 (code/password/phone/accountType/isAdmin/isActive),
 *       User 与 Student 各自承载身份信息 (User.nickname / Student.name 等).
 *       班主任/教务/老师 是 User, 学生 是 Student.
 *       同一个 Account 可以同时是 老板 (User) 和 某学生的家长 (该 Account 持有 N 个 Student),
 *       但本批次不演示这种 1->N 的关系, 每个学生都单独一个 Account.
 *
 * 依赖顺序: Org -> Account -> User / Student
 */
const { AccountModel, AccountDAO } = require('@models/authorization/Account.dao');
const { OrgModel }       = require('@models/organization/structure/Org.dao');
const { UserModel }      = require('@models/organization/structure/User.dao');
const { StudentModel }   = require('@models/school/student/Student.dao');

/* ============================================================
 * 1. Org
 * ============================================================ */
const ORG_ZITONG = '693e7b24b558d56179c0f7ae'; // 梓潼县人工智网科技培训学校
const ORG_MIANYANG = '693e7b24b558d56179c0f7af'; // 绵阳 (未来校区, 占位)

const orgSeeds = [
  {
    _id: ORG_ZITONG,
    name: '梓潼县人工智网科技培训学校有限公司',
    nickname: '梓潼智网学校',
    unionCode: '91510725MAEKMMYW9W',
    isMain: true,
    phone: '0816-8269999',
    address: '四川省绵阳市梓潼县文昌镇',
    isActive: true,
    sort: 100
  },
  {
    _id: ORG_MIANYANG,
    name: '绵阳市智慧教育培训中心',
    nickname: '绵阳智慧教育',
    unionCode: '91510725MAEKMMYX01',
    isMain: false,
    isActive: false, // 未来校区, 暂未启用
    sort: 90
  }
];

/* ============================================================
 * 2. Account
 *    passwordHash 是明文, AccountDAO.add 会经 pre-save hook 走 argon2 哈希
 * ============================================================ */

/* ---- 员工 User 档案 (提前到这里, 让 staffAccountSeeds.currentUser 引用) ---- */
const USER_LI    = '693e7c42963e26d1f8410001';
const USER_GAO   = '693e7c42963e26d1f8410002';
const USER_ZHANG = '693e7c42963e26d1f8410003';
const USER_YU    = '693e7c42963e26d1f8410004';
const USER_YANG  = '693e7c42963e26d1f8410005';

/* ---- 员工 Account (accountType=User) ---- */
const ACC_LI    = '693e7c42963e26d1f8400001'; // 李科霖 (老板 / 老师)
const ACC_GAO   = '693e7c42963e26d1f8400002'; // 高艺齐 (老板 / 老师)
const ACC_ZHANG = '693e7c42963e26d1f8400003'; // 张宇佳 (教务)
const ACC_YU    = '693e7c42963e26d1f8400004'; // 于邵阳 (老师)
const ACC_YANG  = '693e7c42963e26d1f8400005'; // 杨春红 (老师)

const staffAccountSeeds = [
  {
    _id: ACC_LI,
    code: 'ADMIN001',
    phone: '15800946986',
    passwordHash: 'Test1234@',
    accountType: 'User',
    currentUser: USER_LI, // 登录态默认以李校长身份进入
    name: '李科霖',
    isAdmin: true,
    isActive: true,
    sort: 100
  },
  {
    _id: ACC_GAO,
    code: 'ADMIN002',
    phone: '15281679349',
    passwordHash: 'Test1234@',
    accountType: 'User',
    currentUser: USER_GAO, // 登录态默认以高校长身份进入
    name: '高艺齐',
    isAdmin: true,
    isActive: true,
    sort: 100
  },
  {
    _id: ACC_ZHANG,
    code: 'YUJIA',
    phone: '15281679359',
    passwordHash: 'Manager1234',
    accountType: 'User',
    currentUser: USER_ZHANG,
    name: '张宇佳',
    isAdmin: false,
    isActive: true,
    sort: 90
  },
  {
    _id: ACC_YU,
    code: 'YUYANG',
    phone: '13800138002',
    passwordHash: 'Test1234',
    accountType: 'User',
    currentUser: USER_YU,
    name: '于邵阳',
    isAdmin: false,
    isActive: true,
    sort: 80
  },
  {
    _id: ACC_YANG,
    code: 'YANGHONG',
    phone: '13800138003',
    passwordHash: 'Test1234',
    accountType: 'User',
    currentUser: USER_YANG,
    name: '杨春红',
    isAdmin: false,
    isActive: true,
    sort: 80
  }
];

/* ---- 员工 User 档案 (USER_* 常量已在文件头部声明) ---- */

const userSeeds = [
  {
    _id: USER_LI,
    Account: ACC_LI,
    Org: ORG_ZITONG,
    roleTemp: 'manager', // 老板
    nickname: '李校长',
    isActive: true,
    sort: 100
  },
  {
    _id: USER_GAO,
    Account: ACC_GAO,
    Org: ORG_ZITONG,
    roleTemp: 'manager', // 老板
    nickname: '高校长',
    isActive: true,
    sort: 100
  },
  {
    _id: USER_ZHANG,
    Account: ACC_ZHANG,
    Org: ORG_ZITONG,
    roleTemp: 'manager', // 教务
    nickname: '张老师',
    isActive: true,
    sort: 90
  },
  {
    _id: USER_YU,
    Account: ACC_YU,
    Org: ORG_ZITONG,
    roleTemp: 'teacher', // 梓潼校区 Scratch 老师
    nickname: '于老师',
    isActive: true,
    sort: 80
  },
  {
    _id: USER_YANG,
    Account: ACC_YANG,
    Org: ORG_ZITONG,
    roleTemp: 'teacher', // 梓潼校区 大颗粒 老师
    nickname: '杨老师',
    isActive: true,
    sort: 80
  }
];

/* ============================================================
 * 3. Student
 *    39 个学生 (课程表里实际点名的人数, 老师说"40 个在校"含未排课学生 1 位)
 *    每个学生都单独一个 Account (代表 家长账号 / 学生自己登陆)
 * ============================================================ */

// 学生名 -> [课程, 老师, 时间, 教室] 的映射, 后续 Course.seed 复用
const STUDENT_LIST = [
  // C++ 初级 (周五 17:00-18:30, room1, 李科霖) - 1 人, 私教
  { name: '王兴宇', courseKey: 'CPP_BEGIN', teacher: USER_LI,  weekday: 5, time: '17:00-18:30', room: 'ROOM_1' },

  // Scratch 初级 (周六 10:00-11:30, room1, 于邵阳) - 4 人
  { name: '雷向宇',   courseKey: 'SCRATCH_BEGIN', teacher: USER_YU, weekday: 6, time: '10:00-11:30', room: 'ROOM_1' },
  { name: '黄艺晨',   courseKey: 'SCRATCH_BEGIN', teacher: USER_YU, weekday: 6, time: '10:00-11:30', room: 'ROOM_1' },
  { name: '曹袁毛轩', courseKey: 'SCRATCH_BEGIN', teacher: USER_YU, weekday: 6, time: '10:00-11:30', room: 'ROOM_1' },
  { name: '郭浩楠',   courseKey: 'SCRATCH_BEGIN', teacher: USER_YU, weekday: 6, time: '10:00-11:30', room: 'ROOM_1' },

  // Python 进阶 (周六 10:00-12:00, room2, 李科霖) - 2 人
  { name: '裴仕豪', courseKey: 'PYTHON_ADV', teacher: USER_LI, weekday: 6, time: '10:00-12:00', room: 'ROOM_2' },
  { name: '陈艺帆', courseKey: 'PYTHON_ADV', teacher: USER_LI, weekday: 6, time: '10:00-12:00', room: 'ROOM_2' },

  // Scratch 高级 (周六 14:00-15:30, room1, 于邵阳) - 6 人
  { name: '贾宜航', courseKey: 'SCRATCH_ADV', teacher: USER_YU, weekday: 6, time: '14:00-15:30', room: 'ROOM_1' },
  { name: '李子灵', courseKey: 'SCRATCH_ADV', teacher: USER_YU, weekday: 6, time: '14:00-15:30', room: 'ROOM_1' },
  { name: '曹加乐', courseKey: 'SCRATCH_ADV', teacher: USER_YU, weekday: 6, time: '14:00-15:30', room: 'ROOM_1' },
  { name: '赵梓睿', courseKey: 'SCRATCH_ADV', teacher: USER_YU, weekday: 6, time: '14:00-15:30', room: 'ROOM_1' },
  { name: '闫宇扬', courseKey: 'SCRATCH_ADV', teacher: USER_YU, weekday: 6, time: '14:00-15:30', room: 'ROOM_1' },
  { name: '董语轩', courseKey: 'SCRATCH_ADV', teacher: USER_YU, weekday: 6, time: '14:00-15:30', room: 'ROOM_1' },

  // Scratch 中级 (周六 16:00-17:30, room1, 于邵阳) - 5 人
  { name: '贾敬尧', courseKey: 'SCRATCH_MID', teacher: USER_YU, weekday: 6, time: '16:00-17:30', room: 'ROOM_1' },
  { name: '史彬宇', courseKey: 'SCRATCH_MID', teacher: USER_YU, weekday: 6, time: '16:00-17:30', room: 'ROOM_1' },
  { name: '陈霖',   courseKey: 'SCRATCH_MID', teacher: USER_YU, weekday: 6, time: '16:00-17:30', room: 'ROOM_1' },
  { name: '吕欣妍', courseKey: 'SCRATCH_MID', teacher: USER_YU, weekday: 6, time: '16:00-17:30', room: 'ROOM_1' },
  { name: '刘名阳', courseKey: 'SCRATCH_MID', teacher: USER_YU, weekday: 6, time: '16:00-17:30', room: 'ROOM_1' },

  // Spike 初级 (周日 9:00-10:30, room1, 高艺齐) - 6 人
  { name: '毛睿嘉', courseKey: 'SPIKE_BEGIN', teacher: USER_GAO, weekday: 0, time: '09:00-10:30', room: 'ROOM_1' },
  { name: '鲁奕辰', courseKey: 'SPIKE_BEGIN', teacher: USER_GAO, weekday: 0, time: '09:00-10:30', room: 'ROOM_1' },
  { name: '罗怡涵', courseKey: 'SPIKE_BEGIN', teacher: USER_GAO, weekday: 0, time: '09:00-10:30', room: 'ROOM_1' },
  { name: '罗恽程', courseKey: 'SPIKE_BEGIN', teacher: USER_GAO, weekday: 0, time: '09:00-10:30', room: 'ROOM_1' },
  { name: '姜穆凡', courseKey: 'SPIKE_BEGIN', teacher: USER_GAO, weekday: 0, time: '09:00-10:30', room: 'ROOM_1' },
  { name: '郭洪杨', courseKey: 'SPIKE_BEGIN', teacher: USER_GAO, weekday: 0, time: '09:00-10:30', room: 'ROOM_1' },

  // 大颗粒 高级 (周日 10:40-12:10, room1, 杨春红) - 5 人
  { name: '董佳怡', courseKey: 'DKL_ADV', teacher: USER_YANG, weekday: 0, time: '10:40-12:10', room: 'ROOM_1' },
  { name: '何奕宸', courseKey: 'DKL_ADV', teacher: USER_YANG, weekday: 0, time: '10:40-12:10', room: 'ROOM_1' },
  { name: '吴煜杭', courseKey: 'DKL_ADV', teacher: USER_YANG, weekday: 0, time: '10:40-12:10', room: 'ROOM_1' },
  { name: '李晨耀', courseKey: 'DKL_ADV', teacher: USER_YANG, weekday: 0, time: '10:40-12:10', room: 'ROOM_1' },
  { name: '崔耘溪', courseKey: 'DKL_ADV', teacher: USER_YANG, weekday: 0, time: '10:40-12:10', room: 'ROOM_1' },

  // Spike 中级 (周日 14:00-15:30, room1, 高艺齐) - 6 人
  { name: '贾云轩', courseKey: 'SPIKE_MID', teacher: USER_GAO, weekday: 0, time: '14:00-15:30', room: 'ROOM_1' },
  { name: '安籽燊', courseKey: 'SPIKE_MID', teacher: USER_GAO, weekday: 0, time: '14:00-15:30', room: 'ROOM_1' },
  { name: '曹靖承', courseKey: 'SPIKE_MID', teacher: USER_GAO, weekday: 0, time: '14:00-15:30', room: 'ROOM_1' },
  { name: '董泊成', courseKey: 'SPIKE_MID', teacher: USER_GAO, weekday: 0, time: '14:00-15:30', room: 'ROOM_1' },
  { name: '王琴剑', courseKey: 'SPIKE_MID', teacher: USER_GAO, weekday: 0, time: '14:00-15:30', room: 'ROOM_1' },
  { name: '李卓玲', courseKey: 'SPIKE_MID', teacher: USER_GAO, weekday: 0, time: '14:00-15:30', room: 'ROOM_1' },

  // 大颗粒 初级 (周日 16:00-17:30, room1, 杨春红) - 4 人
  { name: '胡维予', courseKey: 'DKL_BEGIN', teacher: USER_YANG, weekday: 0, time: '16:00-17:30', room: 'ROOM_1' },
  { name: '刁羽臣', courseKey: 'DKL_BEGIN', teacher: USER_YANG, weekday: 0, time: '16:00-17:30', room: 'ROOM_1' },
  { name: '陈锦源', courseKey: 'DKL_BEGIN', teacher: USER_YANG, weekday: 0, time: '16:00-17:30', room: 'ROOM_1' },
  { name: '徐子言', courseKey: 'DKL_BEGIN', teacher: USER_YANG, weekday: 0, time: '16:00-17:30', room: 'ROOM_1' }
];

/* 课包分布: 49% 16 节 / 23% 48 节 / 18% 32 节 / 10% 其他 (上年剩余)
 * 39 名学生统计:
 *   P_16          = 19 名  (49%)
 *   P_48          =  5 名  (含 0 特殊)
 *   P_48_PRIVATE  =  1 名  (王兴宇 C++ 私教 9600)
 *   P_48_PYTHON   =  2 名  (裴仕豪, 陈艺帆 Python 进阶 6400)
 *   P_32          =  8 名  (18%)
 *   P_OTHER       =  4 名  (10%, 上年剩余 + 16 拼起来)
 *   ----------------------------------
 *   合计          = 39 名
 */
const PACK_PLAN = [
  // C++ 初级 王兴宇 (idx 0) -> 私教, 后续会被 override
  'P_48_PRIVATE',
  // Scratch 初级 4 人 (idx 1-4)
  'P_16', 'P_16', 'P_16', 'P_48',
  // Python 进阶 2 人 (idx 5-6)
  'P_48_PYTHON', 'P_48_PYTHON',
  // Scratch 高级 6 人 (idx 7-12)
  'P_16', 'P_16', 'P_16', 'P_32', 'P_48', 'P_16',
  // Scratch 中级 5 人 (idx 13-17)
  'P_16', 'P_16', 'P_32', 'P_48', 'P_16',
  // Spike 初级 6 人 (idx 18-23)
  'P_16', 'P_16', 'P_16', 'P_16', 'P_32', 'P_48',
  // 大颗粒 高级 5 人 (idx 24-28)
  'P_16', 'P_16', 'P_16', 'P_48', 'P_16',
  // Spike 中级 6 人 (idx 29-34)
  'P_16', 'P_32', 'P_32', 'P_48', 'P_16', 'P_16',
  // 大颗粒 初级 4 人 (idx 35-38)
  'P_16', 'P_32', 'P_OTHER', 'P_OTHER'
];

// 校验: 39 名学生
if (PACK_PLAN.length !== 39) {
  throw new Error(`PACK_PLAN 长度应为 39, 实际为 ${PACK_PLAN.length}`);
}

/**
 * 学生课包方案 -> { totalLesson, priceFinal, packName, packType }
 * P_48_PRIVATE   = 王兴宇 私教 C++ 48 节 9600 元
 * P_48_PYTHON    = 裴仕豪 / 陈艺帆 python 进阶 48 节 6400 元
 * P_16 / P_32 / P_48 / P_OTHER = 按学科 + 季节区分的具体课包 (在 Pack.seed 中定义)
 */
const PACK_PLAN_DETAIL = {
  // P_48_PRIVATE: 王兴宇 私教, 不走 Pack 模板, 直接构造 free 课包
  P_48_PRIVATE: { totalLesson: 48, priceFinal: 960000, packName: 'C++ 私教定制包 48 课时', packType: '定制包', special: true },
  P_48_PYTHON:  { totalLesson: 48, priceFinal: 640000, packName: 'Python 进阶 48 课时包',    packType: '课时包', special: true }
};

/**
 * 把 STUDENT_LIST 渲染成 Account / Student 数据
 *  - 顺序与 STUDENT_LIST 严格一致 (PACK_PLAN 按 index 对应)
 *  - phone 用 1380013{0000+idx} 凑 11 位, 避免与员工 phone 冲突
 */
function buildStudentData() {
  return STUDENT_LIST.map((s, idx) => {
    const accountId = `693e7c42963e26d1f842${String(idx + 1).padStart(4, '0')}`; // 8420001..8420039
    const studentId = `693e7c42963e26d1f843${String(idx + 1).padStart(4, '0')}`; // 8430001..8430039
    const phone     = `1390013${String(idx + 1).padStart(4, '0')}`;
    const code      = `STU${String(idx + 1).padStart(3, '0')}`;
    return {
      idx,
      accountId,
      studentId,
      account: {
        _id: accountId,
        code,
        phone,
        passwordHash: 'Student1234',
        accountType: 'Student',
        currentStudent: studentId, // 登录态默认以本人学生身份进入
        name: s.name + '家长', // Account 必填 name, 用作家长昵称
        isAdmin: false,
        isActive: true
      },
      student: {
        _id: studentId,
        Account: accountId,
        Org: ORG_ZITONG,
        name: s.name,
        displayName: s.name,
        gender: 'Male',
        sourceType: '介绍',
        school: '梓潼县某小学',
        isActive: true
      },
      courseKey: s.courseKey,
      packKey: PACK_PLAN[idx]
    };
  });
}

/* ============================================================
 * 入口
 * ============================================================ */
async function initializeAccounts() {
  try {
    // ---- 清空本批次涉及的所有集合, 避免旧种子数据残留 ----
    // (Order/StudentPack/StudentCourse/Lesson 也要清, 否则旧数据会被孤立引用)
    const { OrderPackModel } = require('@models/pack/OrderPack.model');
    const { StudentPackModel } = require('@models/school/student/StudentPack.model');
    const { StudentCourseModel } = require('@models/school/student/StudentCourse.model');
    const { LessonModel } = require('@models/school/lesson/Lesson.model');
    const { SubjectModel } = require('@models/school/course/Subject.model');
    const { RoomModel } = require('@models/organization/physical/Room.model');
    const { CourseModel } = require('@models/school/course/Course.model');
    const { PackModel } = require('@models/pack/Pack.model');

    await Promise.all([
      AccountModel.deleteMany({}),
      OrgModel.deleteMany({}),
      UserModel.deleteMany({}),
      StudentModel.deleteMany({}),
      OrderPackModel.deleteMany({}),
      StudentPackModel.deleteMany({}),
      StudentCourseModel.deleteMany({}),
      LessonModel.deleteMany({}),
      SubjectModel.deleteMany({}),
      RoomModel.deleteMany({}),
      CourseModel.deleteMany({}),
      PackModel.deleteMany({})
    ]);
    console.info('已清空所有相关集合 (含旧种子数据)');

    // ---- Org ----
    const orgDocs = await OrgModel.insertMany(orgSeeds);
    console.info(`已创建组织: ${orgDocs.map(o => o.nickname).join(', ')}`);

    // ---- Account (员工) ----
    const staffPayload = { accountType: 'User', isAdmin: true, currentUser: { _id: USER_LI, Org: ORG_ZITONG, nickname: '李校长', roleTemp: 'manager' } };
    for (const rawAccountSeed of staffAccountSeeds) {
      const { item } = await AccountDAO.add(staffPayload, rawAccountSeed);
      console.info(`已创建员工账户: ${item.code}`);
    }

    // ---- User 档案 ----
    const userDocs = await UserModel.insertMany(userSeeds);
    console.info(`已创建员工 User: ${userDocs.map(u => u.nickname).join(', ')}`);

    // ---- Account (学生家长) + Student 档案 ----
    const studentData = buildStudentData();
    const studentAccounts = studentData.map(d => d.account);
    for (const acc of studentAccounts) {
      const { item } = await AccountDAO.add(staffPayload, acc);
      console.info(`已创建家长账户: ${item.code} -> ${item.name}`);
    }
    const studentDocs = await StudentModel.insertMany(studentData.map(d => d.student));
    console.info(`已创建学生 Student: ${studentDocs.length} 人`);

    console.info('Account / Org / User / Student 数据初始化完成');
  } catch (e) {
    console.error('Account.seed 失败:', e);
    throw e;
  }
}

module.exports = {
  initializeAccounts,
  ORG_ZITONG,
  ORG_MIANYANG,
  ACC_LI, ACC_GAO, ACC_ZHANG, ACC_YU, ACC_YANG,
  USER_LI, USER_GAO, USER_ZHANG, USER_YU, USER_YANG,
  STUDENT_LIST,
  PACK_PLAN,
  PACK_PLAN_DETAIL,
  buildStudentData
};
