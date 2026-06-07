/**
 * 课程 (Course) 种子 - 2026 春季正在进行的一期
 *
 * 设计:
 *   - 9 个班 (用户口述 7 个, 实际排课表 9 个时段; 课程名沿用班级名)
 *   - 16 节课/期, 周课 (weekly)
 *   - 起始日统一 2026-03-06 (周五, 第 1 节课会按各自 weekday 落到首个对应星期)
 *   - 结束日统一 2026-06-26 (16 周后, expander 会自动截断)
 *   - status: 'ongoing' (本期进行中)
 *
 * 课程清单 (与 Account.seed.STUDENT_LIST 严格对应):
 *   1. C++ 初级   周五 17:00-18:30  room1  USER_LI     1  人  (王兴宇 私教)
 *   2. Scratch 初级 周六 10:00-11:30 room1  USER_YU     4  人
 *   3. Python 进阶 周六 10:00-12:00 room2  USER_LI     2  人  (120 分钟)
 *   4. Scratch 高级 周六 14:00-15:30 room1  USER_YU     6  人
 *   5. Scratch 中级 周六 16:00-17:30 room1  USER_YU     5  人
 *   6. Spike 初级  周日 09:00-10:30 room1  USER_GAO     6  人
 *   7. 大颗粒 高级 周日 10:40-12:10 room1 USER_YANG   5  人
 *   8. Spike 中级  周日 14:00-15:30 room1  USER_GAO     6  人
 *   9. 大颗粒 初级 周日 16:00-17:30 room1 USER_YANG   4  人
 */
const { CourseModel } = require('@models/school/course/Course.model');
const {
  ORG_ZITONG,
  USER_LI, USER_GAO, USER_YU, USER_YANG
} = require('./Account.seed');
const { COURSE_SUBJECT_MAP, SUBJECT_IDS } = require('./Subject.seed');
const { ROOM_1, ROOM_2 } = require('./Room.seed');

const COURSE_PREFIX = '693e7c42963e26d1f846'; // 8460001..8460009

/**
 * 课程元数据
 *   courseKey -> 与 Account.seed.STUDENT_LIST 中 courseKey 一致
 */
const courseMeta = [
  { idx: 1, name: '2026春 C++ 初级 (王兴宇私教)', courseKey: 'CPP_BEGIN',
    weekday: 5, startTime: '17:00', endTime: '18:30', room: ROOM_1, teacher: USER_LI, max: 1 },
  { idx: 2, name: '2026春 Scratch 初级班',         courseKey: 'SCRATCH_BEGIN',
    weekday: 6, startTime: '10:00', endTime: '11:30', room: ROOM_1, teacher: USER_YU, max: 8 },
  { idx: 3, name: '2026春 Python 进阶班',          courseKey: 'PYTHON_ADV',
    weekday: 6, startTime: '10:00', endTime: '12:00', room: ROOM_2, teacher: USER_LI, max: 4 },
  { idx: 4, name: '2026春 Scratch 高级班',         courseKey: 'SCRATCH_ADV',
    weekday: 6, startTime: '14:00', endTime: '15:30', room: ROOM_1, teacher: USER_YU, max: 8 },
  { idx: 5, name: '2026春 Scratch 中级班',         courseKey: 'SCRATCH_MID',
    weekday: 6, startTime: '16:00', endTime: '17:30', room: ROOM_1, teacher: USER_YU, max: 8 },
  { idx: 6, name: '2026春 Spike 初级班',           courseKey: 'SPIKE_BEGIN',
    weekday: 0, startTime: '09:00', endTime: '10:30', room: ROOM_1, teacher: USER_GAO, max: 8 },
  { idx: 7, name: '2026春 大颗粒 高级班',          courseKey: 'DKL_ADV',
    weekday: 0, startTime: '10:40', endTime: '12:10', room: ROOM_1, teacher: USER_YANG, max: 8 },
  { idx: 8, name: '2026春 Spike 中级班',           courseKey: 'SPIKE_MID',
    weekday: 0, startTime: '14:00', endTime: '15:30', room: ROOM_1, teacher: USER_GAO, max: 8 },
  { idx: 9, name: '2026春 大颗粒 初级班',          courseKey: 'DKL_BEGIN',
    weekday: 0, startTime: '16:00', endTime: '17:30', room: ROOM_1, teacher: USER_YANG, max: 8 }
];

const COURSE_IDS = {};
const courseSeeds = courseMeta.map((m, i) => {
  const _id = `${COURSE_PREFIX}${String(i + 1).padStart(4, '0')}`;
  COURSE_IDS[m.courseKey] = _id;
  const subjectKey = COURSE_SUBJECT_MAP[m.courseKey];
  return {
    _id,
    name: m.name,
    Subject: SUBJECT_IDS[subjectKey],
    mainTeacher: m.teacher,
    startDate: new Date('2026-03-06T00:00:00Z'),
    endDate:   new Date('2026-06-26T23:59:59Z'),
    totalSessions: 16,
    frequency: 'weekly',
    scheduleRules: [
      { dayOfWeek: m.weekday, startTime: m.startTime, endTime: m.endTime, note: m.name }
    ],
    defaultRoom: m.room,
    maxStudents: m.max,
    price: 0, // 价格跟随 StudentPack, 课程本身不标价
    status: 'ongoing',
    publishDate: new Date('2026-02-20'),
    isActive: true,
    sort: 100 - i,
    description: `2026 春季班, ${m.name}, 周课 16 期`,
    features: '小班教学 + 课后答疑',
    Org: ORG_ZITONG
  };
});

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

module.exports = { initializeCourses, courseSeeds, COURSE_IDS, courseMeta };
