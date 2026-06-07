/**
 * 排课 (Lesson) 种子
 *
 * 策略:
 *   1. 清空全部 Lesson (重跑幂等)
 *   2. 遍历 Course.seed 已 upsert 的 9 门课, 用 expander 把 scheduleRules 展开
 *   3. 每门课预计 16 条 Lesson
 *   4. 已开课 13 周, 把前 13 条 (按时间升序) 标为 'completed', 后 3 条保留 'scheduled'
 *   5. completed 的 lesson 会顺带把 actualStartTime / actualEndTime 填上 (与 plannedDate 一致)
 *
 * 依赖: Course.seed 已 run
 */
require('module-alias/register');

const { CourseModel } = require('@models/school/course/Course.model');
const { LessonModel } = require('@models/school/lesson/Lesson.model');
const { expand, toLessonDocs } = require('@modules/_school/schedule/lib/expander');
const { USER_LI } = require('./Account.seed');
const { COURSE_IDS } = require('./Course.seed');

const TARGET_COURSE_IDS = Object.values(COURSE_IDS);
const COMPLETED_COUNT = 13; // 已上完 13 节

async function generateForCourse(courseId, createdBy) {
  const course = await CourseModel.findById(courseId);
  if (!course) {
    console.warn(`[Schedule.seed] 课程 ${courseId} 不存在, 跳过`);
    return 0;
  }

  // 幂等: 先清掉这门课所有 Lesson
  await LessonModel.deleteMany({ Course: courseId });

  const rangeFrom = course.startDate || new Date('2026-03-06');
  const rangeTo   = course.endDate   || new Date('2026-06-26');
  const previews = expand(course, rangeFrom, rangeTo);
  if (!previews.length) {
    console.info(`[Schedule.seed] ${course.name} 展开 0 条, 跳过`);
    return 0;
  }

  // 只取 totalSessions 条
  const sliced = previews.slice(0, course.totalSessions);
  const docs = toLessonDocs(course, sliced, { currentUser: { _id: createdBy } });

  // 标记已完成的课次
  const completed = Math.min(COMPLETED_COUNT, sliced.length);
  for (let i = 0; i < docs.length; i++) {
    if (i < completed) {
      docs[i].status = 'completed';
      docs[i].actualStartTime = docs[i].plannedDate;
      docs[i].actualEndTime   = docs[i].plannedEndDate;
      docs[i].teacherAttendance = 'present';
    } else {
      docs[i].status = 'scheduled';
    }
  }

  const result = await LessonModel.insertMany(docs, { ordered: false });
  const completedCount = result.filter(r => r.status === 'completed').length;
  const scheduledCount = result.filter(r => r.status === 'scheduled').length;
  console.info(`[Schedule.seed] ${course.name}: 写入 ${result.length} 条 (已完成 ${completedCount} / 已排 ${scheduledCount})`);
  return result.length;
}

async function initializeLessons() {
  const createdBy = USER_LI;
  let total = 0;
  for (const id of TARGET_COURSE_IDS) {
    total += await generateForCourse(id, createdBy);
  }
  console.info(`[Schedule.seed] 共写入 ${total} 条 Lesson (其中已上完 ${TOTAL_COMPLETED} 节, 待上 ${TOTAL_SCHEDULED} 节)`);
  return total;
}

const TOTAL_COMPLETED = COMPLETED_COUNT * TARGET_COURSE_IDS.length;
const TOTAL_SCHEDULED = (16 - COMPLETED_COUNT) * TARGET_COURSE_IDS.length;

// 独立运行入口
if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
  const mongoose = require('mongoose');
  (async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_TEST_URI);
      console.info('MongoDB 连接成功');
      await initializeLessons();
    } catch (e) {
      console.error('[Schedule.seed] 失败:', e);
      process.exit(1);
    } finally {
      await mongoose.disconnect();
      process.exit(0);
    }
  })();
}

module.exports = { initializeLessons, generateForCourse, COMPLETED_COUNT };
