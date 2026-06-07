/**
 * 课包 (Pack) 模板种子
 *
 * 价格表 (用户口述):
 *   - 大颗粒   16 节 1500  / 48 节 4200
 *   - Spike / Scratch
 *              16 节 寒暑假 1600 / 春秋季 2100 (部分实付 1900)
 *              48 节 4800
 *   - Python   48 节 6400 (本批次裴仕豪 / 陈艺帆 即此)
 *   - C++ 私教 48 节 9600 (王兴宇 单独走 定制包, 仍建模板占位)
 *
 * 32 节价格按 16/48 线性插值给出, 业务上其实不常用
 *
 * P_OTHER 是不走 Pack 的 free StudentPack, 这里只占位
 */
const { PackModel } = require('@models/pack/Pack.model');
const { ORG_ZITONG, USER_LI } = require('./Account.seed');
const { SUBJECT_IDS } = require('./Subject.seed');

const PACK_PREFIX = '693e7c42963e26d1f847'; // 20 chars, 4-char suffix => 24 chars

/**
 * Pack key (与 Account.seed.PACK_PLAN 对应) -> Pack _id 映射
 * 4 位 hex 序号, 0001..0018 共 18 个
 */
const PACK_IDS = {
  // Scratch 春秋 16
  SCRATCH_16_CHUNQIU: `${PACK_PREFIX}0001`,
  // Scratch 寒暑 16
  SCRATCH_16_HANSHU: `${PACK_PREFIX}0002`,
  // Scratch 32
  SCRATCH_32:        `${PACK_PREFIX}0003`,
  // Scratch 48
  SCRATCH_48:        `${PACK_PREFIX}0004`,
  // Spike 春秋 16
  SPIKE_16_CHUNQIU:  `${PACK_PREFIX}0005`,
  // Spike 寒暑 16
  SPIKE_16_HANSHU:   `${PACK_PREFIX}0006`,
  // Spike 32
  SPIKE_32:          `${PACK_PREFIX}0007`,
  // Spike 48
  SPIKE_48:          `${PACK_PREFIX}0008`,
  // 大颗粒 16
  DKL_16:            `${PACK_PREFIX}0009`,
  // 大颗粒 32
  DKL_32:            `${PACK_PREFIX}000a`,
  // 大颗粒 48
  DKL_48:            `${PACK_PREFIX}000b`,
  // Python 16
  PYTHON_16:         `${PACK_PREFIX}000c`,
  // Python 32
  PYTHON_32:         `${PACK_PREFIX}000d`,
  // Python 48
  PYTHON_48:         `${PACK_PREFIX}000e`,
  // C++ 16
  CPP_16:            `${PACK_PREFIX}000f`,
  // C++ 32
  CPP_32:            `${PACK_PREFIX}0010`,
  // C++ 私教 48
  CPP_PRIVATE_48:    `${PACK_PREFIX}0011`
};

/**
 * 把 PACK_PLAN 的 key 映射到具体的 Pack._id
 * P_16 / P_32 / P_48 根据学生所在课程 subject 决定用哪个 Pack
 * P_48_PRIVATE / P_48_PYTHON 是特殊包, 直接对应
 * P_OTHER 不在本表, 在 StudentPack 处用 free 课包
 */
