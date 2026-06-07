/**
 * 学生种子: 给 Account.seed 中已有的 2 个学生附加 unavailableSlots 演示
 * 不增删 Student, 只 update
 */
const { StudentModel } = require('@models/school/student/Student.model');

const studentUpdates = [
  {
    // 裴仕豪: 周一三五 19-21 学校晚自习
    filter: { _id: '693e7c42963e26d1f8034418' },
    set: {
      unavailableSlots: [
        { dayOfWeek: 1, startTime: '19:00', endTime: '21:00', reason: '学校晚自习' },
        { dayOfWeek: 3, startTime: '19:00', endTime: '21:00', reason: '学校晚自习' },
        { dayOfWeek: 5, startTime: '19:00', endTime: '21:00', reason: '学校晚自习' }
      ]
    }
  },
  {
    // 王兴宇: 不加, 留作排课冲突演示
    filter: { _id: '693e7c42963e26d1f8034428' },
    set: { unavailableSlots: [] }
  }
];

async function initializeStudents() {
  try {
    for (const s of studentUpdates) {
      await StudentModel.updateOne(s.filter, { $set: s.set });
    }
    console.info(`已更新 ${studentUpdates.length} 个学生的 unavailableSlots`);
  } catch (e) {
    console.error('Student.seed 失败:', e);
    throw e;
  }
}

module.exports = { initializeStudents };
