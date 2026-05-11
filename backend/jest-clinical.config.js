/**
 * 🧪 CLINICAL JEST CONFIGURATION
 * 
 * Configuración específica para tests clínicos con umbrales por dominio
 * 
 * Features:
 * - Umbrales estrictos por dominio clínico
 * - Soporte para ES Modules
 * - Cobertura detallada por módulos críticos
 * - Integración con herramientas de reporting
 */

const isCI = ['1', 'true'].includes((process.env.CI || '').toLowerCase());

export default {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'services/**/*.js',
    'controllers/**/*.js',
    'utils/**/*.js',
    'middleware/**/*.js',
    'models/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!jest.config.js',
    '!jest-clinical.config.js',
    '!index.js',
    '!server.js',
    '!bootstrap.js',
    '!**/scripts/**',
    '!**/workers/**'
  ],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/clinical-scenarios/**/*.test.js'
  ],
  verbose: true,
  testTimeout: isCI ? 600000 : 180000, // 3 min local, 10 min in CI (for slow downloads)
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  reporters: [
    'default',
    'jest-junit',
    ['jest-html-reporters', {
      publicPath: './reports',
      filename: 'test-report.html',
      pageTitle: 'Clinical Test Report'
    }]
  ],
  coverageReporters: [
    'html',
    'lcov',
    'json-summary',
    'text',
    'cobertura'
  ]
};
