const { CourseModel } = require('@models/school/course/Course.model');

const courseSeeds = [
  {
    _id: '6940c0000000000000000301',
    name: '2026春 Python 初级班',
    Subject: '6940a0000000000000000101',
    mainTeacher: '693e7c42963e26d1f80345bc',  // 杨老师
    assistantTeacher: '693e7c42963e26d1f80344b8',  // 于老师
    startDate: new Date('2026-06-08'),
    endDate:   new Date('2026-08-30'),
    totalSessions: 12,
    frequency: 'weekly',
    // 演示三种排课规则: dayOfWeek / date / dateRange
    scheduleRules: [
      { dayOfWeek: 1, startTime: '18:30', endTime: '20:00', note: '周一晚' },   // 周一
      { dayOfWeek: 4, startTime: '18:30', endTime: '20:00', note: '周四晚' },   // 周四
      { dateRange: { from: '2026-08-01', to: '2026-08-05' },
        startTime: '09:00', endTime: '12:00', note: '暑期集训' }
    ],
    defaultRoom: '6940b0000000000000000201',  // 101
    maxStudents: 8,
    price: 9900,
    status: 'enrolling',
    isActive: true,
    sort: 100,
    features: '小班教学 + 课后答疑',
    description: 'Python 入门到实战, 12 节课',
    Org: '693e7b24b558d56179c0f7ae'
  },
  {
    _id: '6940c0000000000000000302',
    name: '2026夏 C++ 算法班',
    Subject: '6940a0000000000000000102',
    mainTeacher: '693e7c42963e26d1f80344b8',  // 于老师
    startDate: new Date('2026-07-01'),
    endDate:   new Date('2026-07-30'),
    totalSessions: 16,
    frequency: 'custom',
    scheduleRules: [
      { dayOfWeek: 2, startTime: '14:00', endTime: '16:00' },  // 周二
      { dayOfWeek: 6, startTime: '09:00', endTime: '12:00' }   // 周六
    ],
    defaultRoom: '6940b0000000000000000202',  // 102
    maxStudents: 6,
    price: 12800,
    status: 'draft',
    isActive: true,
    sort: 90,
    description: 'C++ 算法竞赛入门, 16 节课',
    Org: '693e7b24b558d56179c0f7ae'
  }
];

async function initializeCourses() {
  try {
    for (const seed of courseSeeds) {
      await CourseModel.updateOne({ _id: seed._id }, { $set: seed }, { upsert: true });
    }
    console.info(`已 upsert 课程: ${courseSeeds.length} 门`);
  } catch (e) {
    console.error('Course.seed 失败:', e);
    throw e;
  }
}

module.exports = { initializeCourses, courseSeeds };
