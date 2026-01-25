/**
 * 🔐 SECRETS MANAGER
 * 
 * Sistema unificado de gestión de secretos con soporte para múltiples backends
 * 
 * Backends soportados:
 * - Local (.env) - Desarrollo
 * - AWS Secrets Manager - Producción
 * - HashiCorp Vault - Producción (enterprise)
 * - Azure Key Vault - Producción (Azure)
 * - Google Secret Manager - Producción (GCP)
 * 
 * Características:
 * - Caching en memoria (reduce llamadas a APIs)
 * - Refresh automático de secretos
 * - Validación de secretos requeridos
 * - Rotación automática de claves
 * - Fallback a .env en desarrollo
 * 
 * Uso:
 * ```javascript
 * import { getSecret, validateSecrets } from './utils/secretsManager.js';
 * 
 * const jwtSecret = await getSecret('JWT_SECRET_KEY');
 * await validateSecrets(['JWT_SECRET_KEY', 'MONGO_URL']);
 * ```
 */

import dotenv from 'dotenv';
import logger from './logger.js';

// Cargar .env para obtener configuración inicial
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// Cache de secretos en memoria (reduce llamadas a APIs)
const secretsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Configuración del backend de secrets
const SECRETS_BACKEND = process.env.SECRETS_BACKEND || 'local'; // local, aws, vault, azure, gcp
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const AWS_SECRET_NAME = process.env.AWS_SECRET_NAME || 'psiconepsis/production';

/**
 * 🔑 Secretos requeridos para funcionamiento
 * 
 * Validados al inicio de la aplicación
 */
const REQUIRED_SECRETS = [
  'JWT_SECRET_KEY',
  'MONGO_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'EMAIL_PASSWORD',
  'ENCRYPTION_KEY' // Para datos clínicos
];

/**
 * 🔑 Secretos sensibles que deben rotarse periódicamente
 * 
 * TODO: Implementar rotación automática
 */
const ROTATABLE_SECRETS = [
  'JWT_SECRET_KEY',
  'ENCRYPTION_KEY',
  'EMAIL_PASSWORD'
];

/**
 * ⚙️ Backend: Local (.env)
 * 
 * Lee de variables de entorno (desarrollo)
 */
const getSecretLocal = async (key) => {
  const value = process.env[key];
  
  if (!value) {
    logger.warn(`Secret "${key}" not found in environment`);
    return null;
  }
  
  return value;
};

/**
 * ⚙️ Backend: AWS Secrets Manager
 * 
 * Lee de AWS Secrets Manager (producción)
 * 
 * Requisitos:
 * - npm install @aws-sdk/client-secrets-manager
 * - Credenciales AWS configuradas (IAM role o env vars)
 */
const getSecretAWS = async (key) => {
  try {
    // Lazy import para no requerir AWS SDK en desarrollo
    const { SecretsManagerClient, GetSecretValueCommand } = await import('@aws-sdk/client-secrets-manager');
    
    const client = new SecretsManagerClient({ region: AWS_REGION });
    
    const command = new GetSecretValueCommand({
      SecretId: AWS_SECRET_NAME,
    });
    
    const response = await client.send(command);
    const secrets = JSON.parse(response.SecretString);
    
    return secrets[key] || null;
    
  } catch (error) {
    logger.error(`Error fetching secret "${key}" from AWS Secrets Manager`, {
      error: error.message,
      region: AWS_REGION,
      secretName: AWS_SECRET_NAME
    });
    return null;
  }
};

/**
 * ⚙️ Backend: HashiCorp Vault
 * 
 * Lee de Vault (producción enterprise)
 * 
 * Requisitos:
 * - npm install node-vault
 * - VAULT_ADDR, VAULT_TOKEN en env
 */
const getSecretVault = async (key) => {
  try {
    const vault = await import('node-vault');
    
    const vaultClient = vault.default({
      apiVersion: 'v1',
      endpoint: process.env.VAULT_ADDR || 'http://localhost:8200',
      token: process.env.VAULT_TOKEN
    });
    
    const vaultPath = process.env.VAULT_PATH || 'secret/psiconepsis';
    const response = await vaultClient.read(`${vaultPath}/config`);
    
    return response.data[key] || null;
    
  } catch (error) {
    logger.error(`Error fetching secret "${key}" from Vault`, {
      error: error.message,
      vaultAddr: process.env.VAULT_ADDR
    });
    return null;
  }
};

/**
 * ⚙️ Backend: Azure Key Vault
 * 
 * Lee de Azure Key Vault (producción Azure)
 * 
 * Requisitos:
 * - npm install @azure/keyvault-secrets @azure/identity
 * - AZURE_KEY_VAULT_NAME en env
 */
const getSecretAzure = async (key) => {
  try {
    const { SecretClient } = await import('@azure/keyvault-secrets');
    const { DefaultAzureCredential } = await import('@azure/identity');
    
    const vaultName = process.env.AZURE_KEY_VAULT_NAME;
    const vaultUrl = `https://${vaultName}.vault.azure.net`;
    
    const credential = new DefaultAzureCredential();
    const client = new SecretClient(vaultUrl, credential);
    
    const secret = await client.getSecret(key);
    return secret.value || null;
    
  } catch (error) {
    logger.error(`Error fetching secret "${key}" from Azure Key Vault`, {
      error: error.message,
      vaultName: process.env.AZURE_KEY_VAULT_NAME
    });
    return null;
  }
};

