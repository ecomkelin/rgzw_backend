const { ObjectId } = require('mongoose').Types;
const { validatorErrorHandle, commonBodyRules, commonParamRules, commonQueryRules, validatorOptions } = require('@utils/validatorHandle');
const { modelEnums } = require('@models/global/Label.model');

// 1. 创建标签验证（Body 参数为主，大量必填）
exports.createVD = [
  commonBodyRules.validateEnum('mould', modelEnums.mouldEnums),
  commonBodyRules.validateString('name', { maxLength: 100, msg: '标签名称必须是字符串' }),
  commonBodyRules.optionalString('description', { maxLength: 500 }),
  commonBodyRules.optionalUrl('posterUrl'),
  commonBodyRules.optionalBoolean('isActive'),
  commonBodyRules.optionalNumber('sort'),
  validatorErrorHandle
];

// 2. 更新标签验证（Param + Body）
exports.updateVD = [
  // 路径参数：必填 ObjectId
  commonParamRules.validateObjectId('id'),
  // Body 参数：可选规则
  commonBodyRules.optionalString('name', { maxLength: 100 }),
  commonBodyRules.optionalBoolean('isActive'),
  commonBodyRules.optionalNumber('sort'),
  validatorErrorHandle
];

// 3. 查询标签列表（Query 参数为主，全可选）
exports.listVD = [
  commonBodyRules.optionalString('regExp', { maxLength: 100 }),
  commonBodyRules.optionalEnum('mould', modelEnums.mouldEnums), // 业务默认
  commonBodyRules.optionalBoolean('isActive'),
  ...validatorOptions,
  validatorErrorHandle
];

// 4. 查询单条标签（仅 Param 参数）
exports.detailVD = [
  commonParamRules.validateObjectId('id'),
  validatorErrorHandle
];

// 5. 删除单条标签（仅 Param 参数）
exports.deleteVD = [
  commonParamRules.validateObjectId('id'),
  validatorErrorHandle
];

// 6. 批量删除标签（Body 参数：ID 数组）
exports.deleteIdsVD = [
  commonBodyRules.validateArray('ids', { maxLength: 100 }) // 限制最大长度为100
    .custom(value => {
      if (!Array.isArray(value) || value.length === 0) {
        return false;
      }
      // 检查每个元素是否为有效的 ObjectId
      return value.every(id => {
        try {
          // 如果是字符串，尝试验证它是否是有效的 ObjectId
          if (typeof id === 'string') {
            return ObjectId.isValid(id);
          }
          return false;
        } catch (e) {
          return false;
        }
      });
    }).withMessage('ids 必须是合法的 ObjectId 数组，且不超过100个'),
  validatorErrorHandle
];