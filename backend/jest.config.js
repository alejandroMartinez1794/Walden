/**
 * 🧪 JEST CONFIGURATION
 * 
 * Configuración de Jest para tests unitarios e integración
 * 
 * Features:
 * - ES Modules support (NODE_OPTIONS=--experimental-vm-modules)
 * - Coverage thresholds (70% mínimo)
 * - Global setup para mocks y helpers
 */

export default {
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
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
