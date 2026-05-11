/**
 * Script para validar la configuración de SECURITY_TIER
 * 
 * Este script verifica que la variable SECURITY_TIER esté configurada
 * correctamente antes de iniciar la aplicación.
 */

import logger from '../utils/logger.js';

// Lista de valores válidos para SECURITY_TIER
const VALID_SECURITY_TIERS = ['dev', 'staging', 'prod'];

// Valida la configuración de SECURITY_TIER
function validateSecurityTier() {
  const securityTier = process.env.SECURITY_TIER;
  
  if (!securityTier) {
    logger.error('❌ La variable de entorno SECURITY_TIER no está definida');
    logger.error('Valores válidos: dev, staging, prod');
    logger.error('Ejemplo: SECURITY_TIER=prod npm start');
    process.exit(1);
  }
  
  if (!VALID_SECURITY_TIERS.includes(securityTier)) {
    logger.error(`❌ Valor inválido para SECURITY_TIER: ${securityTier}`);
    logger.error(`Valores válidos: ${VALID_SECURITY_TIERS.join(', ')}`);
    process.exit(1);
  }
  
  logger.info(`✅ SECURITY_TIER configurado correctamente: ${securityTier}`);
  
  // Validar que el dominio esté presente en staging y prod
  if (securityTier === 'staging' || securityTier === 'prod') {
    const domain = process.env.DOMAIN;
    if (!domain) {
      logger.error(`❌ La variable de entorno DOMAIN es requerida para SECURITY_TIER=${securityTier}`);
      logger.error('Ejemplo: DOMAIN=api.basileia.com npm start');
      process.exit(1);
    }
    
    logger.info(`✅ DOMAIN configurado correctamente: ${domain}`);
  }
  
  return true;
}

// Ejecutar validación si este archivo es el módulo principal
if (process.argv[1] && process.argv[1].includes('validateSecurityTier.js')) {
  validateSecurityTier();
}

export { validateSecurityTier };