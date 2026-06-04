const { validatorErrorHandle, commonBodyRules, commonParamRules, listOptionsValidator, detailOptionsValidator } = require('@utils/validatorHandle');
const { PackEnums } = require('@/models/pack/Pack.dao');

exports.addVD = [
  commonBodyRules.validateString('name', { minLength: 2, maxLength: 100 }),
  commonBodyRules.validateEnum('type', PackEnums.typeEnums),
  commonBodyRules.optionalString('description', { minLength: 2, maxLength: 100 }),
  commonBodyRules.validateNumber('totalLesson', { min: 0 }),
  commonBodyRules.validateNumber('priceOrigin', { min: 0 }),
  commonBodyRules.validateNumber('priceRegular', { min: 0 }),
  commonBodyRules.validateNumber('priceSale', { min: 0 }),
  commonBodyRules.validateString('applicableSubjects', { minLength: 2, maxLength: 100 }),
  commonBodyRules.validateString('applicableLevels', { minLength: 2, maxLength: 100 }),
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
  commonBodyRules.optionalEnum('type', PackEnums.typeEnums),
  commonBodyRules.optionalString('description', { minLength: 2, maxLength: 100 }),
  commonBodyRules.optionalNumber('totalLesson', { min: 0 }),
  commonBodyRules.optionalNumber('priceOrigin', { min: 0 }),
  commonBodyRules.optionalNumber('priceRegular', { min: 0 }),
  commonBodyRules.optionalNumber('priceSale', { min: 0 }),
  commonBodyRules.optionalString('applicableSubjects', { minLength: 2, maxLength: 100 }),
  commonBodyRules.optionalString('applicableLevels', { minLength: 2, maxLength: 100 }),
  commonBodyRules.optionalBoolean('isActive'),
  commonBodyRules.optionalNumber('sort'),

  validatorErrorHandle
];


exports.listVD = [
  commonBodyRules.optionalObject('filter'),
  commonBodyRules.optionalString('filter.regExp', { minLength: 0, maxLength: 50 }), // 搜索关键词，模糊匹配 name 字段
  commonBodyRules.optionalBoolean('filter.isActive'),
  commonBodyRules.optionalObjectId('filter.Org'),
  commonBodyRules.optionalEnum('filter.type', PackEnums.typeEnums),


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