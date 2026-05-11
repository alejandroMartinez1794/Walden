/**
 * JEST CONFIGURATION
 * 
 * Jest configuration for unit and integration tests.
 * 
 * Features:
 * - Babel transform for ES module source files
 * - Coverage thresholds
 * - Global setup for mocks and helpers
 */

const isCI = ['1', 'true'].includes((process.env.CI || '').toLowerCase());

module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!jest.config.js',
    '!index.js'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  verbose: true,
  testTimeout: isCI ? 600000 : 180000, // 3 min local, 10 min in CI for slow downloads
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  moduleFileExtensions: ["js", "cjs", "mjs", "jsx"],
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', { configFile: './babel.config.cjs' }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(supertest|googleapis|googleapis-common|google-auth-library|gaxios|gcp-metadata|node-fetch|data-uri-to-buffer|fetch-blob|formdata-polyfill|whatwg-url|webidl-conversions|tr46)/)',
  ],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
