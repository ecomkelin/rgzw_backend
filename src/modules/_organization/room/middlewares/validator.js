const { validatorErrorHandle, commonBodyRules, commonParamRules, listOptionsValidator, detailOptionsValidator } = require('@utils/validatorHandle');
const { body } = require('express-validator');
const { RoomEnums } = require('@models/organization/physical/Room.dao');
const { validateTimeBlock } = require('@utils/timeBlock');

exports.addVD = [
  commonBodyRules.validateString('name', { minLength: 2, maxLength: 100 }),
  commonBodyRules.validateNumber('capacity', { min: 0 }),
  commonBodyRules.optionalString('location', { minLength: 2, maxLength: 100 }),
  commonBodyRules.optionalString('description', { minLength: 2, maxLength: 100 }),
  commonBodyRules.validateEnum('status', RoomEnums.statusEnums),
  commonBodyRules.validateBoolean('isActive'),
  commonBodyRules.optionalNumber('sort'),

  // 排课: 闭馆时段
  commonBodyRules.optionalArray('closedSlots'),
  commonBodyRules.optionalNumber('closedSlots.*.dayOfWeek', { min: 0, max: 6 }),
  commonBodyRules.optionalString('closedSlots.*.date'),
  commonBodyRules.optionalString('closedSlots.*.dateRange.from'),
  commonBodyRules.optionalString('closedSlots.*.dateRange.to'),
  commonBodyRules.optionalString('closedSlots.*.startTime'),
  commonBodyRules.optionalString('closedSlots.*.endTime'),
  commonBodyRules.optionalString('closedSlots.*.reason', { minLength: 0, maxLength: 200 }),
  body('closedSlots.*').custom((value) => {
    if (value && Object.keys(value).length > 0 && !validateTimeBlock(value)) {
      throw new Error('closedSlots 单条不合法, 需给出 dayOfWeek/date/dateRange 其一, 且 startTime<endTime');
    }
    return true;
  }),

  commonBodyRules.optionalObjectId('Org'),

  validatorErrorHandle
];

exports.editVD = [
  // 路径参数：必填 ObjectId
  commonParamRules.validateObjectId('id'),
  // Body 参数：可选规则
  commonBodyRules.optionalString('name', { minLength: 2, maxLength: 100 }),
  commonBodyRules.optionalNumber('capacity', { min: 0 }),
  commonBodyRules.optionalString('location', { minLength: 2, maxLength: 100 }),
  commonBodyRules.optionalString('description', { minLength: 2, maxLength: 100 }),
  commonBodyRules.optionalEnum('status', RoomEnums.statusEnums),
  commonBodyRules.optionalBoolean('isActive'),
  commonBodyRules.optionalNumber('sort'),

  // 排课: 闭馆时段
  commonBodyRules.optionalArray('closedSlots'),
  commonBodyRules.optionalNumber('closedSlots.*.dayOfWeek', { min: 0, max: 6 }),
  commonBodyRules.optionalString('closedSlots.*.date'),
  commonBodyRules.optionalString('closedSlots.*.dateRange.from'),
  commonBodyRules.optionalString('closedSlots.*.dateRange.to'),
  commonBodyRules.optionalString('closedSlots.*.startTime'),
  commonBodyRules.optionalString('closedSlots.*.endTime'),
  commonBodyRules.optionalString('closedSlots.*.reason', { minLength: 0, maxLength: 200 }),
  body('closedSlots.*').custom((value) => {
    if (value && Object.keys(value).length > 0 && !validateTimeBlock(value)) {
      throw new Error('closedSlots 单条不合法, 需给出 dayOfWeek/date/dateRange 其一, 且 startTime<endTime');
    }
    return true;
  }),

  validatorErrorHandle
];


exports.listVD = [
  commonBodyRules.optionalObject('filter'),
  commonBodyRules.optionalString('filter.regExp', { minLength: 0, maxLength: 50 }), // 搜索关键词，模糊匹配 name 字段
  commonBodyRules.optionalBoolean('filter.isActive'),
  commonBodyRules.optionalObjectId('filter.Org'),
  commonBodyRules.optionalEnum('filter.status', RoomEnums.statusEnums),


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