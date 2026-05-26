const { validatorErrorHandle, commonBodyRules, commonParamRules, listOptionsValidator, detailOptionsValidator } = require('@utils/validatorHandle');
const { AccountEnums } = require('@models/authorization/Account.dao');
const { UserEnums } = require('@models/organization/structure/User.dao');

exports.addVD = [
  // Body 参数：可选规则
  commonBodyRules.validateObject('user'),
  commonBodyRules.optionalBoolean('user.isActive'),
  commonBodyRules.optionalNumber('user.sort'),
  commonBodyRules.optionalString('user.avatar', { minLength: 4, maxLength: 50 }),
  commonBodyRules.validateEnum('user.roleTemp', UserEnums.roleSimpEnums),
  commonBodyRules.validateString('user.nickname', { minLength: 2, maxLength: 26 }),

  commonBodyRules.optionalObjectId('user.Org'),
  commonBodyRules.optionalObjectId('user.Account'),

  commonBodyRules.optionalObject('account'),
  commonBodyRules.subObjValString('account.code', { minLength: 4, maxLength: 16 }),
  commonBodyRules.subObjValString('account.password', { minLength: 8, maxLength: 16 }),
  commonBodyRules.subObjValString('account.name', { minLength: 2, maxLength: 50 }),
  commonBodyRules.subObjValString('account.identityNo', { minLength: 15, maxLength: 18 }),
  commonBodyRules.optionalEnum('account.gender', AccountEnums.genderEnums),
  commonBodyRules.optionalString('account.phone', { minLength: 10, maxLength: 15 }),
  commonBodyRules.optionalString('account.address', { minLength: 5, maxLength: 200 }),
  commonBodyRules.optionalObjectId('account.Nation'),
  commonBodyRules.optionalObjectId('account.Province'), // 修正字段名
  commonBodyRules.optionalObjectId('account.City'),
  commonBodyRules.optionalObjectId('account.Area'),

  validatorErrorHandle
];

exports.editVD = [
  // 路径参数：必填 ObjectId
  commonParamRules.validateObjectId('id'),
  // Body 参数：可选规则
  commonBodyRules.optionalBoolean('isActive'),
  commonBodyRules.optionalNumber('sort'),
  commonBodyRules.optionalEnum('roleTemp', UserEnums.roleSimpEnums),
  commonBodyRules.optionalString('nickname', { minLength: 2, maxLength: 26 }),
  commonBodyRules.optionalString('avatar', { minLength: 4, maxLength: 50 }),

  validatorErrorHandle
];


exports.listVD = [
  commonBodyRules.optionalObject('filter'),
  commonBodyRules.optionalString('filter.regExp', { minLength: 0, maxLength: 50 }),
  commonBodyRules.optionalBoolean('filter.isActive'),
  commonBodyRules.optionalObjectId('filter.Org'),
  commonBodyRules.optionalObjectId('filter.Account'),

  ...listOptionsValidator, // 分页, 排序
  validatorErrorHandle
];

// 4. 查询单条标签（仅 Param 参数）
exports.detailVD = [
  commonParamRules.validateObjectId('id'),

  ...detailOptionsValidator, // 分页, 排序
  validatorErrorHandle
];

exports.selfEditVD = [
  // Body 参数：可选规则
  commonBodyRules.optionalString('nickname', { minLength: 2, maxLength: 26 }),

  validatorErrorHandle
];