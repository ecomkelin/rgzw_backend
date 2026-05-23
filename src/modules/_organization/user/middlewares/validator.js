const { validatorErrorHandle, commonBodyRules, commonParamRules, validatorOptions } = require('@utils/validatorHandle');
const { modelEnums: accountModelEnums } = require('@models/authorization/Account.model');
const { modelEnums: userModelEnums } = require('@models/organization/structure/User.model');

exports.createVD = [
  // Body 参数：可选规则
  commonBodyRules.optionalBoolean('user.isDefault'),
  commonBodyRules.optionalBoolean('user.isActive'),
  commonBodyRules.optionalNumber('user.sort'),
  commonBodyRules.optionalString('user.avatar', { minLength: 4, maxLength: 50 }),
  commonBodyRules.validateEnum('user.roleSimp', userModelEnums.roleSimpEnums),
  commonBodyRules.validateString('user.nickname', { minLength: 2, maxLength: 26 }),

  commonBodyRules.validateObjectId('user.Org'),
  commonBodyRules.optionalObjectId('user.Account'),

  commonBodyRules.optionalString('account.code', { minLength: 4, maxLength: 16 }),
  commonBodyRules.optionalString('account.password', { minLength: 8, maxLength: 16 }),
  commonBodyRules.optionalBoolean('account.isAdmin'),
  commonBodyRules.optionalString('account.name', { minLength: 2, maxLength: 6 }),
  commonBodyRules.optionalString('account.phone', { minLength: 10, maxLength: 15 }),
  commonBodyRules.optionalString('account.address', { minLength: 5, maxLength: 25 }),
  commonBodyRules.optionalString('account.identityNo', { minLength: 2, maxLength: 20 }),
  commonBodyRules.optionalEnum('account.gender', accountModelEnums.genderEnums),
  commonBodyRules.optionalObjectId('account.Nation'),
  commonBodyRules.optionalObjectId('account.Provence'),
  commonBodyRules.optionalObjectId('account.City'),
  commonBodyRules.optionalObjectId('account.Area'),



  validatorErrorHandle
];

exports.updateVD = [
  // 路径参数：必填 ObjectId
  commonParamRules.validateObjectId('id'),
  // Body 参数：可选规则
  commonBodyRules.optionalBoolean('isDefault'),
  commonBodyRules.optionalBoolean('isActive'),
  commonBodyRules.optionalNumber('sort'),
  commonBodyRules.optionalEnum('roleSimp', userModelEnums.roleSimpEnums),
  commonBodyRules.optionalString('nickname', { minLength: 2, maxLength: 26 }),
  commonBodyRules.optionalString('avatar', { minLength: 4, maxLength: 50 }),

  validatorErrorHandle
];


exports.listVD = [
  commonBodyRules.optionalString('regExp', { minLength: 0, maxLength: 6 }),
  commonBodyRules.optionalBoolean('isActive'),
  commonBodyRules.optionalObjectId('Org'),
  commonBodyRules.optionalObjectId('Account'),

  ...validatorOptions, // 分页, 排序
  validatorErrorHandle
];

// 4. 查询单条标签（仅 Param 参数）
exports.detailVD = [
  commonParamRules.validateObjectId('id'),
  validatorErrorHandle
];

exports.selfUpdateVD = [
  // Body 参数：可选规则
  commonBodyRules.optionalString('nickname', { minLength: 2, maxLength: 26 }),

  validatorErrorHandle
];