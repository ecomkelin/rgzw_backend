const { validatorErrorHandle, commonBodyRules, commonParamRules, listOptionsValidator, detailOptionsValidator } = require('@utils/validatorHandle');
const { SubjectEnums } = require('@/models/school/course/Subject.dao');

exports.addVD = [
  commonBodyRules.validateEnum('category', SubjectEnums.categoryEnums),
  commonBodyRules.validateString('name', { minLength: 2, maxLength: 100 }),
  commonBodyRules.validateNumber('price', { min: 0 }),
  commonBodyRules.validateNumber('duration_minutes', { min: 0 }),
  commonBodyRules.validateNumber('default_lesson_count', { min: 0 }),
  commonBodyRules.optionalArray('syllabus'),
  commonBodyRules.validateString('syllabus.*.title', { minLength: 1, maxLength: 100 }),
  commonBodyRules.validateString('syllabus.*.description', { minLength: 1, maxLength: 500 }),
  commonBodyRules.validateBoolean('isActive'),
  commonBodyRules.validateBoolean('isShow'),
  commonBodyRules.optionalNumber('sort'),

  commonBodyRules.optionalObjectId('Org'),

  validatorErrorHandle
];

exports.editVD = [
  // 路径参数：必填 ObjectId
  commonParamRules.validateObjectId('id'),
  // Body 参数：可选规则
  commonBodyRules.optionalEnum('category', SubjectEnums.categoryEnums),
  commonBodyRules.optionalString('name', { minLength: 2, maxLength: 100 }),
  commonBodyRules.optionalNumber('price', { min: 0 }),
  commonBodyRules.optionalNumber('duration_minutes', { min: 0 }),
  commonBodyRules.optionalNumber('default_lesson_count', { min: 0 }),
  commonBodyRules.optionalArray('syllabus'),
  commonBodyRules.optionalString('syllabus.*.title', { minLength: 1, maxLength: 100 }),
  commonBodyRules.optionalString('syllabus.*.description', { minLength: 1, maxLength: 500 }),
  commonBodyRules.optionalBoolean('isActive'),
  commonBodyRules.optionalBoolean('isShow'),
  commonBodyRules.optionalNumber('sort'),

  validatorErrorHandle
];


exports.listVD = [
  commonBodyRules.optionalObject('filter'),
  commonBodyRules.optionalString('filter.regExp', { minLength: 0, maxLength: 50 }), // 搜索关键词，模糊匹配 name 字段
  commonBodyRules.optionalBoolean('filter.isActive'),
  commonBodyRules.optionalBoolean('filter.isShow'),
  commonBodyRules.optionalObjectId('filter.Org'),
  commonBodyRules.optionalEnum('filter.category', SubjectEnums.categoryEnums),


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