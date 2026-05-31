const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('@utils/validatorHandle');
const RoomModel = require('@models/organization/physical/Room.model').RoomModel;

// 验证列表查询参数
const listVD = [
  // filter 参数验证
  query('filter.name').optional().isString().withMessage('教室名称必须是字符串'),
  query('filter.capacity').optional().isNumeric().withMessage('容量必须是数字'),
  query('filter.location').optional().isString().withMessage('位置必须是字符串'),
  query('filter.status').optional().isString().withMessage('状态必须是字符串'),
  query('filter.isActive').optional().isBoolean().withMessage('激活状态必须是布尔值'),

  // options 参数验证
  query('options.limit').optional().isInt({ min: 1, max: 1000 }).withMessage('限制数量必须在1-1000之间'),
  query('options.skip').optional().isInt({ min: 0 }).withMessage('跳过数量不能小于0'),
  query('options.sort').optional().isString().withMessage('排序参数必须是字符串'),

  handleValidationErrors
];

// 验证详情查询参数
const detailVD = [
  param('id').notEmpty().withMessage('ID不能为空').isMongoId().withMessage('ID必须是有效的MongoDB ID'),
  handleValidationErrors
];

// 验证创建参数
const addVD = [
  body('name').notEmpty().withMessage('教室名称不能为空').isString().withMessage('教室名称必须是字符串'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('容量必须是大于0的整数'),
  body('location').optional().isString().withMessage('位置必须是字符串'),
  body('description').optional().isString().withMessage('描述必须是字符串'),
  body('status').optional().isString().withMessage('状态必须是字符串'),
  body('isActive').optional().isBoolean().withMessage('激活状态必须是布尔值'),

  handleValidationErrors
];

// 验证编辑参数
const editVD = [
  param('id').notEmpty().withMessage('ID不能为空').isMongoId().withMessage('ID必须是有效的MongoDB ID'),
  body('name').optional().isString().withMessage('教室名称必须是字符串'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('容量必须是大于0的整数'),
  body('location').optional().isString().withMessage('位置必须是字符串'),
  body('description').optional().isString().withMessage('描述必须是字符串'),
  body('status').optional().isString().withMessage('状态必须是字符串'),
  body('isActive').optional().isBoolean().withMessage('激活状态必须是布尔值'),

  handleValidationErrors
];

module.exports = {
  listVD,
  detailVD,
  addVD,
  editVD
};