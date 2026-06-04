const { validatorErrorHandle, commonBodyRules, commonParamRules, listOptionsValidator, detailOptionsValidator } = require('@utils/validatorHandle');
const { CourseEnums } = require('@/models/school/course/Course.dao');

exports.addVD = [
  commonBodyRules.validateObjectId('Subject'),
  commonBodyRules.validateString('name', { minLength: 2, maxLength: 100 }),
  commonBodyRules.validateObjectId('mainTeacher'),
  commonBodyRules.optionalObjectId('assistantTeacher'),
  commonBodyRules.optionalDate('startDate'),
  commonBodyRules.optionalDate('endDate'),
  commonBodyRules.validateNumber('totalSessions', { min: 0 }),
  commonBodyRules.validateEnum('frequency', CourseEnums.frequencyEnums),
  commonBodyRules.optionalArray('scheduleRules'),
  commonBodyRules.validateNumber('scheduleRules.*.dayOfWeek', '', { min: 0, max: 6 }),
  commonBodyRules.validateString('scheduleRules.*.startTime'),
  commonBodyRules.validateString('scheduleRules.*.endTime'),
  commonBodyRules.validateObjectId('defaultRoom'),
  commonBodyRules.validateNumber('maxStudents', { min: 0 }),
  commonBodyRules.validateNumber('price', { min: 0 }),
  commonBodyRules.validateEnum('status', CourseEnums.statusEnums),
  commonBodyRules.optionalDate('publishDate'),
  commonBodyRules.optionalString('features', { minLength: 0, maxLength: 500 }),
  commonBodyRules.optionalString('description', { minLength: 0, maxLength: 2000 }),
  commonBodyRules.optionalString('posterUrl', { minLength: 0, maxLength: 500 }),
  commonBodyRules.optionalString('videoUrl', { minLength: 0, maxLength: 500 }),
  commonBodyRules.optionalString('highlightVideoUrl', { minLength: 0, maxLength: 500 }),
  commonBodyRules.validateBoolean('isActive'),
  commonBodyRules.optionalNumber('sort'),

  commonBodyRules.optionalObjectId('Org'),

  validatorErrorHandle
];

exports.editVD = [
  // 路径参数：必填 ObjectId
  commonParamRules.validateObjectId('id'),
  // Body 参数：可选规则
  commonBodyRules.optionalObjectId('mainTeacher'),
  commonBodyRules.optionalObjectId('assistantTeacher'),
  commonBodyRules.optionalDate('startDate'),
  commonBodyRules.optionalDate('endDate'),
  commonBodyRules.optionalEnum('frequency', CourseEnums.frequencyEnums),
  commonBodyRules.optionalArray('scheduleRules'),
  commonBodyRules.optionalNumber('scheduleRules.*.dayOfWeek'),
  commonBodyRules.optionalString('scheduleRules.*.startTime'),
  commonBodyRules.optionalString('scheduleRules.*.endTime'),
  commonBodyRules.optionalObjectId('defaultRoom'),
  commonBodyRules.optionalNumber('maxStudents', { min: 0 }),
  commonBodyRules.optionalEnum('status', CourseEnums.statusEnums),
  commonBodyRules.optionalDate('publishDate'),
  commonBodyRules.optionalString('features', { minLength: 0, maxLength: 500 }),
  commonBodyRules.optionalString('description', { minLength: 0, maxLength: 2000 }),
  commonBodyRules.optionalString('posterUrl', { minLength: 0, maxLength: 500 }),
  commonBodyRules.optionalString('videoUrl', { minLength: 0, maxLength: 500 }),
  commonBodyRules.optionalString('highlightVideoUrl', { minLength: 0, maxLength: 500 }),
  commonBodyRules.optionalBoolean('isActive'),
  commonBodyRules.optionalNumber('sort'),

  validatorErrorHandle
];


exports.listVD = [
  commonBodyRules.optionalObject('filter'),
  commonBodyRules.optionalString('filter.regExp', { minLength: 0, maxLength: 50 }), // 搜索关键词，模糊匹配 name 字段
  commonBodyRules.optionalBoolean('filter.isActive'),
  commonBodyRules.optionalEnum('filter.status', CourseEnums.statusEnums), // 课程状态
  commonBodyRules.optionalObjectId('filter.Org'),
  commonBodyRules.optionalEnum('filter.frequency', CourseEnums.frequencyEnums),


  ...listOptionsValidator, // 分页, 排序
  validatorErrorHandle
];

// 4. 查询单条标签（仅 Param 参数）
exports.detailVD = [
  commonParamRules.validateObjectId('id'),

  ...detailOptionsValidator, // 分页, 排序
  validatorErrorHandle
];

// exports.removeVD = [
//   commonParamRules.validateObjectId('id'),
//   validatorErrorHandle
// ];