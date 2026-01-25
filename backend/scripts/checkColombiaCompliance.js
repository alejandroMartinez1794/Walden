#!/usr/bin/env node
/**
 * Verificador de Compliance para Colombia
 * Reemplaza checkBaaCompliance.js (que era para HIPAA/USA)
 * 
 * Verifica:
 * - Documentación legal colombiana presente
 * - Configuración de seguridad básica
 * - Variables de entorno necesarias
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

async function checkColombiaCompliance() {
  log('\n🇨🇴 Verificador de Compliance - Colombia\n', 'cyan');
  log('Verificando cumplimiento de legislación colombiana...', 'white');
  log('━'.repeat(60), 'cyan');

  let allChecks = true;
  const results = {
    legal: [],
    security: [],
    config: [],
  };

  // ============= DOCUMENTACIÓN LEGAL =============
  log('\n📄 1. Documentación Legal\n', 'cyan');

  const legalDocs = [
    {
      path: '../../Legal/POLITICA_TRATAMIENTO_DATOS_COLOMBIA.md',
      name: 'Política de Tratamiento de Datos (Ley 1581/2012)',
      required: true,
    },
    {
      path: '../../Legal/CONSENTIMIENTO_INFORMADO_COLOMBIA.md',
      name: 'Consentimiento Informado (Res. 2654/2019)',
      required: true,
    },
    {
      path: '../../Legal/TERMINOS_Y_CONDICIONES_COLOMBIA.md',
      name: 'Términos y Condiciones',
      required: true,
    },
  ];

  for (const doc of legalDocs) {
    const fullPath = path.join(__dirname, doc.path);
    const exists = checkFileExists(fullPath);
    
    if (exists) {
      log(`✅ ${doc.name}`, 'green');
      results.legal.push({ name: doc.name, status: 'OK' });
    } else {
      log(`❌ ${doc.name} - NO ENCONTRADO`, 'red');
      results.legal.push({ name: doc.name, status: 'FALTA' });
      if (doc.required) allChecks = false;
    }
  }

  // ============= CONFIGURACIÓN DE SEGURIDAD =============
  log('\n🔒 2. Configuración de Seguridad\n', 'cyan');

  // Verificar HTTPS configurado
  const httpsConfig = path.join(__dirname, '../config/https.js');
  if (checkFileExists(httpsConfig)) {
    log('✅ Configuración HTTPS presente', 'green');
    results.security.push({ name: 'HTTPS', status: 'OK' });
  } else {
    log('⚠️  Configuración HTTPS no encontrada', 'yellow');
    results.security.push({ name: 'HTTPS', status: 'WARNING' });
  }

  // Verificar certificados (al menos auto-firmados para dev)
  const certsDir = path.join(__dirname, '../certs');
  if (fs.existsSync(certsDir)) {
    const certFiles = fs.readdirSync(certsDir);
    if (certFiles.length > 0) {
      log('✅ Certificados SSL/TLS presentes', 'green');
      results.security.push({ name: 'Certificados', status: 'OK' });
    } else {
      log('⚠️  Directorio certs vacío', 'yellow');
      results.security.push({ name: 'Certificados', status: 'WARNING' });
    }
  } else {
    log('⚠️  Directorio de certificados no existe', 'yellow');
    log('   Ejecuta: npm run generate-certs', 'white');
    results.security.push({ name: 'Certificados', status: 'WARNING' });
  }

  // Verificar utils de seguridad
  const securityUtils = [
    { path: '../utils/logger.js', name: 'Sistema de logging (Winston)' },
    { path: '../utils/secretsManager.js', name: 'Gestión de secretos' },
    { path: '../auth/verifyToken.js', name: 'Autenticación JWT' },
  ];

  for (const util of securityUtils) {
    const fullPath = path.join(__dirname, util.path);
    if (checkFileExists(fullPath)) {
      log(`✅ ${util.name}`, 'green');
      results.security.push({ name: util.name, status: 'OK' });
    } else {
      log(`❌ ${util.name} - NO ENCONTRADO`, 'red');
      results.security.push({ name: util.name, status: 'FALTA' });
      allChecks = false;
    }
  }

  // ============= VARIABLES DE ENTORNO =============
  log('\n⚙️  3. Variables de Entorno\n', 'cyan');

  const envPath = path.join(__dirname, '../.env.local');
  if (!checkFileExists(envPath)) {
    log('⚠️  Archivo .env.local no encontrado', 'yellow');
    log('   Usando .env por defecto', 'white');
  }

  // Cargar dotenv
  const dotenv = await import('dotenv');
  dotenv.config({ path: envPath });

  const requiredEnvVars = [
    { key: 'MONGO_URL', name: 'URL de MongoDB' },
    { key: 'JWT_SECRET_KEY', name: 'Clave JWT' },
    { key: 'GOOGLE_CLIENT_ID', name: 'Google OAuth Client ID' },
    { key: 'GOOGLE_CLIENT_SECRET', name: 'Google OAuth Client Secret' },
  ];

  for (const envVar of requiredEnvVars) {
    if (process.env[envVar.key]) {
      log(`✅ ${envVar.name}`, 'green');
      results.config.push({ name: envVar.name, status: 'OK' });
    } else {
      log(`❌ ${envVar.name} - NO CONFIGURADA`, 'red');
      log(`   Variable: ${envVar.key}`, 'white');
      results.config.push({ name: envVar.name, status: 'FALTA' });
      allChecks = false;
    }
  }

  // ============= CHECKLIST ADICIONAL =============
  log('\n📋 4. Checklist de Lanzamiento Colombia\n', 'cyan');

  const checklist = [
    {
      item: 'Registro RNBD en Superintendencia de Industria y Comercio',
      status: 'PENDIENTE',
      info: 'Ver: GUIA_REGISTRO_COLOMBIA.md - Fase 1',
    },
    {
      item: 'Registro en Ministerio de Salud (Telesalud)',
      status: 'PENDIENTE',
      info: 'Ver: GUIA_REGISTRO_COLOMBIA.md - Fase 2',
    },
    {
      item: 'Verificación RETHUS de profesionales',
      status: 'PENDIENTE',
      info: 'Cada profesional debe estar registrado',
    },
    {
      item: 'Publicar Política de Datos en sitio web',
      status: 'PENDIENTE',
      info: 'Debe ser accesible públicamente',
    },
  ];

  for (const check of checklist) {
    log(`⏳ ${check.item}`, 'yellow');
    log(`   Estado: ${check.status}`, 'white');
    log(`   ℹ️  ${check.info}`, 'cyan');
  }

  // ============= RESUMEN FINAL =============
  log('\n' + '━'.repeat(60), 'cyan');
  log('\n📊 RESUMEN DE COMPLIANCE\n', 'cyan');

  const legalOK = results.legal.filter(r => r.status === 'OK').length;
  const securityOK = results.security.filter(r => r.status === 'OK').length;
  const configOK = results.config.filter(r => r.status === 'OK').length;

  log(`Documentación Legal: ${legalOK}/${results.legal.length} ✓`, legalOK === results.legal.length ? 'green' : 'yellow');
  log(`Seguridad Técnica: ${securityOK}/${results.security.length} ✓`, securityOK === results.security.length ? 'green' : 'yellow');
  log(`Configuración: ${configOK}/${results.config.length} ✓`, configOK === results.config.length ? 'green' : 'yellow');

  log('\n' + '━'.repeat(60), 'cyan');

  if (allChecks) {
    log('\n✅ COMPLIANCE TÉCNICO: APROBADO', 'green');
    log('\n📝 Siguiente paso:', 'cyan');
    log('   1. Registrar base de datos en RNBD (SIC)', 'white');
    log('   2. Registrar plataforma en Ministerio de Salud', 'white');
    log('   3. Verificar RETHUS de profesionales', 'white');
    log('   4. Publicar documentos legales en sitio web', 'white');
    log('\n📖 Ver guía completa: GUIA_REGISTRO_COLOMBIA.md\n', 'cyan');
    process.exit(0);
  } else {
    log('\n❌ COMPLIANCE TÉCNICO: PENDIENTE', 'red');
    log('\nAcciones requeridas:', 'yellow');
    
    if (results.legal.some(r => r.status === 'FALTA')) {
      log('  • Completar documentación legal faltante', 'white');
    }
    if (results.security.some(r => r.status === 'FALTA')) {
      log('  • Configurar componentes de seguridad', 'white');
    }
    if (results.config.some(r => r.status === 'FALTA')) {
      log('  • Configurar variables de entorno en .env.local', 'white');
    }
    
    log('\n📖 Consultar documentación en Legal/ y backend/config/\n', 'cyan');
    process.exit(1);
  }
}

// Ejecutar verificación
checkColombiaCompliance().catch(error => {
  log(`\n❌ Error al verificar compliance: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
