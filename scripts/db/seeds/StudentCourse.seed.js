/**
 * 学生报名 (StudentCourse) 种子
 *
 * 39 名学生 -> 各自所在课程
 * StudentPack 同时绑上去 (StudentCourse.StudentPack 字段, 可选)
 */
const { StudentCourseModel } = require('@models/school/student/StudentCourse.model');
const { buildStudentData, PACK_PLAN, ORG_ZITONG, USER_LI } = require('./Account.seed');
const { COURSE_IDS, courseMeta } = require('./Course.seed');
const { resolvePackId } = require('./Pack.seed');

const PREFIX = '693e7c42963e26d1f84a'; // 84a0001..

function buildStudentCourseData() {
  const studentData = buildStudentData();
  const studentPackPrefix = '693e7c42963e26d1f849'; // 与 OrderPack.seed 一致

  return studentData.map((s, idx) => {
    const courseId = COURSE_IDS[s.courseKey];
    const meta = courseMeta.find(m => m.courseKey === s.courseKey);
    const studentPackId = `${studentPackPrefix}${String(idx + 1).padStart(4, '0')}`;

    return {
      _id: `${PREFIX}${String(idx + 1).padStart(4, '0')}`,
      Student: s.studentId,
      Account: s.accountId,
      Course: courseId,
      nameCourse: meta ? meta.name : s.courseKey,
      StudentPack: studentPackId,
      StudentCourseDate: new Date('2026-02-20T10:00:00Z'),
      status: 'active',
      Org: ORG_ZITONG,
      createdBy: USER_LI
    };
  });
}

async function initializeStudentCourses() {
  try {
    await StudentCourseModel.deleteMany({});

    const docs = buildStudentCourseData();
    const result = await StudentCourseModel.insertMany(docs, { ordered: false });
    console.info(`已创建 StudentCourse: ${result.length} 条`);

    // 按课程统计
    const stats = {};
    for (const r of result) {
      stats[r.nameCourse] = (stats[r.nameCourse] || 0) + 1;
    }
    for (const [name, n] of Object.entries(stats)) {
      console.info(`  ${name}: ${n} 人`);
    }
  } catch (e) {
    console.error('StudentCourse.seed 失败:', e);
    throw e;
  }
}

module.exports = { initializeStudentCourses, buildStudentCourseData };
