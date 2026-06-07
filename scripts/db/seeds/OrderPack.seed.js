/**
 * 课包订单 (OrderPack) 与 学生课包 (StudentPack) 种子
 *
 * 每个学生 1 张订单, 状态=已支付, 课时数 = PACK_PLAN 决定的 totalLesson.
 * StudentPack 由 OrderPackDAO 业务侧会自动创建, 种子不走 DAO 而是直接 insertMany
 * (避免 payload 校验以及 createdBy/Account 反复取)
 *
 * 关键计算:
 *   - 已完成 13 节课, 所有学生的 remainingLesson = totalLesson - 13
 *   - P_OTHER (4 名) 走 free 资源, 没有 Pack 模板, 课时拼盘 (上年剩余 + 新报)
 */
const { OrderPackModel } = require('@models/pack/OrderPack.model');
const { StudentPackModel } = require('@models/school/student/StudentPack.model');
const {
  ORG_ZITONG,
  USER_LI, USER_GAO, USER_YU, USER_YANG,
  STUDENT_LIST,
  PACK_PLAN,
  buildStudentData
} = require('./Account.seed');
const { COURSE_IDS, courseMeta } = require('./Course.seed');
const { resolvePackId, PACK_IDS } = require('./Pack.seed');

/**
 * P_OTHER 学生的特殊处理: 上年剩余 + 本期新报 拼成剩余
 * idx 37, 38 (大颗粒 初级 后两名) -> 上年剩余 8 节 + 本期 16 节 = 24
 * idx 还有 1 个... 实际只有 2 个 P_OTHER, PACK_PLAN 设计是 4 个, 我得再确认
 */
function resolveOtherTotalLesson(idx) {
  // 简单规则: idx 是 4 的倍数 -> 24 节, 否则 20 节
  // 实际上 P_OTHER 含义是 "上年剩余 + 本期", 数量不一定, 我们固定为 24 (8+16)
  return 24;
}

const COMPLETED_LESSONS = 13; // 每个学生已上完 13 节

/**
 * 渲染所有 OrderPack + StudentPack 文档
 */
