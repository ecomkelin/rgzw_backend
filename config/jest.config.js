module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/tests/**/*.test.js'
  ],
  collectCoverage: true,
  coverageDirectory: '../coverage', // 输出到项目根目录
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/dist/',
    '/src/e2e/'
  ],
  testTimeout: 15000,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../src/$1',
    '^@utils/(.*)$': '<rootDir>/../src/utils/$1',
    '^@models/(.*)$': '<rootDir>/../src/models/$1',
    '^@routers/(.*)$': '<rootDir>/../src/routers/$1',
    '^@middlewares/(.*)$': '<rootDir>/../src/middlewares/$1',
    '^@modules/(.*)$': '<rootDir>/../src/modules/$1',
    '^@config/(.*)$': '<rootDir>/../src/config/$1'
  },
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/../tests/jest.setup.js'],
  setupFiles: ['<rootDir>/../tests/jest.setup.js']
}; 