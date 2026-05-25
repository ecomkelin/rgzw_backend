const { validatorErrorHandle, commonBodyRules, commonParamRules, listOptionsValidator } = require('@utils/validatorHandle');

exports.createVD = [
  // Body 参数：可选规则
  commonBodyRules.optionalBoolean('isActive'),
  commonBodyRules.optionalNumber('sort', null, { min: 0 }),
  commonBodyRules.validateString('unionCode', { minLength: 2, maxLength: 30 }), // 增加最大长度
  commonBodyRules.validateString('name', { minLength: 2, maxLength: 100 }), // 增加最大长度
  commonBodyRules.validateString('nickname', { minLength: 1, maxLength: 50 }), // 允许更短的昵称
  commonBodyRules.optionalString('phone', { minLength: 7, maxLength: 20 }), // 调整电话长度范围
  commonBodyRules.optionalString('email', { minLength: 5, maxLength: 100 }), // 调整邮箱长度范围
  commonBodyRules.optionalString('website', { minLength: 5, maxLength: 200 }), // 调整网站长度范围
  commonBodyRules.optionalString('address', { minLength: 5, maxLength: 200 }), // 增加地址长度
  commonBodyRules.optionalBoolean('isMain'), // 添加对isMain字段的验证
  commonBodyRules.optionalObjectId('Nation'),
  commonBodyRules.optionalObjectId('Province'), // 使用正确的省份字段名
  commonBodyRules.optionalObjectId('City'),
  commonBodyRules.optionalObjectId('Area'),

  validatorErrorHandle
];

exports.updateVD = [
  // Body 参数：可选规则（注意：id参数验证不在这里，而是在路由层面）
  commonBodyRules.optionalBoolean('isActive'),
  commonBodyRules.optionalNumber('sort', null, { min: 0 }),
  commonBodyRules.optionalString('unionCode', { minLength: 2, maxLength: 30 }),
  commonBodyRules.optionalString('name', { minLength: 2, maxLength: 100 }),
  commonBodyRules.optionalString('nickname', { minLength: 1, maxLength: 50 }),
  commonBodyRules.optionalString('phone', { minLength: 7, maxLength: 20 }),
  commonBodyRules.optionalString('email', { minLength: 5, maxLength: 100 }),
  commonBodyRules.optionalString('website', { minLength: 5, maxLength: 200 }),
  commonBodyRules.optionalString('address', { minLength: 5, maxLength: 200 }),
  commonBodyRules.optionalBoolean('isMain'),
  commonBodyRules.optionalObjectId('Nation'),
  commonBodyRules.optionalObjectId('Province'), // 使用正确的省份字段名
  commonBodyRules.optionalObjectId('City'),
  commonBodyRules.optionalObjectId('Area'),

  validatorErrorHandle
];


exports.listVD = [
  commonBodyRules.optionalString('regExp', { minLength: 0, maxLength: 50 }), // 增加正则表达式搜索长度
  commonBodyRules.optionalBoolean('isActive'),
  commonBodyRules.optionalBoolean('isMain'), // 添加主机构筛选
  commonBodyRules.optionalString('name', { minLength: 1, maxLength: 100 }), // 名称筛选
  commonBodyRules.optionalString('unionCode', { minLength: 1, maxLength: 30 }), // 统一代码筛选
  commonBodyRules.optionalObjectId('Nation'),
  commonBodyRules.optionalObjectId('Province'), // 使用正确的省份字段名
  commonBodyRules.optionalObjectId('City'),
  commonBodyRules.optionalObjectId('Area'),

  ...listOptionsValidator, // 分页, 排序
  validatorErrorHandle
];

// 4. 查询单条标签（仅 Param 参数）
exports.detailVD = [
  commonParamRules.validateObjectId('id'),
  validatorErrorHandle
];