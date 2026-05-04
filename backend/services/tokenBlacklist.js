/**
 * 🔐 TOKEN BLACKLIST SERVICE
 * 
 * Sistema de invalidación de JWT tokens para logout seguro
 * 
 * ¿Por qué es necesario?
 * - JWT tokens son stateless - no se pueden "revocar" por diseño
 * - Cuando un usuario hace logout, el token sigue siendo válido hasta expirar
 * - Riesgo de seguridad si el token es robado
 * 
 * Soluciones:
 * 1. Token blacklist en memoria (simple, pero se pierde al reiniciar)
 * 2. Token blacklist en Redis (óptimo, persistente y rápido)
 * 3. Token blacklist en MongoDB (alternativa si no hay Redis)
 * 
 * Esta implementación usa un híbrido:
 * - Memoria (rápido para checks)
 * - MongoDB (backup persistente)
 */

import mongoose from 'mongoose';
import logger from '../utils/logger.js';

// ========================================
// SCHEMA MONGODB
// ========================================

const BlacklistedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  reason: {
    type: String,
    enum: ['LOGOUT', 'PASSWORD_CHANGE', 'SECURITY_BREACH', 'ADMIN_REVOKE', '2FA_CHANGE'],
    default: 'LOGOUT'
  },
  
  blacklistedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  expiresAt: {
    type: Date,
    required: true
  }
});

// TTL Index: Auto-delete tokens expirados
// Los tokens ya no son válidos después de expiration
BlacklistedTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const BlacklistedToken = mongoose.model('BlacklistedToken', BlacklistedTokenSchema);

// ========================================
// IN-MEMORY CACHE
// ========================================

class TokenBlacklistCache {
  constructor() {
    // Set para búsquedas O(1)
    this.blacklist = new Set();
    
    // Map para TTL (auto-limpieza)
    this.ttlMap = new Map();
    
    // Limpieza periódica cada 5 minutos
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    this.cleanupInterval.unref?.();
  }

  add(token, expiresAt) {
    this.blacklist.add(token);
    this.ttlMap.set(token, new Date(expiresAt).getTime());
  }

  has(token) {
    // Verificar si existe Y si no ha expirado
    if (!this.blacklist.has(token)) return false;
    
    const expiry = this.ttlMap.get(token);
    if (Date.now() > expiry) {
      // Ya expiró, remover
      this.blacklist.delete(token);
      this.ttlMap.delete(token);
      return false;
    }
    
    return true;
  }

  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [token, expiry] of this.ttlMap.entries()) {
      if (now > expiry) {
        this.blacklist.delete(token);
        this.ttlMap.delete(token);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.info(`🧹 Cleaned ${cleaned} expired tokens from blacklist cache`);
    }
  }

  size() {
    return this.blacklist.size;
  }

  clear() {
    this.blacklist.clear();
    this.ttlMap.clear();
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// Singleton cache
const cache = new TokenBlacklistCache();

// ========================================
// PUBLIC API
// ========================================

/**
 * Agregar token a la blacklist
 * 
 * @param {string} token - JWT token a invalidar
 * @param {string} userId - ID del usuario dueño del token
 * @param {Date} expiresAt - Fecha de expiración del token
 * @param {string} reason - Razón de la invalidación
 */
export const blacklistToken = async (token, userId, expiresAt, reason = 'LOGOUT') => {
  try {
    // 1. Agregar a cache (inmediato)
    cache.add(token, expiresAt);
    
    // 2. Persistir en MongoDB (async, no bloquea)
    await BlacklistedToken.create({
      token,
      userId,
      reason,
      expiresAt
    });
    
    logger.info(`🚫 Token blacklisted: ${reason} for user ${userId}`);
    return true;
  } catch (error) {
    // Si es error de duplicado, ignorar (ya está blacklisted)
    if (error.code === 11000) {
      logger.warn('⚠️ Token already blacklisted');
      return true;
    }
    
    logger.error('❌ Error blacklisting token:', error);
    return false;
  }
};

/**
 * Verificar si un token está blacklisted
 * 
 * @param {string} token - JWT token a verificar
 * @returns {boolean} true si está blacklisted
 */
export const isTokenBlacklisted = async (token) => {
  // 1. Check rápido en cache
  if (cache.has(token)) {
    return true;
  }
  
  // 2. Fallback a MongoDB (por si el cache se reinició)
  try {
    const blacklisted = await BlacklistedToken.findOne({
      token,
      expiresAt: { $gt: new Date() } // Solo tokens NO expirados
    });
    
    if (blacklisted) {
      // Agregar a cache para futuros checks
      cache.add(token, blacklisted.expiresAt);
      return true;
    }
    
    return false;
  } catch (error) {
    logger.error('❌ Error checking token blacklist:', error);
    // En caso de error, asumir que NO está blacklisted (fail-open)
    // Alternativa: fail-closed (rechazar todo en caso de error)
    return false;
  }
};

/**
 * Invalidar TODOS los tokens de un usuario
 * Útil cuando:
 * - Usuario cambia contraseña
 * - Se detecta actividad sospechosa
 * - Admin revoca acceso
 * 
 * @param {string} userId - ID del usuario
 * @param {string} reason - Razón de la invalidación
 */
export const blacklistAllUserTokens = async (userId, reason = 'SECURITY_BREACH') => {
  try {
    // Encontrar todos los tokens activos del usuario
    const activeTokens = await BlacklistedToken.find({
      userId,
      expiresAt: { $gt: new Date() }
    });
    
    logger.info(`🚫 Blacklisting ${activeTokens.length} tokens for user ${userId}: ${reason}`);
    
    // Marcar como blacklisted con la nueva razón
    await BlacklistedToken.updateMany(
      { userId, expiresAt: { $gt: new Date() } },
      { $set: { reason, blacklistedAt: new Date() } }
    );
    
    // Actualizar cache
    for (const tokenDoc of activeTokens) {
      cache.add(tokenDoc.token, tokenDoc.expiresAt);
    }
    
    return true;
  } catch (error) {
    logger.error('❌ Error blacklisting all user tokens:', error);
    return false;
  }
};

/**
 * Limpiar tokens expirados manualmente
 * (MongoDB TTL lo hace automáticamente, pero esto es útil para testing)
 */
export const cleanupExpiredTokens = async () => {
  try {
    const result = await BlacklistedToken.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    
    logger.info(`🧹 Cleaned ${result.deletedCount} expired tokens from database`);
    return result.deletedCount;
  } catch (error) {
    logger.error('❌ Error cleaning expired tokens:', error);
    return 0;
  }
};

/**
 * Obtener estadísticas de la blacklist
 */
export const getBlacklistStats = async () => {
  try {
    const totalBlacklisted = await BlacklistedToken.countDocuments();
    const byReason = await BlacklistedToken.aggregate([
      { $group: { _id: '$reason', count: { $sum: 1 } } }
    ]);
    
    return {
      totalBlacklisted,
      cacheSize: cache.size(),
      byReason
    };
  } catch (error) {
    logger.error('❌ Error getting blacklist stats:', error);
    return null;
  }
};

/**
 * Destruir el cache (útil para testing/cleanup)
 * Limpia el interval y vacía la memoria
 */
export const destroyTokenBlacklistCache = () => {
  cache.destroy();
};

// Cleanup al shutdown
process.on('SIGTERM', () => {
  cache.destroy();
});

process.on('SIGINT', () => {
  cache.destroy();
});

export default {
  blacklistToken,
  isTokenBlacklisted,
  blacklistAllUserTokens,
  cleanupExpiredTokens,
  getBlacklistStats,
  destroyTokenBlacklistCache
};
