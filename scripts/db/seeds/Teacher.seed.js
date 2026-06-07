/**
 * 老师种子: 给 Account.seed 中已有的 2 个老师 (杨老师 / 于老师) 附加 unavailableSlots 演示
 * 不增删 User, 只 update
 */
const { UserModel } = require('@models/organization/structure/User.model');

// 给梓潼学校的杨老师加 "周三 19-21 不可用" (有其他学校课)
const teacherUpdates = [
  {
    filter: { _id: '693e7c42963e26d1f80345bc', Org: '693e7b24b558d56179c0f7ae' },
    set: {
      unavailableSlots: [
        {
          dayOfWeek: 3,        // 周三
          startTime: '19:00',
          endTime:   '21:00',
          reason:    '另一所学校兼职'
        }
      ]
    }
  },
  {
    filter: { _id: '693e7c42963e26d1f80344b8', Org: '693e7b24b558d56179c0f7ae' },
    set: {
      unavailableSlots: [
        {
          dateRange: { from: '2026-07-01', to: '2026-07-15' },
          startTime: '00:00',
          endTime:   '23:59',
          reason:    '暑假'
        }
      ]
    }
  }
];

async function initializeTeachers() {
  try {
    for (const t of teacherUpdates) {
      await UserModel.updateOne(t.filter, { $set: t.set });
    }
    console.info(`已更新 ${teacherUpdates.length} 个老师的 unavailableSlots`);
  } catch (e) {
    console.error('Teacher.seed 失败:', e);
    throw e;
  }
}

module.exports = { initializeTeachers };
