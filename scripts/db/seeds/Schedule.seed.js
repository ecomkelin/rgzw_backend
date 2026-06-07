/**
 * 排课种子: 调 schedule/lib/expander 把已 upsert 的 Course.scheduleRules 展开成 Lesson 写库
 * 可独立运行: node scripts/db/seeds/Schedule.seed.js
 */
require('module-alias/register');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const { CourseModel } = require('@models/school/course/Course.model');
const { LessonModel } = require('@models/school/lesson/Lesson.model');
const { expand, toLessonDocs } = require('@modules/_school/schedule/lib/expander');

const TARGET_COURSE_IDS = [
  '6940c0000000000000000301',  // Python 初级班
  '6940c0000000000000000302'   // C++ 算法班
];

async function generateForCourse(courseId, createdBy) {
  const course = await CourseModel.findById(courseId);
  if (!course) {
    console.warn(`[Schedule.seed] 课程 ${courseId} 不存在, 跳过`);
    return 0;
  }

  // 同一课已经生成的 scheduled Lesson 清掉 (重跑种子幂等)
  await LessonModel.deleteMany({ Course: courseId, status: 'scheduled' });

  const rangeFrom = course.startDate || new Date();
  const rangeTo   = course.endDate   || new Date(Date.now() + 1000 * 60 * 60 * 24 * 365);
  const previews = expand(course, rangeFrom, rangeTo);
  if (!previews.length) {
    console.info(`[Schedule.seed] ${course.name} 展开 0 条, 跳过`);
    return 0;
  }
  const docs = toLessonDocs(course, previews, { currentUser: { _id: createdBy } });
  await LessonModel.insertMany(docs, { ordered: false });
  console.info(`[Schedule.seed] ${course.name} 写入 ${docs.length} 条 Lesson`);
  return docs.length;
}

async function initializeLessons() {
  // 默认 createdBy = 梓潼学校的管理员
  const createdBy = '693e7c42963e26d1f80344ac';  // 李校长 (梓潼)
  let total = 0;
  for (const id of TARGET_COURSE_IDS) {
    total += await generateForCourse(id, createdBy);
  }
  console.info(`[Schedule.seed] 共写入 ${total} 条 Lesson`);
  return total;
}

// 独立运行入口
if (require.main === module) {
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

module.exports = { initializeLessons, generateForCourse };
