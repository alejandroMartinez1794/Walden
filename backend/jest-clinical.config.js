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
    'text',
    'cobertura'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 90,
      statements: 90
    },
    './services/clinicalCrypto.js': {
      branches: 95,
      functions: 100,
      lines: 100,
      statements: 100
    },
    './services/medicalAlertService.js': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './services/appointmentReminderService.js': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './utils/clinicalCrypto.js': {
      branches: 95,
      functions: 100,
      lines: 100,
      statements: 100
    },
    './utils/encryption.js': {
      branches: 95,
      functions: 100,
      lines: 100,
      statements: 100
    },
    './middleware/auth.js': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './controllers/authController.js': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './validators/**/*': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './config/https.js': {
      branches: 95,
      functions: 100,
      lines: 100,
      statements: 100
    },
    './services/ResilientTaskRunner.js': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './services/CircuitBreaker.js': {
      branches: 95,
      functions: 100,
      lines: 100,
      statements: 100
    },
    './services/ClinicalMetrics.js': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};