function buildOrderAndStudentPackData() {
  const studentData = buildStudentData();
  const orderPackPrefix = '693e7c42963e26d1f848'; // 8480001..
  const studentPackPrefix = '693e7c42963e26d1f849'; // 8490001..
  const orderPacks = [];
  const studentPacks = [];

  studentData.forEach((s, idx) => {
    const orderPackId  = `${orderPackPrefix}${String(idx + 1).padStart(4, '0')}`;
    const studentPackId = `${studentPackPrefix}${String(idx + 1).padStart(4, '0')}`;
    const packKey = PACK_PLAN[idx];
    const packId = resolvePackId(s.courseKey, packKey);
    const courseId = COURSE_IDS[s.courseKey];

    let totalLesson, priceFinal, packName, packType, payMethod, saleNote, resource;

    if (packKey === 'P_OTHER') {
      // 走 free 资源, 拼盘 24 节
      totalLesson = resolveOtherTotalLesson(idx);
      priceFinal  = 0;
      packName    = '上年剩余 + 春季新报 24 课时';
      packType    = '赠送';
      payMethod   = 'transfer';
      saleNote    = 'free - 上年剩余 8 节 + 本期新报 16 节';
      resource    = 'free';
    } else if (packKey === 'P_48_PRIVATE') {
      totalLesson = 48;
      priceFinal  = 960000;
      packName    = 'C++ 私教定制包 48 课时';
      packType    = '定制包';
      payMethod   = 'transfer';
      saleNote    = 'C++ 1 对 1 私教, 第二次报名';
      resource    = 'OrderPack';
    } else if (packKey === 'P_48_PYTHON') {
      totalLesson = 48;
      priceFinal  = 640000;
      packName    = 'Python 进阶 48 课时包';
      packType    = '课时包';
      payMethod   = 'wechat';
      saleNote    = 'Python 进阶 48 课时 6400';
      resource    = 'OrderPack';
    } else {
      // P_16 / P_32 / P_48
      const size = packKey.split('_')[1];
      totalLesson = Number(size);
      // 按 SUBJECT + size 推价
      const subjectMap = {
        '16_DKL':     { name: '大颗粒 16 课时包',   price: 150000 },
        '32_DKL':     { name: '大颗粒 32 课时包',   price: 280000 },
        '48_DKL':     { name: '大颗粒 48 课时包',   price: 420000 },
        '16_SPIKE':   { name: 'Spike 16 春秋季包',  price: 190000 }, // 春秋季 实付 1900
        '32_SPIKE':   { name: 'Spike 32 课时包',    price: 320000 },
        '48_SPIKE':   { name: 'Spike 48 课时包',    price: 480000 },
        '16_SCRATCH': { name: 'Scratch 16 春秋季包', price: 190000 },
        '32_SCRATCH': { name: 'Scratch 32 课时包',  price: 320000 },
        '48_SCRATCH': { name: 'Scratch 48 课时包',  price: 480000 },
        '16_PYTHON':  { name: 'Python 16 课时包',   price: 220000 },
        '32_PYTHON':  { name: 'Python 32 课时包',   price: 430000 },
        '48_PYTHON':  { name: 'Python 48 课时包',   price: 640000 },
        '16_CPP':     { name: 'C++ 16 课时包',      price: 320000 },
        '32_CPP':     { name: 'C++ 32 课时包',      price: 640000 },
        '48_CPP':     { name: 'C++ 私教 48 课时',   price: 960000 }
      };
      const sub = (s.courseKey || '').split('_')[0];
      const key = `${size}_${sub}`;
      const cfg = subjectMap[key] || { name: '未知课包', price: 0 };
      packName    = cfg.name;
      packType    = '课时包';
      priceFinal  = cfg.price;
      payMethod   = Math.random() < 0.5 ? 'wechat' : 'cash';
      saleNote    = `${cfg.name} 实付 ${cfg.price / 100} 元`;
      resource    = 'OrderPack';
    }

    // 有效日期: 普通课包 validDays 由 Pack 模板决定, 但 free 课包 365 天兜底
    let validDays = null, expireDate = null;
    if (resource === 'OrderPack') {
      validDays = size_to_validDays(totalLesson, packKey);
    }
    if (validDays) {
      const d = new Date();
      d.setDate(d.getDate() + validDays);
      expireDate = d;
    }

    // 报名日期: 2026-02-20 春季统一开班前 2 周
    const orderDate = new Date('2026-02-20T10:00:00Z');

    orderPacks.push({
      _id: orderPackId,
      Account: s.accountId,
      Student: s.studentId,
      Pack: packId || undefined,
      packName,
      totalLesson,
      validDays: validDays || undefined,
      priceOrigin: priceFinal,
      priceRegular: priceFinal,
      priceSale: priceFinal,
      finalPrice: priceFinal,
      payStatus: 'Paid',
      payMethod,
      transactionId: `SEED${Date.now()}${idx}`,
      paidAt: orderDate,
      Course: courseId,
      remark: saleNote,
      createdBy: USER_LI,
      Org: ORG_ZITONG
    });

    studentPacks.push({
      _id: studentPackId,
      resource,
      OrderPack: resource === 'OrderPack' ? orderPackId : undefined,
      Pack: packId || undefined,
      Student: s.studentId,
      Account: s.accountId,
      packName,
      totalLesson,
      remainingLesson: Math.max(0, totalLesson - COMPLETED_LESSONS),
      activeDate: orderDate,
      expireDate,
      status: 'active',
      description: saleNote,
      Org: ORG_ZITONG,
      createdBy: USER_LI
    });
  });

  return { orderPacks, studentPacks };
}

function size_to_validDays(totalLesson, packKey) {
  if (packKey === 'P_48_PRIVATE') return 365;
  if (packKey === 'P_48_PYTHON')  return 365;
  if (totalLesson === 16) return 180;  // 春秋 180 天
  if (totalLesson === 32) return 365;
  if (totalLesson === 48) return 365;
  return 365;
}

async function initializeOrderPacks() {
  try {
    await OrderPackModel.deleteMany({});
    await StudentPackModel.deleteMany({});

    const { orderPacks, studentPacks } = buildOrderAndStudentPackData();

    const orderDocs = await OrderPackModel.insertMany(orderPacks, { ordered: false });
    console.info(`已创建 OrderPack: ${orderDocs.length} 张`);

    const studentPackDocs = await StudentPackModel.insertMany(studentPacks, { ordered: false });
    console.info(`已创建 StudentPack: ${studentPackDocs.length} 个`);

    // 统计
    const totalRemaining = studentPacks.reduce((sum, sp) => sum + sp.remainingLesson, 0);
    console.info(`所有学生剩余课时合计: ${totalRemaining} 节 (本批 ${studentPacks.length} 名, 每名已上完 ${COMPLETED_LESSONS} 节)`);
  } catch (e) {
    console.error('OrderPack.seed 失败:', e);
    throw e;
  }
}

module.exports = { initializeOrderPacks, buildOrderAndStudentPackData, COMPLETED_LESSONS };
