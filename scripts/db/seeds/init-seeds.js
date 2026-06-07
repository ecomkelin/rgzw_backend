const { initializeAccounts }        = require('./Account.seed');
const { initializeSubjects }        = require('./Subject.seed');
const { initializeRooms }           = require('./Room.seed');
const { initializeTeachers }        = require('./Teacher.seed');
const { initializeStudents }        = require('./Student.seed');
const { initializeCourses }         = require('./Course.seed');
const { initializeStudentCourses }  = require('./StudentCourse.seed');
const { initializeLessons }         = require('./Schedule.seed');

// 依赖顺序: 账户 → 科目/教室 → 老师/学生附加属性 → 课程 → 选课 → 排课
const INIT_ORDER = [
  'Accounts',
  'Subjects',
  'Rooms',
  'Teachers',
  'Students',
  'Courses',
  'StudentCourses',
  'Lessons'
];

const INIT_FUNCTIONS = {
  Accounts:       initializeAccounts,
  Subjects:       initializeSubjects,
  Rooms:          initializeRooms,
  Teachers:       initializeTeachers,
  Students:       initializeStudents,
  Courses:        initializeCourses,
  StudentCourses: initializeStudentCourses,
  Lessons:        initializeLessons
};

async function initializeAll(modules = INIT_ORDER) {
  for (const m of modules) {
    if (INIT_FUNCTIONS[m]) {
      console.info(`初始化${m}数据...`);
      await INIT_FUNCTIONS[m]();
      console.info(`${m}数据初始化完成`);
    } else {
      console.warn(`未找到模块 ${m} 的初始化函数`);
    }
  }
}

const initializeSpecific = async (moduleNames) => {
  if (!Array.isArray(moduleNames)) moduleNames = [moduleNames];
  return initializeAll(moduleNames);
};

module.exports = { initializeAll, initializeSpecific };