const packSeeds = [
  // ===== Scratch =====
  { _id: PACK_IDS.SCRATCH_16_CHUNQIU, name: 'Scratch 16 课时 春秋季包', type: '课时包',
    totalLesson: 16, validDays: 180,
    priceOrigin: 210000, priceRegular: 210000, priceSale: 190000,
    applicableSubjects: 'Scratch', applicableLevels: '初级 / 中级 / 高级',
    description: 'Scratch 春秋季 16 课时, 实际成交价 1900 元',
    isActive: true, sort: 100, Org: ORG_ZITONG, createdBy: USER_LI },
  { _id: PACK_IDS.SCRATCH_16_HANSHU, name: 'Scratch 16 课时 寒暑假包', type: '课时包',
    totalLesson: 16, validDays: 60,
    priceOrigin: 160000, priceRegular: 160000,
    applicableSubjects: 'Scratch', applicableLevels: '初级 / 中级 / 高级',
    description: 'Scratch 寒暑假 16 课时 1600 元',
    isActive: true, sort: 99, Org: ORG_ZITONG, createdBy: USER_LI },
  { _id: PACK_IDS.SCRATCH_32, name: 'Scratch 32 课时包', type: '课时包',
    totalLesson: 32, validDays: 365,
    priceOrigin: 320000, priceRegular: 320000,
    applicableSubjects: 'Scratch', applicableLevels: '初级 / 中级 / 高级',
    description: 'Scratch 32 课时 3200 元 (春秋两期连报)',
    isActive: true, sort: 95, Org: ORG_ZITONG, createdBy: USER_LI },
  { _id: PACK_IDS.SCRATCH_48, name: 'Scratch 48 课时包', type: '课时包',
    totalLesson: 48, validDays: 365,
    priceOrigin: 480000, priceRegular: 480000,
    applicableSubjects: 'Scratch', applicableLevels: '初级 / 中级 / 高级',
    description: 'Scratch 48 课时 4800 元 (三期连报)',
    isActive: true, sort: 90, Org: ORG_ZITONG, createdBy: USER_LI },

  // ===== Spike =====
  { _id: PACK_IDS.SPIKE_16_CHUNQIU, name: 'Spike 16 课时 春秋季包', type: '课时包',
    totalLesson: 16, validDays: 180,
    priceOrigin: 210000, priceRegular: 210000, priceSale: 190000,
    applicableSubjects: 'Spike', applicableLevels: '初级 / 中级 / 高级',
    description: 'Spike 春秋季 16 课时 2100 元 (实付 1900)',
    isActive: true, sort: 89, Org: ORG_ZITONG, createdBy: USER_LI },
  { _id: PACK_IDS.SPIKE_16_HANSHU, name: 'Spike 16 课时 寒暑假包', type: '课时包',
    totalLesson: 16, validDays: 60,
    priceOrigin: 160000, priceRegular: 160000,
    applicableSubjects: 'Spike', applicableLevels: '初级 / 中级 / 高级',
    description: 'Spike 寒暑假 16 课时 1600 元',
    isActive: true, sort: 88, Org: ORG_ZITONG, createdBy: USER_LI },
  { _id: PACK_IDS.SPIKE_32, name: 'Spike 32 课时包', type: '课时包',
    totalLesson: 32, validDays: 365,
    priceOrigin: 320000, priceRegular: 320000,
    applicableSubjects: 'Spike', applicableLevels: '初级 / 中级 / 高级',
    description: 'Spike 32 课时 3200 元',
    isActive: true, sort: 87, Org: ORG_ZITONG, createdBy: USER_LI },
  { _id: PACK_IDS.SPIKE_48, name: 'Spike 48 课时包', type: '课时包',
    totalLesson: 48, validDays: 365,
    priceOrigin: 480000, priceRegular: 480000,
    applicableSubjects: 'Spike', applicableLevels: '初级 / 中级 / 高级',
    description: 'Spike 48 课时 4800 元',
    isActive: true, sort: 86, Org: ORG_ZITONG, createdBy: USER_LI },

  // ===== 大颗粒 =====
  { _id: PACK_IDS.DKL_16, name: '大颗粒 16 课时包', type: '课时包',
    totalLesson: 16, validDays: 180,
    priceOrigin: 150000, priceRegular: 150000,
    applicableSubjects: '电子智慧大颗粒', applicableLevels: '初级 / 高级',
    description: '大颗粒 16 课时 1500 元',
    isActive: true, sort: 85, Org: ORG_ZITONG, createdBy: USER_LI },
  { _id: PACK_IDS.DKL_32, name: '大颗粒 32 课时包', type: '课时包',
    totalLesson: 32, validDays: 365,
    priceOrigin: 280000, priceRegular: 280000,
    applicableSubjects: '电子智慧大颗粒', applicableLevels: '初级 / 高级',
    description: '大颗粒 32 课时 2800 元 (插值)',
    isActive: true, sort: 84, Org: ORG_ZITONG, createdBy: USER_LI },
  { _id: PACK_IDS.DKL_48, name: '大颗粒 48 课时包', type: '课时包',
    totalLesson: 48, validDays: 365,
    priceOrigin: 420000, priceRegular: 420000,
    applicableSubjects: '电子智慧大颗粒', applicableLevels: '初级 / 高级',
    description: '大颗粒 48 课时 4200 元',
    isActive: true, sort: 83, Org: ORG_ZITONG, createdBy: USER_LI },

  // ===== Python =====
  { _id: PACK_IDS.PYTHON_16, name: 'Python 16 课时 春秋季包', type: '课时包',
    totalLesson: 16, validDays: 180,
    priceOrigin: 220000, priceRegular: 220000,
    applicableSubjects: 'Python', applicableLevels: '初级 / 中级 / 高级 / 进阶',
    description: 'Python 春秋季 16 课时 2200 元',
    isActive: true, sort: 80, Org: ORG_ZITONG, createdBy: USER_LI },
  { _id: PACK_IDS.PYTHON_32, name: 'Python 32 课时包', type: '课时包',
    totalLesson: 32, validDays: 365,
    priceOrigin: 430000, priceRegular: 430000,
    applicableSubjects: 'Python', applicableLevels: '初级 / 中级 / 高级 / 进阶',
    description: 'Python 32 课时 4300 元',
    isActive: true, sort: 79, Org: ORG_ZITONG, createdBy: USER_LI },
  { _id: PACK_IDS.PYTHON_48, name: 'Python 48 课时包', type: '课时包',
    totalLesson: 48, validDays: 365,
    priceOrigin: 640000, priceRegular: 640000,
    applicableSubjects: 'Python', applicableLevels: '初级 / 中级 / 高级 / 进阶',
    description: 'Python 48 课时 6400 元 (进阶常报)',
    isActive: true, sort: 78, Org: ORG_ZITONG, createdBy: USER_LI },

  // ===== C++ =====
  { _id: PACK_IDS.CPP_16, name: 'C++ 16 课时 春秋季包', type: '课时包',
    totalLesson: 16, validDays: 180,
    priceOrigin: 320000, priceRegular: 320000,
    applicableSubjects: 'C++', applicableLevels: '初级 / 中级 / 高级',
    description: 'C++ 16 课时 3200 元',
    isActive: true, sort: 70, Org: ORG_ZITONG, createdBy: USER_LI },
  { _id: PACK_IDS.CPP_32, name: 'C++ 32 课时包', type: '课时包',
    totalLesson: 32, validDays: 365,
    priceOrigin: 640000, priceRegular: 640000,
    applicableSubjects: 'C++', applicableLevels: '初级 / 中级 / 高级',
    description: 'C++ 32 课时 6400 元',
    isActive: true, sort: 69, Org: ORG_ZITONG, createdBy: USER_LI },
  { _id: PACK_IDS.CPP_PRIVATE_48, name: 'C++ 私教 48 课时定制包', type: '定制包',
    totalLesson: 48, validDays: 365,
    priceOrigin: 960000, priceRegular: 960000,
    applicableSubjects: 'C++', applicableLevels: '初级 / 中级 / 高级',
    description: 'C++ 1 对 1 私教 48 课时 9600 元 (王兴宇使用)',
    isActive: true, sort: 60, Org: ORG_ZITONG, createdBy: USER_LI }
];

