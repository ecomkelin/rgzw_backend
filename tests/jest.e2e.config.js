module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/e2e/**/*.e2e.test.js'
  ],
  setupFilesAfterEnv: ['./src/e2e/setup.js'],
  testTimeout: 30000,  // E2E测试可能需要更长时间
  verbose: true
}; 