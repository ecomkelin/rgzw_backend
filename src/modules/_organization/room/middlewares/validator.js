const { validatorErrorHandle, commonBodyRules, commonParamRules, listOptionsValidator, detailOptionsValidator } = require('@utils/validatorHandle');
const { RoomEnums } = require('@models/organization/physical/Room.model');

exports.addVD = [
  commonBodyRules.validateString('name', { minLength: 2, maxLength: 100 }),
  commonBodyRules.validateNumber('capacity', { min: 0 }),
  commonBodyRules.optionalString('location', { minLength: 2, maxLength: 100 }),
  commonBodyRules.optionalString('description', { minLength: 2, maxLength: 100 }),
  commonBodyRules.validateEnum('status', RoomEnums.statusEnums),
  commonBodyRules.validateBoolean('isActive'),
  commonBodyRules.optionalNumber('sort'),

  commonBodyRules.optionalObjectId('Org'),

  validatorErrorHandle
];

exports.editVD = [
  // 路径参数：必填 ObjectId
  commonParamRules.validateObjectId('id'),
  // Body 参数：可选规则
  commonBodyRules.optionalString('name', { minLength: 2, maxLength: 100 }),
  commonBodyRules.optionalNumber('capacity', { min: 0 }),
  commonBodyRules.optionalString('location', { minLength: 2, maxLength: 100 }),
  commonBodyRules.optionalString('description', { minLength: 2, maxLength: 100 }),
  commonBodyRules.optionalEnum('status', RoomEnums.statusEnums),
  commonBodyRules.optionalBoolean('isActive'),
  commonBodyRules.optionalNumber('sort'),

  validatorErrorHandle
];


exports.listVD = [
  commonBodyRules.optionalObject('filter'),
  commonBodyRules.optionalString('filter.regExp', { minLength: 0, maxLength: 50 }), // 搜索关键词，模糊匹配 name 字段
  commonBodyRules.optionalBoolean('filter.isActive'),
  commonBodyRules.optionalObjectId('filter.Org'),
  commonBodyRules.optionalEnum('filter.status', RoomEnums.statusEnums),


  ...listOptionsValidator, // 分页, 排序
  validatorErrorHandle
];

// 4. 查询单条标签（仅 Param 参数）
exports.detailVD = [
  commonParamRules.validateObjectId('id'),

  ...detailOptionsValidator, // 分页, 排序
  validatorErrorHandle
];

exports.removeVD = [
  commonParamRules.validateObjectId('id'),
  validatorErrorHandle
];