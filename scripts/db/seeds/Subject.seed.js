const { SubjectModel } = require('@models/school/course/Subject.model');

const subjectSeeds = [
  {
    _id: '6940a0000000000000000101',
    name: 'Python 入门',
    category: 'Python',
    price: 9900,
    duration_minutes: 90,
    default_lesson_count: 16,
    description: '从零开始学习 Python 编程',
    Org: '693e7b24b558d56179c0f7ae',
    isActive: true,
    isShow: true,
    sort: 100
  },
  {
    _id: '6940a0000000000000000102',
    name: 'C++ 算法基础',
    category: 'C++',
    price: 12800,
    duration_minutes: 120,
    default_lesson_count: 16,
    description: 'C++ 语法 + 基础算法训练',
    Org: '693e7b24b558d56179c0f7ae',
    isActive: true,
    isShow: true,
    sort: 90
  },
  {
    _id: '6940a0000000000000000103',
    name: 'Scratch 创意编程',
    category: 'Scratch',
    price: 6900,
    duration_minutes: 60,
    default_lesson_count: 12,
    description: '面向小学生的图形化编程',
    Org: '693e7b24b558d56179c0f7ae',
    isActive: true,
    isShow: true,
    sort: 80
  }
];

async function initializeSubjects() {
  try {
    // upsert: 保留手动调整过但同 id 的, 不暴力 deleteMany
    for (const seed of subjectSeeds) {
      await SubjectModel.updateOne({ _id: seed._id }, { $set: seed }, { upsert: true });
    }
    console.info(`已 upsert 科目: ${subjectSeeds.length} 个`);
  } catch (e) {
    console.error('Subject.seed 失败:', e);
    throw e;
  }
}

module.exports = { initializeSubjects, subjectSeeds };
