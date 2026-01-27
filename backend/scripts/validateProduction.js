/**
 * Production Readiness Validation Script
 * 
 * Verifica que todas las variables de entorno requeridas estén configuradas
 * y que el proyecto esté listo para deployment.
 * 
 * Usage:
 *   node scripts/validateProduction.js
 *   npm run validate-production
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.blue}${msg}${colors.reset}`),
};

// Required environment variables for production
const REQUIRED_VARS = {
  critical: [
    'MONGO_URL',
    'JWT_SECRET_KEY',
    'ENCRYPTION_KEY',
    'CSRF_SECRET',
    'BACKEND_URL',
    'FRONTEND_URL',
    'CORS_ORIGINS',
  ],
  authentication: [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI',
  ],
  monitoring: [
    'NEW_RELIC_LICENSE_KEY',
    'NEW_RELIC_APP_NAME',
    'SENTRY_DSN',
  ],
  email: [
    'BREVO_API_KEY',
    'EMAIL_FROM',
  ],
  payment: [
    'WOMPI_PUBLIC_KEY',
    'WOMPI_PRIVATE_KEY',
    'WOMPI_EVENT_SECRET',
    'WOMPI_INTEGRITY_SECRET',
  ],
  optional: [
    'REDIS_URL',
    'EMAIL_BCC',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'HCAPTCHA_SECRET',
  ],
};

// Check if file exists
function checkFileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

// Validate environment variables
function validateEnvVars() {
  log.section('📋 Validating Environment Variables');
  
  let allValid = true;
  let warnings = 0;

  // Check each category
  for (const [category, vars] of Object.entries(REQUIRED_VARS)) {
    const isOptional = category === 'optional';
    
    console.log(`\n${category.toUpperCase()}:`);
    
    for (const varName of vars) {
      const value = process.env[varName];
      
      if (!value || value === '' || value.includes('your_') || value.includes('test_')) {
        if (isOptional) {
          log.warning(`${varName} - Not configured (optional)`);
          warnings++;
        } else {
          log.error(`${varName} - Missing or using placeholder/test value`);
          allValid = false;
        }
      } else {
        log.success(`${varName} - Configured`);
      }
    }
  }

  return { valid: allValid, warnings };
}

// Check file structure
function validateFileStructure() {
  log.section('📁 Validating File Structure');
  
  const requiredFiles = [
    '../index.js',
    '../package.json',
    '../newrelic.js',
    '../.env.example',
    '../config/sentry.js',
    '../config/google.js',
    '../config/swagger.js',
    '../utils/logger.js',
    '../utils/cache.js',
    '../utils/rateLimiter.js',
    '../../Legal/POLITICA_TRATAMIENTO_DATOS_COLOMBIA.md',
    '../../Legal/CONSENTIMIENTO_INFORMADO_COLOMBIA.md',
    '../../Legal/TERMINOS_Y_CONDICIONES_COLOMBIA.md',
    '../../DEPLOYMENT_GUIDE.md',
    '../../PRE_DEPLOYMENT_AUDIT.md',
  ];

  let allExist = true;

  for (const file of requiredFiles) {
    const fullPath = path.join(__dirname, file);
    if (checkFileExists(fullPath)) {
      log.success(file);
    } else {
      log.error(`${file} - Not found`);
      allExist = false;
    }
  }

  return allExist;
}

// Check package.json dependencies
function validateDependencies() {
  log.section('📦 Validating Dependencies');
  
  const packageJsonPath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  const criticalDeps = [
    'express',
    'mongoose',
    'jsonwebtoken',
    'bcryptjs',
    'winston',
    'joi',
    'helmet',
    'cors',
    'newrelic',
    '@sentry/node',
    '@getbrevo/brevo',
    'redis',
    'rate-limit-redis',
    'swagger-jsdoc',
    'swagger-ui-express',
  ];

  let allPresent = true;

  for (const dep of criticalDeps) {
    if (packageJson.dependencies[dep]) {
      log.success(`${dep} - v${packageJson.dependencies[dep]}`);
    } else {
      log.error(`${dep} - Not installed`);
      allPresent = false;
    }
  }

  return allPresent;
}

// Validate security settings
function validateSecurity() {
  log.section('🔒 Validating Security Configuration');
  
  const checks = [];

  // Check JWT secret strength
  const jwtSecret = process.env.JWT_SECRET_KEY;
  if (jwtSecret && jwtSecret.length >= 32) {
    log.success('JWT_SECRET_KEY - Strong (≥32 chars)');
    checks.push(true);
  } else {
    log.error('JWT_SECRET_KEY - Weak or missing (should be ≥32 chars)');
    checks.push(false);
  }

  // Check encryption key
  const encKey = process.env.ENCRYPTION_KEY;
  if (encKey && encKey.length === 64) {
    log.success('ENCRYPTION_KEY - Valid (64 hex chars)');
    checks.push(true);
  } else {
    log.error('ENCRYPTION_KEY - Invalid or missing (should be 64 hex chars from openssl rand -hex 32)');
    checks.push(false);
  }

  // Check CORS configuration
  const corsOrigins = process.env.CORS_ORIGINS;
  if (corsOrigins && !corsOrigins.includes('localhost') && corsOrigins.includes('https://')) {
    log.success('CORS_ORIGINS - Production configured (HTTPS)');
    checks.push(true);
  } else if (corsOrigins && corsOrigins.includes('localhost')) {
    log.warning('CORS_ORIGINS - Still using localhost (should be production domain)');
    checks.push(false);
  } else {
    log.error('CORS_ORIGINS - Not configured');
    checks.push(false);
  }

  // Check Wompi keys are production
  const wompiPubKey = process.env.WOMPI_PUBLIC_KEY;
  if (wompiPubKey && wompiPubKey.startsWith('pub_prod_')) {
    log.success('WOMPI_PUBLIC_KEY - Production key');
    checks.push(true);
  } else if (wompiPubKey && wompiPubKey.startsWith('pub_test_')) {
    log.warning('WOMPI_PUBLIC_KEY - Using TEST key (change to production)');
    checks.push(false);
  } else {
    log.error('WOMPI_PUBLIC_KEY - Not configured');
    checks.push(false);
  }

  return checks.every(check => check);
}

// Main validation
async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║   🚀 PRODUCTION READINESS VALIDATION - Psiconepsis   ║
╚═══════════════════════════════════════════════════════╝
  `);

  // Load environment variables
  const envPath = path.join(__dirname, '../.env');
  if (!checkFileExists(envPath)) {
    log.error('.env file not found. Create it from .env.example');
    process.exit(1);
  }

  // Import dotenv dynamically
  const dotenv = await import('dotenv');
  dotenv.config({ path: envPath });

  // Run validations
  const envResult = validateEnvVars();
  const filesExist = validateFileStructure();
  const depsInstalled = validateDependencies();
  const securityValid = validateSecurity();

  // Final report
  log.section('📊 VALIDATION SUMMARY');
  
  console.log('');
  console.log(`Environment Variables: ${envResult.valid ? colors.green + 'PASS' : colors.red + 'FAIL'}${colors.reset}`);
  console.log(`File Structure:        ${filesExist ? colors.green + 'PASS' : colors.red + 'FAIL'}${colors.reset}`);
  console.log(`Dependencies:          ${depsInstalled ? colors.green + 'PASS' : colors.red + 'FAIL'}${colors.reset}`);
  console.log(`Security Config:       ${securityValid ? colors.green + 'PASS' : colors.red + 'FAIL'}${colors.reset}`);
  
  if (envResult.warnings > 0) {
    console.log(`Warnings:              ${colors.yellow}${envResult.warnings} optional vars not configured${colors.reset}`);
  }

  console.log('');

  const allPassed = envResult.valid && filesExist && depsInstalled && securityValid;

  if (allPassed) {
    console.log(`${colors.green}╔═══════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.green}║   ✅ READY FOR PRODUCTION DEPLOYMENT             ║${colors.reset}`);
    console.log(`${colors.green}╚═══════════════════════════════════════════════════╝${colors.reset}`);
    console.log('');
    log.info('Next steps:');
    log.info('1. Review DEPLOYMENT_GUIDE.md');
    log.info('2. Deploy to Railway (backend)');
    log.info('3. Deploy to Vercel (frontend)');
    log.info('4. Configure domain DNS');
    log.info('5. Run health checks');
    process.exit(0);
  } else {
    console.log(`${colors.red}╔═══════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.red}║   ❌ NOT READY - Fix errors above                ║${colors.reset}`);
    console.log(`${colors.red}╚═══════════════════════════════════════════════════╝${colors.reset}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Validation script error:', error);
  process.exit(1);
});
