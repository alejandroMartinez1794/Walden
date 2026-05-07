/**
 * Advanced Adaptive Rate Limiting with Redis
 * 
 * Benefits over in-memory rate limiting:
 * - Works across multiple server instances (horizontal scaling)
 * - Persists between restarts
 * - More accurate limiting
 * - Better DoS protection
 * - Adaptive limits based on request type and user role
 * 
 * If Redis is not available, falls back to in-memory rate limiting
 */

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import logger from './logger.js';

let redisClient = null;
let isRedisAvailable = false;
let _rateLimitRedisErrorLogged = false;

/**
 * Initialize Redis client for rate limiting
 * Separate from cache.js client for isolation
 */
async function initRateLimitRedis() {
  if (process.env.NODE_ENV === 'test' || !process.env.REDIS_URL) {
    return null;
  }

  try {
    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 5000,
        // Disable automatic reconnects for the rate-limit client so failures are handled deterministically
        reconnectStrategy: false,
      },
    });

    // Log Redis connection errors
    redisClient.on('error', (err) => {
      logger.warn('Rate limit Redis error (falling back to memory)', { error: err.message });
      isRedisAvailable = false;
      // Mark client as unusable; avoid calling quit() here since the client may already be closed
      redisClient = null;
    });

    redisClient.on('ready', () => {
      isRedisAvailable = true;
      logger.info('Rate limit Redis: Connected');
    });

    // Attempt to connect, but if it fails quickly, fall back to in-memory limiter.
    // Attempt to connect, but catch any rejection explicitly to avoid unhandled AggregateError
    try {
      await redisClient.connect();
    } catch (connErr) {
      logger.warn('Rate limit Redis: connection failed (using in-memory)', { error: connErr?.message || String(connErr) });
      try {
        if (redisClient && typeof redisClient.quit === 'function') {
          await redisClient.quit();
        }
      } catch (e) {
        // ignore
      }
      redisClient = null;
      return null;
    }

    // Verify client is open
    if (redisClient && redisClient.isOpen) {
      return redisClient;
    }
    // fallback
    if (redisClient && typeof redisClient.quit === 'function') {
      try { await redisClient.quit(); } catch (e) { /* ignore */ }
    }
    redisClient = null;
    return null;
  } catch (error) {
    logger.warn('Rate limit Redis: Not available (using in-memory)', { error: error.message });
    if (redisClient && typeof redisClient.quit === 'function') {
      try { await redisClient.quit(); } catch (e) { /* ignore */ }
    }
    redisClient = null;
    return null;
  }
}

// Initialize on module load
await initRateLimitRedis();

/**
 * Create rate limiter middleware
 * @param {Object} options - Rate limit options
 * @returns {Function} Express middleware
 */
function createRateLimiter(options = {}) {
  // Disable rate limiting during tests
  if (process.env.NODE_ENV === 'test') {
    return (req, res, next) => next();
  }

  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests. Please try again later.',
    },
    ...options,
  };

  // Use Redis store if available, otherwise use in-memory
  if (redisClient && isRedisAvailable) {
    defaultOptions.store = new RedisStore({
      // @ts-expect-error - RedisStore expects a different client type
      client: redisClient,
      prefix: 'rl:', // Rate limit prefix
    });
    logger.info('Rate limiter using Redis store');
  } else {
    logger.info('Rate limiter using in-memory store');
  }

  return rateLimit(defaultOptions);
}

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks
 */
/**
 * Enhanced auth rate limiter with stricter limits and better tracking
 * Prevents brute force attacks with sliding window approach
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes (shorter window for stricter control)
  max: 3, // Max 3 login attempts per IP per window - stricter than before
  skipSuccessfulRequests: true, // Don't count successful logins
  message: {
    success: false,
    message: 'Demasiados intentos de inicio de sesión. Cuenta temporalmente bloqueada por seguridad.',
  },
});

/**
 * Password reset rate limiter
 * Prevents email bombing
 */
