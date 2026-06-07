/**
 * 学生档案补丁: 给 Account.seed 已建好的 Student 补 unavailableSlots (学校晚自习等)
 * 不增删 Student, 只 update
 *
 * 假设周一/周三/周五 19:00-21:00 为大部分小学生在校晚自习, 默认加这三条
 * 周末白天 09:00-18:00 默认全部可上课
 */
const { StudentModel } = require('@models/school/student/Student.dao');
const { buildStudentData } = require('./Account.seed');

/**
 * 给指定学生加重补/重修/请假等不可用时段
 * 这里只演示 1 个学生 (王兴宇, 全脱产冲刺 C++ 私教, 周末白天全空, 学校晚自习也保留)
 */
async function initializeStudents() {
  try {
    const all = buildStudentData();
    let updatedCount = 0;

    for (const s of all) {
      // 默认所有学生: 周一/周三/周五 19:00-21:00 学校晚自习
      const slots = [
        { dayOfWeek: 1, startTime: '19:00', endTime: '21:00', reason: '学校晚自习' },
        { dayOfWeek: 3, startTime: '19:00', endTime: '21:00', reason: '学校晚自习' },
        { dayOfWeek: 5, startTime: '19:00', endTime: '21:00', reason: '学校晚自习' }
      ];
      await StudentModel.updateOne(
        { _id: s.studentId },
        { $set: { unavailableSlots: slots, school: '梓潼县文昌二小' } }
      );
      updatedCount++;
    }
    console.info(`已更新 ${updatedCount} 个学生的 unavailableSlots`);
  } catch (e) {
    console.error('Student.seed 失败:', e);
    throw e;
  }
}

module.exports = { initializeStudents };
