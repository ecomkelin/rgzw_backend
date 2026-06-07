const { validatorErrorHandle, commonBodyRules, commonParamRules, listOptionsValidator, detailOptionsValidator } = require('@utils/validatorHandle');
const { body } = require('express-validator');
const { AccountEnums } = require('@models/authorization/Account.dao');
const { validateTimeBlock } = require('@utils/timeBlock');
// 注意：这里我们不需要User.model，因为学生模块有自己的验证规则

exports.addVD = [

  commonBodyRules.validateObject('student'),
  // Body 参数：可选规则
  commonBodyRules.validateString('student.name', { minLength: 2, maxLength: 50 }),
  commonBodyRules.optionalDate('student.birthday'),
  commonBodyRules.optionalBoolean('student.isActive'),
  commonBodyRules.optionalString('student.phone', { minLength: 10, maxLength: 15 }),
  commonBodyRules.optionalString('student.identityNo', { minLength: 15, maxLength: 18 }),
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
  commonBodyRules.optionalString('name', { minLength: 2, maxLength: 50 }),
  commonBodyRules.optionalDate('birthday'),
  commonBodyRules.optionalBoolean('isActive'),
  commonBodyRules.optionalString('phone', { minLength: 10, maxLength: 15 }),
  commonBodyRules.optionalString('identityNo', { minLength: 15, maxLength: 18 }),
  commonBodyRules.optionalString('address', { minLength: 5, maxLength: 200 }),
  commonBodyRules.optionalString('currentAddress', { minLength: 5, maxLength: 200 }),
  commonBodyRules.optionalString('school', { minLength: 2, maxLength: 100 }),
  commonBodyRules.optionalEnum('sourceType', ['地推', '传单', '活动', '介绍', '听说', '路过', '抖音', '朋友圈', '其他']),
  commonBodyRules.optionalString('description', { maxLength: 500 }),

  // 排课: 不可用时段
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

  ...detailOptionsValidator,
  validatorErrorHandle
];

exports.selfDetailVD = [
  detailOptionsValidator,
  validatorErrorHandle
];

exports.selfEditVD = [
  // Body 参数：可选规则
  commonBodyRules.optionalString('displayName', { minLength: 2, maxLength: 26 }),

  validatorErrorHandle
];