export const passwordResetRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Max 3 password reset requests per hour
  message: {
    success: false,
    message: 'Too many password reset requests. Please try again later.',
  },
});

/**
 * General API rate limiter
 * Protects against general abuse
 */
export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per 15 minutes for public tier
  message: {
    success: false,
    message: 'Too many requests from this IP. Please slow down.',
  },
});

/**
 * Strict rate limiter for expensive operations
 * Booking creation, file uploads, etc.
 */
export const strictRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 requests per hour
  message: {
    success: false,
    message: 'Rate limit exceeded for this operation. Please try again later.',
  },
});

/**
 * Clinical endpoints rate limiter
 * Higher limit for clinical operations
 */
export const clinicalRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute for clinical operations
  message: {
    success: false,
    message: 'Too many requests from this IP for clinical operations. Please slow down.',
  },
});

/**
 * Admin endpoints rate limiter
 * Less strict for authenticated admins
 */
export const adminRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Higher limit for admin operations
  message: {
    success: false,
    message: 'Admin rate limit exceeded.',
  },
});

/**
 * Custom rate limiter factory
 * For specific use cases
 */
export const createCustomRateLimiter = (max, windowMinutes = 15, message = null) => {
  return createRateLimiter({
    windowMs: windowMinutes * 60 * 1000,
    max,
    message: message || {
      success: false,
      message: `Too many requests. Limit: ${max} per ${windowMinutes} minutes.`,
    },
  });
};

/**
 * Auth endpoints with 5 req/min limit
 */
/**
 * Auth endpoints with very strict 3 req/5min limit
 */
export const authLimitedRateLimiter = createCustomRateLimiter(3, 5, {
  success: false,
  message: 'Demasiados intentos de autenticación. Por favor espere 5 minutos antes de volver a intentar.'
});

/**
 * Close Redis client on shutdown
 */
export async function closeRateLimitRedis() {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info('Rate limit Redis: Connection closed');
    } catch (error) {
      logger.error('Rate limit Redis: Error closing', { error: error.message });
    }
  }
}

export default {
  authRateLimiter,
  passwordResetRateLimiter,
  apiRateLimiter,
  strictRateLimiter,
  clinicalRateLimiter,
  adminRateLimiter,
  createCustomRateLimiter,
  authLimitedRateLimiter,
  closeRateLimitRedis,
};

/**
 * USAGE EXAMPLES:
 * 
 * 1. Apply to specific routes:
 *    import { authRateLimiter } from './utils/rateLimiter.js';
 *    app.post('/api/v1/auth/login', authRateLimiter, loginController);
 * 
 * 2. Apply globally:
 *    import { apiRateLimiter } from './utils/rateLimiter.js';
 *    app.use('/api/', apiRateLimiter);
 * 
 * 3. Custom rate limiter:
 *    import { createCustomRateLimiter } from './utils/rateLimiter.js';
 *    const uploadLimiter = createCustomRateLimiter(5, 60); // 5 uploads per hour
 *    app.post('/api/v1/upload', uploadLimiter, uploadController);
 * 
 * 4. Different limits for different routes:
 *    app.post('/api/v1/auth/login', authLimitedRateLimiter, loginController); // 5 req/min
 *    app.post('/api/v1/psychology', clinicalRateLimiter, psychologyController); // 100 req/min
 *    app.post('/api/v1/auth/forgot-password', passwordResetRateLimiter, resetController);
 *    app.post('/api/v1/bookings', strictRateLimiter, createBookingController);
 * 
 * MONITORING:
 * - Rate limit hits are logged automatically
 * - Check Redis: `redis-cli KEYS rl:*` to see active limits
 * - Monitor Sentry for rate limit errors
 * - New Relic shows request rate patterns
 * 
 * PRODUCTION NOTES:
 * - Heroku automatically provides REDIS_URL when Heroku Data for Redis addon is added
 * - Cloudflare can provide additional DDoS protection at edge
 * - Consider implementing exponential backoff on client side
 * - Add custom headers to inform clients of rate limit status
 */