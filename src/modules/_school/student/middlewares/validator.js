const { validatorErrorHandle, commonBodyRules, commonParamRules, listOptionsValidator } = require('@utils/validatorHandle');
const { AccountEnums } = require('@models/authorization/Account.dao');
// 注意：这里我们不需要User.model，因为学生模块有自己的验证规则

exports.addVD = [

  commonBodyRules.validateObject('student'),
  // Body 参数：可选规则
  commonBodyRules.validateString('student.name', { minLength: 2, maxLength: 50 }),
  commonBodyRules.optionalDate('student.birthday'),
  commonBodyRules.optionalBoolean('student.isActive'),
  commonBodyRules.optionalString('student.phone', { minLength: 10, maxLength: 15 }),
  commonBodyRules.optionalString('student.identity', { minLength: 15, maxLength: 18 }),
  commonBodyRules.optionalString('student.address', { minLength: 5, maxLength: 200 }),
  commonBodyRules.optionalString('student.currentAddress', { minLength: 5, maxLength: 200 }),
  commonBodyRules.optionalString('student.school', { minLength: 2, maxLength: 100 }),
  commonBodyRules.optionalEnum('student.sourceType', ['地推', '传单', '活动', '介绍', '听说', '路过', '抖音', '朋友圈', '其他']),
  commonBodyRules.optionalString('student.description', { maxLength: 500 }),

  commonBodyRules.optionalObjectId('student.Org'),
  commonBodyRules.optionalObjectId('student.Account'),

  commonBodyRules.optionalObject('account'),
  commonBodyRules.subObjValString('account.code', { minLength: 4, maxLength: 16 }),
  commonBodyRules.subObjValString('account.password', { minLength: 8, maxLength: 16 }),
  commonBodyRules.subObjValString('account.name', { minLength: 2, maxLength: 50 }),
  commonBodyRules.optionalEnum('account.gender', AccountEnums.genderEnums),
  commonBodyRules.optionalString('account.phone', { minLength: 10, maxLength: 15 }),
  commonBodyRules.optionalString('account.address', { minLength: 5, maxLength: 200 }),
  commonBodyRules.optionalString('account.identityNo', { minLength: 15, maxLength: 18 }),

  validatorErrorHandle
];

exports.editVD = [
  // 路径参数：必填 ObjectId
  commonParamRules.validateObjectId('id'),
  // Body 参数：可选规则
  commonBodyRules.optionalBoolean('isActive'),
  commonBodyRules.optionalString('phone', { minLength: 10, maxLength: 15 }),
  commonBodyRules.optionalString('identity', { minLength: 15, maxLength: 18 }),
  commonBodyRules.optionalString('name', { minLength: 2, maxLength: 50 }),
  commonBodyRules.optionalDate('birthday'),
  commonBodyRules.optionalEnum('gender', ['Male', 'Female']),
  commonBodyRules.optionalString('address', { minLength: 5, maxLength: 200 }),
  commonBodyRules.optionalString('currentAddress', { minLength: 5, maxLength: 200 }),
  commonBodyRules.optionalString('school', { minLength: 2, maxLength: 100 }),
  commonBodyRules.optionalEnum('sourceType', ['地推', '传单', '活动', '介绍', '听说', '路过', '抖音', '朋友圈', '其他']),
  commonBodyRules.optionalString('description', { maxLength: 500 }),
  commonBodyRules.optionalObjectId('Nation'),
  commonBodyRules.optionalObjectId('Province'),
  commonBodyRules.optionalObjectId('City'),
  commonBodyRules.optionalObjectId('Area'),

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
  validatorErrorHandle
];

exports.selfUpdateVD = [
  // Body 参数：可选规则
  commonBodyRules.optionalString('displayName', { minLength: 2, maxLength: 26 }),

  validatorErrorHandle
];