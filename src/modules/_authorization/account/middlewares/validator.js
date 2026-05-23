const { validatorErrorHandle, commonBodyRules, commonParamRules, validatorOptions } = require('@utils/validatorHandle');
const { modelEnums } = require('@models/authorization/Account.model');

// exports.createVD = [
//   commonBodyRules.validateString('code', { minLength: 4, maxLength: 16 }),
//   commonBodyRules.validateString('password', { minLength: 8, maxLength: 16 }),
//   commonBodyRules.validateString('name', { minLength: 2, maxLength: 50 }),
//   commonBodyRules.validateString('identityNo', { minLength: 15, maxLength: 18 }),
//   commonBodyRules.optionalEnum('accountType', modelEnums.accountTypeEnums),
//   commonBodyRules.optionalString('phone', { minLength: 10, maxLength: 15 }),
//   commonBodyRules.optionalBoolean('isActive'),
//   commonBodyRules.optionalString('address', { minLength: 5, maxLength: 200 }),
//   commonBodyRules.optionalEnum('gender', modelEnums.genderEnums),
//   commonBodyRules.optionalObjectId('Nation'),
//   commonBodyRules.optionalObjectId('Province'), // 修正字段名
//   commonBodyRules.optionalObjectId('City'),
//   commonBodyRules.optionalObjectId('Area'),

//   validatorErrorHandle
// ];

exports.updateVD = [
  // 路径参数：必填 ObjectId
  commonParamRules.validateObjectId('id'),
  // Body 参数：可选规则
  commonBodyRules.optionalString('password', { minLength: 8, maxLength: 16 }),
  commonBodyRules.optionalBoolean('isActive'),
  commonBodyRules.optionalNumber('sort'),
  commonBodyRules.optionalString('name', { minLength: 2, maxLength: 50 }),
  commonBodyRules.optionalString('phone', { minLength: 10, maxLength: 15 }),
  commonBodyRules.optionalString('address', { minLength: 5, maxLength: 200 }),
  commonBodyRules.optionalString('identityNo', { minLength: 15, maxLength: 18 }),
  commonBodyRules.optionalEnum('gender', modelEnums.genderEnums),
  commonBodyRules.optionalObjectId('Nation'),
  commonBodyRules.optionalObjectId('Province'), // 修正字段名
  commonBodyRules.optionalObjectId('City'),
  commonBodyRules.optionalObjectId('Area'),

  validatorErrorHandle
];


exports.selfUpdateVD = [
  // Body 参数：可选规则
  commonBodyRules.optionalString('password', { minLength: 8, maxLength: 16 }),
  commonBodyRules.optionalString('nickname', { minLength: 2, maxLength: 50 }), // 允许用户修改昵称
  validatorErrorHandle
];

exports.listVD = [
  commonBodyRules.optionalString('regExp', { minLength: 0, maxLength: 50 }),
  commonBodyRules.optionalBoolean('isActive'),
  commonBodyRules.optionalBoolean('isAdmin'),
  commonBodyRules.optionalEnum('gender', modelEnums.genderEnums),
  commonBodyRules.optionalEnum('accountType', modelEnums.accountTypeEnums),
  commonBodyRules.optionalObjectId('Nation'),
  commonBodyRules.optionalObjectId('Province'), // 修正字段名
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