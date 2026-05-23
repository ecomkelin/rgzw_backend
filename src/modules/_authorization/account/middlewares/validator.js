const { validatorErrorHandle, commonBodyRules, commonParamRules, validatorOptions } = require('@utils/validatorHandle');
const { modelEnums } = require('@models/authorization/Account.model');

exports.createVD = [
  commonBodyRules.validateString('code', { minLength: 4, maxLength: 16 }),
  commonBodyRules.validateString('password', { minLength: 8, maxLength: 16 }),
  commonBodyRules.validateString('name', { minLength: 2, maxLength: 6 }),
  commonBodyRules.validateString('phone', { minLength: 10, maxLength: 15 }),
  commonBodyRules.optionalString('identityNo', { minLength: 2, maxLength: 20 }),
  commonBodyRules.optionalBoolean('isAdmin'),
  commonBodyRules.optionalString('address', { minLength: 5, maxLength: 25 }),
  commonBodyRules.optionalEnum('gender', modelEnums.genderEnums),
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
  commonBodyRules.optionalString('password', { minLength: 8, maxLength: 16 }),
  commonBodyRules.optionalBoolean('isActive'),
  commonBodyRules.optionalBoolean('isAdmin'),
  commonBodyRules.optionalNumber('sort'),
  commonBodyRules.optionalString('name', { minLength: 2, maxLength: 6 }),
  commonBodyRules.optionalString('phone', { minLength: 10, maxLength: 15 }),
  commonBodyRules.optionalString('address', { minLength: 5, maxLength: 25 }),
  commonBodyRules.optionalString('identityNo', { minLength: 2, maxLength: 20 }),
  commonBodyRules.optionalEnum('gender', modelEnums.genderEnums),
  commonBodyRules.optionalObjectId('Nation'),
  commonBodyRules.optionalObjectId('Provence'),
  commonBodyRules.optionalObjectId('City'),
  commonBodyRules.optionalObjectId('Area'),

  validatorErrorHandle
];


exports.selfUpdateVD = [
  // Body 参数：可选规则
  commonBodyRules.optionalString('password', { minLength: 8, maxLength: 16 }),
  validatorErrorHandle
];

exports.listVD = [
  commonBodyRules.optionalString('regExp', { minLength: 0, maxLength: 6 }),
  commonBodyRules.optionalBoolean('isActive'),
  commonBodyRules.optionalBoolean('isAdmin'),
  commonBodyRules.optionalEnum('gender', modelEnums.genderEnums),
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