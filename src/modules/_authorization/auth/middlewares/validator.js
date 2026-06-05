const { body } = require('express-validator');

const { validatorErrorHandle, commonBodyRules, commonParamRules } = require('@utils/validatorHandle');

// 登录验证规则
exports.loginVD = [
  commonBodyRules.validateString('code', { minLength: 4, maxLength: 16 }),
  commonBodyRules.validateString('password', { minLength: 8, maxLength: 16 }),

  validatorErrorHandle
];

exports.switchRoleVD = [
  commonParamRules.validateObjectId('id'),

  validatorErrorHandle
]