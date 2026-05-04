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

const isCI = ['1', 'true'].includes((process.env.CI || '').toLowerCase());

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
  testTimeout: isCI ? 600000 : 180000, // 3 min local, 10 min in CI (for slow downloads)
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
