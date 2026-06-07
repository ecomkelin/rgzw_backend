/**
 * 科目 (Subject) 种子
 *
 * 学科清单:
 *   - 大颗粒电子积木: 初级 / 高级
 *   - Spike:          初级 / 中级 / 高级
 *   - Scratch:        初级 / 中级 / 高级 / 考级
 *   - Python:         初级 / 中级 / 高级 / 考级 / 进阶
 *   - C++:            初级 / 中级 / 高级 / 考级 / 进阶
 *
 * 课时标准 16 节/期, 单节时长多数 90 分钟, C++ 与 Python 进阶 120 分钟
 * 默认单价 (元): 大颗粒 16 节 1500 / 48 节 4200, spike scratch 16 节 春秋 2100 / 寒暑 1600, 48 节 4800
 *               python 48 节 6400, C++ 私教 48 节 9600
 */
const { SubjectModel, SubjectEnums } = require('@models/school/course/Subject.model');
const { ORG_ZITONG } = require('./Account.seed');

/**
 * key  -> Mongo _id (24 位 hex), 集中维护方便 Course.seed / Pack.seed 引用
 * 0x8440001 ~ 0x8440019 (19 个)
 */
const SUBJECT_IDS = {
  DKL_BEGIN:    '693e7c42963e26d1f8440001', // 大颗粒 初级
  DKL_ADV:      '693e7c42963e26d1f8440002', // 大颗粒 高级
  SPIKE_BEGIN:  '693e7c42963e26d1f8440003', // Spike 初级
  SPIKE_MID:    '693e7c42963e26d1f8440004', // Spike 中级
  SPIKE_ADV:    '693e7c42963e26d1f8440005', // Spike 高级
  SCRATCH_BEGIN:'693e7c42963e26d1f8440006', // Scratch 初级
  SCRATCH_MID:  '693e7c42963e26d1f8440007', // Scratch 中级
  SCRATCH_ADV:  '693e7c42963e26d1f8440008', // Scratch 高级
  SCRATCH_EXAM: '693e7c42963e26d1f8440009', // Scratch 考级
  PYTHON_BEGIN: '693e7c42963e26d1f844000a', // Python 初级
  PYTHON_MID:   '693e7c42963e26d1f844000b', // Python 中级
  PYTHON_ADV:   '693e7c42963e26d1f844000c', // Python 高级
  PYTHON_EXAM:  '693e7c42963e26d1f844000d', // Python 考级
  PYTHON_PRO:   '693e7c42963e26d1f844000e', // Python 进阶
  CPP_BEGIN:    '693e7c42963e26d1f844000f', // C++ 初级
  CPP_MID:      '693e7c42963e26d1f8440010', // C++ 中级
  CPP_ADV:      '693e7c42963e26d1f8440011', // C++ 高级
  CPP_EXAM:     '693e7c42963e26d1f8440012', // C++ 考级
  CPP_PRO:      '693e7c42963e26d1f8440013'  // C++ 进阶
};

/**
 * name -> Subject key (课程表里用 courseKey 引用这里)
 */
const COURSE_SUBJECT_MAP = {
  DKL_BEGIN:    'DKL_BEGIN',
  DKL_ADV:      'DKL_ADV',
  SPIKE_BEGIN:  'SPIKE_BEGIN',
  SPIKE_MID:    'SPIKE_MID',
  SCRATCH_BEGIN:'SCRATCH_BEGIN',
  SCRATCH_MID:  'SCRATCH_MID',
  SCRATCH_ADV:  'SCRATCH_ADV',
  PYTHON_ADV:   'PYTHON_PRO',
  CPP_BEGIN:    'CPP_BEGIN'
};

/**
 * 渲染成 Subject 文档
 * price (单位: 分)  来自 Pack, 这里只填 "单课时建议价" 作为参考
 */
