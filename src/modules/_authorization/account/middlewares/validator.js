const { validatorErrorHandle, commonBodyRules, commonParamRules, listOptionsValidator, detailOptionsValidator } = require('@utils/validatorHandle');
const { AccountEnums } = require('@models/authorization/Account.dao');

exports.editVD = [
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
  commonBodyRules.optionalEnum('gender', AccountEnums.genderEnums),
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
  commonBodyRules.optionalObject('filter'),
  commonBodyRules.optionalBoolean('filter.isActive'),
  commonBodyRules.optionalBoolean('filter.isAdmin'),
  commonBodyRules.optionalEnum('filter.gender', AccountEnums.genderEnums),
  commonBodyRules.optionalEnum('filter.accountType', AccountEnums.accountTypeEnums),
  commonBodyRules.optionalObjectId('filter.Nation'),
  commonBodyRules.optionalObjectId('filter.Province'),
  commonBodyRules.optionalObjectId('filter.City'),
  commonBodyRules.optionalObjectId('filter.Area'),

  ...listOptionsValidator, // options = { limit=100, skip=0, sort={}, populate=[{path: ''}] }
  validatorErrorHandle
];

// 4. 查询单条标签（仅 Param 参数）
exports.detailVD = [
  commonParamRules.validateObjectId('id'),

  ...detailOptionsValidator, // options = { populate: [{ path: '' }] }
  validatorErrorHandle
];

exports.selfVD = [
  ...detailOptionsValidator, // options = { populate: [{ path: '' }] }
  validatorErrorHandle
];