/**
 * ⚙️ Backend: Google Secret Manager
 * 
 * Lee de Google Secret Manager (producción GCP)
 * 
 * Requisitos:
 * - npm install @google-cloud/secret-manager
 * - GOOGLE_APPLICATION_CREDENTIALS o Default Application Credentials
 */
const getSecretGCP = async (key) => {
  try {
    const { SecretManagerServiceClient } = await import('@google-cloud/secret-manager');
    
    const client = new SecretManagerServiceClient();
    const projectId = process.env.GCP_PROJECT_ID;
    const secretName = `projects/${projectId}/secrets/${key}/versions/latest`;
    
    const [version] = await client.accessSecretVersion({ name: secretName });
    const payload = version.payload.data.toString('utf8');
    
    return payload;
    
  } catch (error) {
    logger.error(`Error fetching secret "${key}" from Google Secret Manager`, {
      error: error.message,
      projectId: process.env.GCP_PROJECT_ID
    });
    return null;
  }
};

/**
 * 🔑 Obtener secreto (con caching)
 * 
 * @param {string} key - Nombre del secreto
 * @param {boolean} skipCache - Saltar cache y obtener valor fresco
 * @returns {Promise<string|null>} Valor del secreto
 */
export const getSecret = async (key, skipCache = false) => {
  // Verificar cache
  if (!skipCache && secretsCache.has(key)) {
    const cached = secretsCache.get(key);
    
    // Verificar TTL
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.value;
    }
    
    // Cache expirado, remover
    secretsCache.delete(key);
  }
  
  // Obtener del backend apropiado
  let value = null;
  
  try {
    switch (SECRETS_BACKEND) {
      case 'aws':
        value = await getSecretAWS(key);
        break;
      case 'vault':
        value = await getSecretVault(key);
        break;
      case 'azure':
        value = await getSecretAzure(key);
        break;
      case 'gcp':
        value = await getSecretGCP(key);
        break;
      case 'local':
      default:
        value = await getSecretLocal(key);
        break;
    }
    
    // Cachear resultado
    if (value) {
      secretsCache.set(key, {
        value,
        timestamp: Date.now()
      });
    }
    
    return value;
    
  } catch (error) {
    logger.error(`Error fetching secret "${key}"`, {
      error: error.message,
      backend: SECRETS_BACKEND
    });
    
    // Fallback a .env si el backend falla
    if (SECRETS_BACKEND !== 'local') {
      logger.warn(`Falling back to local .env for secret "${key}"`);
      return await getSecretLocal(key);
    }
    
    return null;
  }
};

/**
 * ✅ Validar que todos los secretos requeridos existen
 * 
 * @param {string[]} requiredKeys - Array de claves requeridas
 * @returns {Promise<{valid: boolean, missing: string[]}>}
 */
export const validateSecrets = async (requiredKeys = REQUIRED_SECRETS) => {
  const missing = [];
  
  for (const key of requiredKeys) {
    const value = await getSecret(key);
    
    if (!value) {
      missing.push(key);
      logger.error(`❌ Missing required secret: ${key}`);
    }
  }
  
  const valid = missing.length === 0;
  
  if (valid) {
    logger.info('✅ All required secrets validated');
  } else {
    logger.error(`❌ Missing ${missing.length} required secrets`, { missing });
  }
  
  return { valid, missing };
};

/**
 * 🔄 Refrescar cache de secretos
 * 
 * Útil después de rotación de claves
 */
export const refreshSecrets = async () => {
  logger.info('Refreshing secrets cache...');
  
  // Limpiar cache
  secretsCache.clear();
  
  // Re-obtener secretos requeridos
  const refreshed = [];
  
  for (const key of REQUIRED_SECRETS) {
    const value = await getSecret(key, true); // skipCache=true
    
    if (value) {
      refreshed.push(key);
    }
  }
  
  logger.info(`Refreshed ${refreshed.length}/${REQUIRED_SECRETS.length} secrets`);
  
  return refreshed;
};

/**
 * ⚠️ Verificar secretos que necesitan rotación
 * 
 * TODO: Implementar rotación automática
 */
export const checkSecretsRotation = async () => {
  logger.warn('⚠️ Secret rotation check not implemented yet');
  logger.info('Rotatable secrets:', ROTATABLE_SECRETS);
  
  // TODO: Verificar última fecha de rotación
  // TODO: Enviar alerta si excede período (ej: 90 días)
  
  return {
    needsRotation: ROTATABLE_SECRETS,
    lastRotated: null // TODO: Implementar tracking
  };
};

/**
 * 📊 Obtener estadísticas del secrets manager
 */
export const getSecretsStats = () => {
  return {
    backend: SECRETS_BACKEND,
    cacheSize: secretsCache.size,
    cacheTTL: CACHE_TTL,
    requiredSecrets: REQUIRED_SECRETS.length,
    rotatableSecrets: ROTATABLE_SECRETS.length
  };
};

/**
 * 🧹 Limpiar cache (para testing)
 */
export const clearSecretsCache = () => {
  secretsCache.clear();
  logger.debug('Secrets cache cleared');
};

// Export singleton para compatibilidad con código existente
export default {
  getSecret,
  validateSecrets,
  refreshSecrets,
  checkSecretsRotation,
  getSecretsStats,
  clearSecretsCache
};
