const { validatorErrorHandle, commonBodyRules, commonParamRules, listOptionsValidator, detailOptionsValidator } = require('@utils/validatorHandle');
const { body } = require('express-validator');
const { AccountEnums } = require('@models/authorization/Account.dao');
const { UserEnums } = require('@models/organization/structure/User.dao');
const { validateTimeBlock } = require('@utils/timeBlock');

exports.addVD = [
  // Body 参数：可选规则
  commonBodyRules.validateObject('user'),
  commonBodyRules.optionalBoolean('user.isActive'),
  commonBodyRules.validateEnum('user.roleTemp', UserEnums.roleSimpEnums),
  commonBodyRules.validateString('user.nickname', { minLength: 2, maxLength: 26 }),

  commonBodyRules.optionalObjectId('user.Org'),
  commonBodyRules.optionalObjectId('user.Account'),

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
  commonBodyRules.optionalString('nickname', { minLength: 2, maxLength: 26 }),
  commonBodyRules.optionalNumber('sort'),
  commonBodyRules.optionalEnum('roleTemp', UserEnums.roleSimpEnums),

  // 排课: 老师不可用时段
  commonBodyRules.optionalArray('unavailableSlots'),
  commonBodyRules.optionalNumber('unavailableSlots.*.dayOfWeek', { min: 0, max: 6 }),
  commonBodyRules.optionalString('unavailableSlots.*.date'),
  commonBodyRules.optionalString('unavailableSlots.*.dateRange.from'),
  commonBodyRules.optionalString('unavailableSlots.*.dateRange.to'),
  commonBodyRules.optionalString('unavailableSlots.*.startTime'),
  commonBodyRules.optionalString('unavailableSlots.*.endTime'),
  commonBodyRules.optionalString('unavailableSlots.*.reason', { minLength: 0, maxLength: 200 }),
  body('unavailableSlots.*').custom((value) => {
    if (value && Object.keys(value).length > 0 && !validateTimeBlock(value)) {
      throw new Error('unavailableSlots 单条不合法, 需给出 dayOfWeek/date/dateRange 其一, 且 startTime<endTime');
    }
    return true;
  }),

  validatorErrorHandle
];


exports.listVD = [
  commonBodyRules.optionalObject('filter'),
  commonBodyRules.optionalString('filter.regExp', { minLength: 0, maxLength: 50 }), // nickname模糊搜索
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

exports.selfDetailVD = [
  ...detailOptionsValidator, // 分页, 排序
  validatorErrorHandle
];

exports.selfEditVD = [
  // Body 参数：可选规则
  commonBodyRules.optionalString('nickname', { minLength: 2, maxLength: 26 }),
  commonBodyRules.optionalString('avatar', { minLength: 2, maxLength: 26 }),

  validatorErrorHandle
];