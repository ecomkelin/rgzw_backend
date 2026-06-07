const { StudentCourseModel } = require('@models/school/student/StudentCourse.model');

const studentCourseSeeds = [
  {
    _id: '6940d0000000000000000401',
    Student: '693e7c42963e26d1f8034418',  // 裴仕豪
    Account: '693e7c42963e26d1f80356d2',
    Course:  '6940c0000000000000000301',  // 2026春 Python 初级班
    nameCourse: '2026春 Python 初级班',
    status: 'active',
    remark: '需要额外关注',
    Org: '693e7b24b558d56179c0f7ae'
  },
  {
    _id: '6940d0000000000000000402',
    Student: '693e7c42963e26d1f8034428',  // 王兴宇
    Account: '693e7c42963e26d1f80346d2',
    Course:  '6940c0000000000000000302',  // 2026夏 C++ 算法班
    nameCourse: '2026夏 C++ 算法班',
    status: 'active',
    Org: '693e7b24b558d56179c0f7ae'
  }
];

async function initializeStudentCourses() {
  try {
    for (const seed of studentCourseSeeds) {
      await StudentCourseModel.updateOne({ _id: seed._id }, { $set: seed }, { upsert: true });
    }
    console.info(`已 upsert StudentCourse: ${studentCourseSeeds.length} 条`);
  } catch (e) {
    console.error('StudentCourse.seed 失败:', e);
    throw e;
  }
}

module.exports = { initializeStudentCourses, studentCourseSeeds };
