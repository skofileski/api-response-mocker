module.exports = {
  testEnvironment: 'node',
  verbose: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/*.test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  clearMocks: true,
  resetMocks: true
};