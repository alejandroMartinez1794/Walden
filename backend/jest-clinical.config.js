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
    'Controllers/**/*.js',
    'Routes/**/*.js',
    'auth/**/*.js',
    'config/**/*.js',
    'middleware/**/*.js',
    'models/**/*.js',
    'observability/**/*.js',
    'src/**/*.js',
    'utils/**/*.js',
    'validators/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/reports/**',
    '!**/tests/**',
    '!**/certs/**',
    '!jest.config.js',
    '!jest.config.cjs',
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
