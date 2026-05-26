const path = require('path');

module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/tests/**/*.test.js',
    '**/tests/api/**/*.test.js'  // 添加这一行来匹配我们创建的测试文件
  ],
  collectCoverage: true,
  coverageDirectory: path.resolve(__dirname, '../tests/coverage'), // 输出到tests目录
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/dist/',
    '/src/e2e/'
  ],
  testTimeout: 15000,
  moduleNameMapper: {
    '^@/(.*)$': path.resolve(__dirname, '../src/$1'),
    '^@utils/(.*)$': path.resolve(__dirname, '../src/utils/$1'),
    '^@models/(.*)$': path.resolve(__dirname, '../src/models/$1'),
    '^@routers/(.*)$': path.resolve(__dirname, '../src/routers/$1'),
    '^@middlewares/(.*)$': path.resolve(__dirname, '../src/middlewares/$1'),
    '^@modules/(.*)$': path.resolve(__dirname, '../src/modules/$1'),
    '^@config/(.*)$': path.resolve(__dirname, '../src/config/$1')
  },
  clearMocks: true,
  setupFilesAfterEnv: [path.resolve(__dirname, './jest.setup.js')],
  setupFiles: [path.resolve(__dirname, './setup.js')]
}; 