/**
 * 给定 courseKey + packKey -> 具体的 Pack._id
 * P_48_PRIVATE -> CPP_PRIVATE_48
 * P_48_PYTHON  -> PYTHON_48
 * P_16         -> 按 subject 选 16 节 pack
 * P_32         -> 按 subject 选 32 节 pack
 * P_48         -> 按 subject 选 48 节 pack
 * P_OTHER      -> null (走 free StudentPack)
 */
function resolvePackId(courseKey, packKey) {
  if (packKey === 'P_48_PRIVATE') return PACK_IDS.CPP_PRIVATE_48;
  if (packKey === 'P_48_PYTHON')  return PACK_IDS.PYTHON_48;
  if (packKey === 'P_OTHER')      return null;

  const sub = (courseKey || '').split('_')[0]; // DKL / SPIKE / SCRATCH / PYTHON / CPP
  const size = packKey.split('_')[1]; // 16 / 32 / 48

  const map = {
    DKL:     { 16: PACK_IDS.DKL_16,     32: PACK_IDS.DKL_32,     48: PACK_IDS.DKL_48 },
    SPIKE:   { 16: PACK_IDS.SPIKE_16_CHUNQIU, 32: PACK_IDS.SPIKE_32, 48: PACK_IDS.SPIKE_48 },
    SCRATCH: { 16: PACK_IDS.SCRATCH_16_CHUNQIU, 32: PACK_IDS.SCRATCH_32, 48: PACK_IDS.SCRATCH_48 },
    PYTHON:  { 16: PACK_IDS.PYTHON_16,  32: PACK_IDS.PYTHON_32,  48: PACK_IDS.PYTHON_48 },
    CPP:     { 16: PACK_IDS.CPP_16,     32: PACK_IDS.CPP_32,     48: PACK_IDS.CPP_PRIVATE_48 }
  };
  if (!map[sub] || !map[sub][size]) return null;
  return map[sub][size];
}

async function initializePacks() {
  try {
    for (const seed of packSeeds) {
      await PackModel.updateOne({ _id: seed._id }, { $set: seed }, { upsert: true });
    }
    console.info(`已 upsert 课包模板: ${packSeeds.length} 个`);
  } catch (e) {
    console.error('Pack.seed 失败:', e);
    throw e;
  }
}

module.exports = { initializePacks, packSeeds, PACK_IDS, resolvePackId };
