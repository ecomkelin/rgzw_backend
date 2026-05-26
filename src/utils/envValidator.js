/**
 * 环境变量验证工具
 * 用于在应用启动时验证必需的环境变量是否存在和格式正确
 */

/**
 * 验证必需的环境变量
 * @param {Array<string>} requiredEnvVars - 必需的环境变量数组
 * @throws {Error} 如果任何必需的环境变量缺失
 */
function validateEnvironmentVariables(requiredEnvVars = []) {
  const missingEnvVars = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingEnvVars.push(envVar);
    }
  }

  if (missingEnvVars.length > 0) {
    console.error(`❌ 缺失必需的环境变量: ${missingEnvVars.join(', ')}`);
    console.error('请检查 .env 文件并设置以下变量:');
    missingEnvVars.forEach(envVar => {
      console.error(`  - ${envVar}`);
    });
    throw ({ code: 500, message: `Missing required environment variables: ${missingEnvVars.join(', ')}` });
  }

  console.info('✅ 所有必需的环境变量都已设置');
}

/**
 * 验证环境变量格式
 * @param {Object} validations - 验证规则对象，格式为 { ENV_VAR_NAME: validatorFunction }
 */
function validateEnvironmentFormats(validations = {}) {
  const invalidEnvVars = [];

  for (const [envVar, validator] of Object.entries(validations)) {
    const value = process.env[envVar];
    if (value && !validator(value)) {
      invalidEnvVars.push(envVar);
    }
  }

  if (invalidEnvVars.length > 0) {
    console.error(`❌ 无效的环境变量格式: ${invalidEnvVars.join(', ')}`);
    throw ({ code: 500, message: `Invalid environment variable formats: ${invalidEnvVars.join(', ')}` });
  }
}

// 默认验证规则
const DEFAULT_REQUIRED_VARS = [
  'NODE_ENV',
  'MONGODB_URI',
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET'
];

const DEFAULT_VALIDATIONS = {
  'PORT': (value) => /^\d+$/.test(value) && parseInt(value) > 0 && parseInt(value) <= 65535,
  'ACCESS_TOKEN_EXPIRED': (value) => typeof value === 'string' && value.length > 0,
  'REFRESH_TOKEN_EXPIRED': (value) => typeof value === 'string' && value.length > 0
};

module.exports = {
  validateEnvironmentVariables,
  validateEnvironmentFormats,
  DEFAULT_REQUIRED_VARS,
  DEFAULT_VALIDATIONS
};