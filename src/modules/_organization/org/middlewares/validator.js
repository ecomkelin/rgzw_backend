const { validatorErrorHandle, commonBodyRules, commonParamRules, validatorOptions } = require('../../../../utils/validatorHandle');

exports.createVD = [
  // Body 参数：可选规则
  commonBodyRules.optionalBoolean('isActive'),
  commonBodyRules.optionalNumber('sort'),
  commonBodyRules.validateString('unionCode', { minLength: 2, maxLength: 26 }),
  commonBodyRules.validateString('name', { minLength: 2, maxLength: 26 }),
  commonBodyRules.validateString('nickname', { minLength: 2, maxLength: 26 }),
  commonBodyRules.optionalString('phone', { minLength: 10, maxLength: 15 }),
  commonBodyRules.optionalString('email', { minLength: 10, maxLength: 15 }),
  commonBodyRules.optionalString('website', { minLength: 10, maxLength: 15 }),
  commonBodyRules.optionalString('address', { minLength: 5, maxLength: 25 }),
  commonBodyRules.optionalObjectId('Nation'),
  commonBodyRules.optionalObjectId('Provence'),
  commonBodyRules.optionalObjectId('City'),
  commonBodyRules.optionalObjectId('Area'),

  validatorErrorHandle
];

exports.updateVD = [
  // 路径参数：必填 ObjectId
  commonParamRules.validateObjectId('id'),
  // Body 参数：可选规则
  commonBodyRules.optionalBoolean('isActive'),
  commonBodyRules.optionalNumber('sort'),
  commonBodyRules.optionalString('unionCode', { minLength: 2, maxLength: 26 }),
  commonBodyRules.optionalString('name', { minLength: 2, maxLength: 26 }),
  commonBodyRules.optionalString('nickname', { minLength: 2, maxLength: 26 }),
  commonBodyRules.optionalString('phone', { minLength: 10, maxLength: 15 }),
  commonBodyRules.optionalString('email', { minLength: 10, maxLength: 15 }),
  commonBodyRules.optionalString('website', { minLength: 10, maxLength: 15 }),
  commonBodyRules.optionalString('address', { minLength: 5, maxLength: 25 }),
  commonBodyRules.optionalObjectId('Nation'),
  commonBodyRules.optionalObjectId('Provence'),
  commonBodyRules.optionalObjectId('City'),
  commonBodyRules.optionalObjectId('Area'),

  validatorErrorHandle
];


exports.listVD = [
  commonBodyRules.optionalString('regExp', { minLength: 0, maxLength: 6 }),
  commonBodyRules.optionalBoolean('isActive'),
  commonBodyRules.optionalObjectId('Nation'),
  commonBodyRules.optionalObjectId('Provence'),
  commonBodyRules.optionalObjectId('City'),
  commonBodyRules.optionalObjectId('Area'),

  ...validatorOptions, // 分页, 排序
  validatorErrorHandle
];

// 4. 查询单条标签（仅 Param 参数）
exports.detailVD = [
  commonParamRules.validateObjectId('id'),
  validatorErrorHandle
];