const {
  validatorErrorHandle,
  commonBodyRules,
  commonParamRules,
  listOptionsValidator,
  detailOptionsValidator
} = require('@utils/validatorHandle');
const { OrderPackEnums } = require('@models/pack/_OrderPack.dao');

/**
 * add 校验
 * - 必填: Student / Pack / finalPrice
 * - Account 由 DAO 根据 Student.Account 自动推导,前端无需传
 * - Course 强烈建议填写(直接报名班级场景),但仍是可选
 * - 其余字段(价格快照 / 支付信息)由 DAO 自动从 Pack 写入或在 edit 时更新
 */
exports.addVD = [
  commonBodyRules.validateObjectId('Student'),
  commonBodyRules.validateObjectId('Pack'),
  commonBodyRules.validateNumber('finalPrice', '', { min: 0, max: 999999999 }),

  // 可选字段(若前端传了 Account 也会被忽略,统一以 Student.Account 为准)
  commonBodyRules.optionalObjectId('Course'),
  commonBodyRules.optionalEnum('payStatus', OrderPackEnums.payStatusEnums),
  commonBodyRules.optionalEnum('payMethod', OrderPackEnums.payMethodEnums),
  commonBodyRules.optionalString('transactionId', { minLength: 0, maxLength: 100 }),
  commonBodyRules.optionalDate('paidAt'),
  commonBodyRules.optionalString('remark', { minLength: 0, maxLength: 500 }),

  validatorErrorHandle
];

/**
 * edit 校验
 * - 路径参数 id 必填且为 ObjectId
 * - 业务字段均可选
 */
exports.editVD = [
  commonParamRules.validateObjectId('id'),

  // 快照字段：DAO 会从 Pack 重新写入，理论上不允许前端覆盖；这里放行但不推荐使用
  commonBodyRules.optionalEnum('payStatus', OrderPackEnums.payStatusEnums),
  commonBodyRules.optionalEnum('payMethod', OrderPackEnums.payMethodEnums),
  commonBodyRules.optionalString('transactionId', { minLength: 0, maxLength: 100 }),
  commonBodyRules.optionalDate('paidAt'),
  commonBodyRules.optionalString('remark', { minLength: 0, maxLength: 500 }),

  validatorErrorHandle
];

/**
 * list 校验
 * - filter 全部可选
 * - 业务上常见过滤: regExp(模糊匹配 packName) / payStatus / Account / Student / Org
 */
exports.listVD = [
  commonBodyRules.optionalObject('filter'),
  commonBodyRules.optionalString('filter.regExp', { minLength: 0, maxLength: 50 }),
  commonBodyRules.optionalEnum('filter.payStatus', OrderPackEnums.payStatusEnums),
  commonBodyRules.optionalObjectId('filter.Account'),
  commonBodyRules.optionalObjectId('filter.Student'),
  commonBodyRules.optionalObjectId('filter.Pack'),
  commonBodyRules.optionalObjectId('filter.Org'),

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
