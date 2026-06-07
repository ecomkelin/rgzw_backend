/**
 * 种子初始化总入口
 *
 * 依赖顺序 (上游不变量必须先就绪):
 *   Orgs -> Accounts -> Users/Students -> Subjects -> Rooms -> Packs
 *        -> Courses -> OrderPacks/StudentPacks -> StudentCourses
 *        -> Teachers (档案补丁) -> Students (档案补丁) -> Lessons (排课)
 */
const { initializeAccounts }        = require('./Account.seed');
const { initializeSubjects }        = require('./Subject.seed');
const { initializeRooms }           = require('./Room.seed');
const { initializeTeachers }        = require('./Teacher.seed');
const { initializeStudents }        = require('./Student.seed');
const { initializeCourses }         = require('./Course.seed');
const { initializePacks }           = require('./Pack.seed');
const { initializeOrderPacks }      = require('./OrderPack.seed');
const { initializeStudentCourses }  = require('./StudentCourse.seed');
const { initializeLessons }         = require('./Schedule.seed');

const INIT_ORDER = [
  'Accounts',        // Org / Account / User / Student
  'Subjects',
  'Rooms',
  'Teachers',        // 老师档案补丁 (依赖 Users)
  'Students',        // 学生档案补丁 (依赖 Students)
  'Courses',         // 课程 (依赖 Subjects/Rooms/Users)
  'Packs',           // 课包模板 (依赖 Org/Users)
  'OrderPacks',      // 课包订单 + StudentPack (依赖 Packs/Students/Courses)
  'StudentCourses',  // 学生报名 (依赖 Students/Courses/StudentPacks)
  'Lessons'          // 排课 (依赖 Courses)
];

const INIT_FUNCTIONS = {
  Accounts:       initializeAccounts,
  Subjects:       initializeSubjects,
  Rooms:          initializeRooms,
  Teachers:       initializeTeachers,
  Students:       initializeStudents,
  Courses:        initializeCourses,
  Packs:          initializePacks,
  OrderPacks:     initializeOrderPacks,
  StudentCourses: initializeStudentCourses,
  Lessons:        initializeLessons
};

async function initializeAll(modules = INIT_ORDER) {
  for (const m of modules) {
    if (INIT_FUNCTIONS[m]) {
      console.info(`\n========== 初始化 ${m} ==========`);
      await INIT_FUNCTIONS[m]();
      console.info(`✓ ${m} 初始化完成`);
    } else {
      console.warn(`未找到模块 ${m} 的初始化函数`);
    }
  }
}

const initializeSpecific = async (moduleNames) => {
  if (!Array.isArray(moduleNames)) moduleNames = [moduleNames];
  return initializeAll(moduleNames);
};

module.exports = { initializeAll, initializeSpecific, INIT_ORDER };