const subjectSeeds = [
  // ============== 大颗粒电子积木 ==============
  {
    _id: SUBJECT_IDS.DKL_BEGIN, category: '电子智慧大颗粒', name: '大颗粒电子积木 初级',
    price: 9300,  duration_minutes: 90, default_lesson_count: 16,
    description: '面向幼儿园至小学低年级, 通过大颗粒积木认识结构与简单电路',
    sort: 200, isActive: true, isShow: true, Org: ORG_ZITONG
  },
  {
    _id: SUBJECT_IDS.DKL_ADV, category: '电子智慧大颗粒', name: '大颗粒电子积木 高级',
    price: 9300,  duration_minutes: 90, default_lesson_count: 16,
    description: '大颗粒进阶, 引入马达、传感器与综合项目',
    sort: 190, isActive: true, isShow: true, Org: ORG_ZITONG
  },

  // ============== Spike ==============
  {
    _id: SUBJECT_IDS.SPIKE_BEGIN, category: 'Spike', name: 'Spike 初级',
    price: 13100, duration_minutes: 90, default_lesson_count: 16,
    description: '乐高 Spike 基础, 图形化拖拽 + 简单硬件',
    sort: 180, isActive: true, isShow: true, Org: ORG_ZITONG
  },
  {
    _id: SUBJECT_IDS.SPIKE_MID, category: 'Spike', name: 'Spike 中级',
    price: 13100, duration_minutes: 90, default_lesson_count: 16,
    description: 'Spike 中级, 变量 / 函数 / 传感器综合',
    sort: 170, isActive: true, isShow: true, Org: ORG_ZITONG
  },
  {
    _id: SUBJECT_IDS.SPIKE_ADV, category: 'Spike', name: 'Spike 高级',
    price: 13100, duration_minutes: 90, default_lesson_count: 16,
    description: 'Spike 高级, 工程项目 + 团队赛',
    sort: 160, isActive: true, isShow: true, Org: ORG_ZITONG
  },

  // ============== Scratch ==============
  {
    _id: SUBJECT_IDS.SCRATCH_BEGIN, category: 'Scratch', name: 'Scratch 初级',
    price: 13100, duration_minutes: 90, default_lesson_count: 16,
    description: 'Scratch 入门, 顺序 / 循环 / 条件三大结构',
    sort: 150, isActive: true, isShow: true, Org: ORG_ZITONG
  },
  {
    _id: SUBJECT_IDS.SCRATCH_MID, category: 'Scratch', name: 'Scratch 中级',
    price: 13100, duration_minutes: 90, default_lesson_count: 16,
    description: 'Scratch 中级, 消息广播 / 克隆 / 复杂逻辑',
    sort: 140, isActive: true, isShow: true, Org: ORG_ZITONG
  },
  {
    _id: SUBJECT_IDS.SCRATCH_ADV, category: 'Scratch', name: 'Scratch 高级',
    price: 13100, duration_minutes: 90, default_lesson_count: 16,
    description: 'Scratch 高级, 算法 / 数据结构启蒙',
    sort: 130, isActive: true, isShow: true, Org: ORG_ZITONG
  },
  {
    _id: SUBJECT_IDS.SCRATCH_EXAM, category: 'Scratch', name: 'Scratch 考级',
    price: 15000, duration_minutes: 90, default_lesson_count: 16,
    description: 'Scratch 等级考试集训 (GESP / 全国青少年软件编程)',
    sort: 120, isActive: true, isShow: true, Org: ORG_ZITONG
  },

  // ============== Python ==============
  {
    _id: SUBJECT_IDS.PYTHON_BEGIN, category: 'Python', name: 'Python 初级',
    price: 14000, duration_minutes: 90, default_lesson_count: 16,
    description: 'Python 入门, 语法 + 基础算法',
    sort: 110, isActive: true, isShow: true, Org: ORG_ZITONG
  },
  {
    _id: SUBJECT_IDS.PYTHON_MID, category: 'Python', name: 'Python 中级',
    price: 15000, duration_minutes: 90, default_lesson_count: 16,
    description: 'Python 中级, OOP + 常用库',
    sort: 100, isActive: true, isShow: true, Org: ORG_ZITONG
  },
  {
    _id: SUBJECT_IDS.PYTHON_ADV, category: 'Python', name: 'Python 高级',
    price: 16000, duration_minutes: 90, default_lesson_count: 16,
    description: 'Python 高级, 数据结构与算法',
    sort: 95, isActive: true, isShow: true, Org: ORG_ZITONG
  },
  {
    _id: SUBJECT_IDS.PYTHON_EXAM, category: 'Python', name: 'Python 考级',
    price: 16000, duration_minutes: 90, default_lesson_count: 16,
    description: 'Python 等级考试集训 (GESP / 蓝桥)',
    sort: 90, isActive: true, isShow: true, Org: ORG_ZITONG
  },
  {
    _id: SUBJECT_IDS.PYTHON_PRO, category: 'Python', name: 'Python 进阶',
    price: 18000, duration_minutes: 120, default_lesson_count: 16,
    description: 'Python 进阶, 项目实战 + 竞赛',
    sort: 85, isActive: true, isShow: true, Org: ORG_ZITONG
  },

  // ============== C++ ==============
  {
    _id: SUBJECT_IDS.CPP_BEGIN, category: 'C++', name: 'C++ 初级',
    price: 20000, duration_minutes: 90, default_lesson_count: 16,
    description: 'C++ 语法基础 + Dev-C++ 环境',
    sort: 80, isActive: true, isShow: true, Org: ORG_ZITONG
  },
  {
    _id: SUBJECT_IDS.CPP_MID, category: 'C++', name: 'C++ 中级',
    price: 22000, duration_minutes: 90, default_lesson_count: 16,
    description: 'C++ 中级, STL + 基础算法',
    sort: 75, isActive: true, isShow: true, Org: ORG_ZITONG
  },
  {
    _id: SUBJECT_IDS.CPP_ADV, category: 'C++', name: 'C++ 高级',
    price: 25000, duration_minutes: 90, default_lesson_count: 16,
    description: 'C++ 高级, 动态规划 / 图论',
    sort: 70, isActive: true, isShow: true, Org: ORG_ZITONG
  },
  {
    _id: SUBJECT_IDS.CPP_EXAM, category: 'C++', name: 'C++ 考级',
    price: 25000, duration_minutes: 90, default_lesson_count: 16,
    description: 'C++ 等级考试 / 蓝桥真题',
    sort: 65, isActive: true, isShow: true, Org: ORG_ZITONG
  },
  {
    _id: SUBJECT_IDS.CPP_PRO, category: 'C++', name: 'C++ 进阶',
    price: 30000, duration_minutes: 120, default_lesson_count: 16,
    description: 'C++ 进阶, NOIP / CSP-J/S 集训',
    sort: 60, isActive: true, isShow: true, Org: ORG_ZITONG
  }
];

async function initializeSubjects() {
  try {
    for (const seed of subjectSeeds) {
      await SubjectModel.updateOne({ _id: seed._id }, { $set: seed }, { upsert: true });
    }
    console.info(`已 upsert 科目: ${subjectSeeds.length} 个`);
  } catch (e) {
    console.error('Subject.seed 失败:', e);
    throw e;
  }
}

module.exports = { initializeSubjects, subjectSeeds, SUBJECT_IDS, COURSE_SUBJECT_MAP };
