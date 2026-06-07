/**
 * 老师档案补丁: 给 Account.seed 已建好的 User 补 unavailableSlots / 教学专长
 * 不增删 User, 只 update
 *
 * 专长约定: 用 nickname 旁的描述字段, 这里直接落到 description (User 模型暂无 specialty 字段)
 * 不可用时段 (排课约束): 写入 User.unavailableSlots
 */
const { UserModel } = require('@models/organization/structure/User.dao');
const {
  USER_LI, USER_GAO, USER_ZHANG, USER_YU, USER_YANG,
  ORG_ZITONG
} = require('./Account.seed');

/**
 * 老师专长 / 备注 (落到 description)
 */
const teacherProfiles = [
  {
    filter: { _id: USER_LI, Org: ORG_ZITONG },
    set: {
      description: '校长 / C++ 私教 / Python 进阶'
    }
  },
  {
    filter: { _id: USER_GAO, Org: ORG_ZITONG },
    set: {
      description: '校长 / Spike 主教'
    }
  },
  {
    filter: { _id: USER_ZHANG, Org: ORG_ZITONG },
    set: {
      description: '教务主管 / 排课 / 财务对接'
    }
  },
  {
    filter: { _id: USER_YU, Org: ORG_ZITONG },
    set: {
      description: '梓潼校区 / Scratch 初级·中级·高级',
      unavailableSlots: [
        // 周一晚上机构例会
        { dayOfWeek: 1, startTime: '19:00', endTime: '21:00', reason: '机构例会' }
      ]
    }
  },
  {
    filter: { _id: USER_YANG, Org: ORG_ZITONG },
    set: {
      description: '梓潼校区 / 大颗粒 初级·高级',
      unavailableSlots: [
        // 周三 上午外出培训
        { dayOfWeek: 3, startTime: '09:00', endTime: '12:00', reason: '外出培训' }
      ]
    }
  }
];

async function initializeTeachers() {
  try {
    for (const t of teacherProfiles) {
      await UserModel.updateOne(t.filter, { $set: t.set });
    }
    console.info(`已更新 ${teacherProfiles.length} 个老师的档案`);
  } catch (e) {
    console.error('Teacher.seed 失败:', e);
    throw e;
  }
}

module.exports = { initializeTeachers, teacherProfiles };
