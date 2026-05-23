// tests/jest.setup.js
// Setup for Jest tests

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/test-label-module';

// Mock global objects if needed
global.console.error = jest.fn();
global.console.warn = jest.fn();

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});