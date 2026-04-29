import dotenv from 'dotenv';
import mongoose from 'mongoose';

import logger from './utils/logger.js';
import { validateSecrets, getSecretsStats } from './utils/secretsManager.js';
import { initRedis, closeRedis, isRedisAvailable } from './utils/cache.js';
import { closeRateLimitRedis } from './utils/rateLimiter.js';
import { createOptimizedIndexes } from './scripts/optimizeIndexes.js';
import { ensureCriticalIndexes } from './scripts/ensureIndexes.js';

export function loadEnvironment() {
  logger.info('📋 [1/6] Cargando configuracion...');
  const envPath = '.env.local';
  const result = dotenv.config({ path: envPath, override: true });

  if (!result.error) {
    logger.info('   ✓ Variables de entorno cargadas desde .env.local');
    return;
  }

  logger.info('   ⚠ .env.local no encontrado, usando .env');
  dotenv.config({ path: '.env', override: true });
}

export async function validateSecurityPrerequisites() {
  logger.info('\n🔐 [2/6] Validando secretos de seguridad...');

  if (process.env.NODE_ENV === 'test') {
    logger.info('   ⏭ Validacion de secretos omitida (entorno de test)');
    return;
  }

  const secretsValidation = await validateSecrets();
  if (!secretsValidation.valid) {
    logger.error('   ✗ Error: Faltan secretos requeridos:', secretsValidation.missing);
    throw new Error('Faltan secretos requeridos para iniciar la aplicacion');
  }

  logger.info('   ✓ Todos los secretos validados correctamente');
  const stats = getSecretsStats();
  logger.info(`   ✓ Secretos cargados: ${stats.loaded}/${stats.total}`);
}

export async function initializeInfrastructure() {
  logger.info('\n⚡ [3/6] Inicializando servicios de cache...');
  await initRedis();

  if (isRedisAvailable()) {
    logger.info('   ✓ Redis conectado y disponible');
  } else {
    logger.info('   ⚠ Redis no configurado (opcional)');
  }
}

export async function connectDatabase() {
  logger.info('\n🗄️  [5/6] Conectando a base de datos...');

  mongoose.set('strictQuery', false);

  await mongoose.connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    maxPoolSize: 20,
    minPoolSize: 5,
    maxIdleTimeMS: 30000,
    socketTimeoutMS: 45000,
  });

  logger.info('   ✓ Conexion MongoDB establecida');
  logger.info('   ✓ Pool de conexiones optimizado (max: 20, min: 5)');

  createOptimizedIndexes().catch(() => {
    logger.info('   ⚠ Optimizacion de indices fallo (no critico)');
  });

  ensureCriticalIndexes().catch(() => {});
}

export async function shutdownInfrastructure() {
  logger.info('   → Cerrando rate limiter Redis...');
  await closeRateLimitRedis();

  logger.info('   → Cerrando Redis cache...');
  await closeRedis();

  logger.info('   → Desconectando MongoDB...');
  await mongoose.disconnect();
}
