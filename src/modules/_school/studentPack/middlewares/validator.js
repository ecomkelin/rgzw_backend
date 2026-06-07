const {
  validatorErrorHandle,
  commonBodyRules,
  commonParamRules,
  listOptionsValidator,
  detailOptionsValidator,
} = require('@utils/validatorHandle');
const { body } = require('express-validator');
const { StudentPackEnums } = require('@/models/school/student/StudentPack.dao');

/**
 * add 校验 (手动 free 赠送)
 * - 必填: Student / totalLesson
 * - 可选: packName / description / activeDate / expireDate / remainingLesson
 * - 显式拒绝不可由前端设置的字段: Account / Org / OrderPack / Pack / resource
 */
exports.addVD = [
  commonBodyRules.validateObjectId('Student'),
  commonBodyRules.validateNumber('totalLesson', '', { min: 1, max: 99999999 }),

  // 可选字段
  commonBodyRules.optionalString('packName', { minLength: 0, maxLength: 50 }),
  commonBodyRules.optionalString('description', { minLength: 0, maxLength: 500 }),
  commonBodyRules.optionalDate('activeDate'),
  commonBodyRules.optionalDate('expireDate'),
  commonBodyRules.optionalNumber('remainingLesson', '', { min: 0, max: 99999999 }),
  commonBodyRules.optionalEnum('status', StudentPackEnums.statusEnums),

  validatorErrorHandle
];

/**
 * edit 校验
 * - 路径 id 必填且为 ObjectId
 * - 可改字段: status / expireDate / description / activeDate / remainingLesson
 * - DAO 会用 deleteImmutableFront 删除 immutableFront 字段, 这里再显式 reject Account/Org/Student 等
 */
exports.editVD = [
  commonParamRules.validateObjectId('id'),

  commonBodyRules.optionalEnum('status', StudentPackEnums.statusEnums),
  commonBodyRules.optionalDate('activeDate'),
  commonBodyRules.optionalDate('expireDate'),
  commonBodyRules.optionalString('description', { minLength: 0, maxLength: 500 }),
  commonBodyRules.optionalNumber('remainingLesson', '', { min: 0, max: 99999999 }),

  // 禁字段
  body('Student').custom(value => { if (value !== undefined) throw new Error('Student 不可修改'); return true; }),
  body('Account').custom(value => { if (value !== undefined) throw new Error('Account 不可修改'); return true; }),
  body('Org').custom(value => { if (value !== undefined) throw new Error('Org 不可修改'); return true; }),
  body('OrderPack').custom(value => { if (value !== undefined) throw new Error('OrderPack 不可修改'); return true; }),
  body('Pack').custom(value => { if (value !== undefined) throw new Error('Pack 不可修改'); return true; }),
  body('resource').custom(value => { if (value !== undefined) throw new Error('resource 不可修改'); return true; }),
  body('totalLesson').custom(value => { if (value !== undefined) throw new Error('totalLesson 不可修改, 如需调整请删除后重建'); return true; }),
  body('packName').custom(value => { if (value !== undefined) throw new Error('packName 不可修改'); return true; }),
  body('LessonAttendances').custom(value => { if (value !== undefined) throw new Error('LessonAttendances 不可修改'); return true; }),

  validatorErrorHandle
];

/**
 * list 校验
 * 业务上常见过滤: Student / OrderPack / status / resource / Pack
 */
exports.listVD = [
  commonBodyRules.optionalObject('filter'),
  commonBodyRules.optionalString('filter.regExp', { minLength: 0, maxLength: 50 }),
  commonBodyRules.optionalObjectId('filter.Student'),
  commonBodyRules.optionalObjectId('filter.Account'),
  commonBodyRules.optionalObjectId('filter.OrderPack'),
  commonBodyRules.optionalObjectId('filter.Pack'),
  commonBodyRules.optionalObjectId('filter.Org'),
  commonBodyRules.optionalEnum('filter.status', StudentPackEnums.statusEnums),
  commonBodyRules.optionalEnum('filter.resource', StudentPackEnums.resourceEnums),

  ...listOptionsValidator,
  validatorErrorHandle
];

/**
 * detail 校验
 */
exports.detailVD = [
  commonParamRules.validateObjectId('id'),
  ...detailOptionsValidator,
  validatorErrorHandle
];
