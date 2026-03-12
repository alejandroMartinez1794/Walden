/**
 * Redis Cache Service
 *
 * Heroku provides Redis through the Heroku Data for Redis addon (free with Student Pack credits)
 * Local development: Use Docker (docker run -d -p 6379:6379 redis:alpine)
 *
 * Benefits:
 * - Faster response times for frequently accessed data
 * - Reduced database load
 * - Better scalability
 */

import { createClient } from 'redis';
import logger from './logger.js';

let client = null;
let isConnected = false;

/**
 * Initialize Redis client
 * Gracefully handles missing REDIS_URL (development without Redis)
 */
export async function initRedis() {
  // Skip Redis in test environment
  if (process.env.NODE_ENV === 'test') {
    logger.info('Redis: Disabled (test environment)');
    return null;
  }

  // Skip if no Redis URL configured (optional dependency)
  if (!process.env.REDIS_URL) {
    logger.warn('Redis: Not configured (REDIS_URL missing) - Running without cache');
    return null;
  }

  try {
    client = createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 10000,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis: Max reconnection attempts reached');
            return new Error('Redis connection failed');
          }
          return Math.min(retries * 100, 3000); // Exponential backoff
        },
      },
    });

    // Event handlers
    client.on('error', (err) => {
      logger.error('Redis Client Error', { error: err.message });
      isConnected = false;
    });

    client.on('connect', () => {
      logger.info('Redis: Connecting...');
    });

    client.on('ready', () => {
      logger.info('Redis: Connected successfully');
      isConnected = true;
    });

    client.on('reconnecting', () => {
      logger.warn('Redis: Reconnecting...');
      isConnected = false;
    });

    // Connect to Redis
    await client.connect();
    
    return client;
    
  } catch (error) {
    logger.error('Redis: Failed to initialize', { error: error.message });
    client = null;
    isConnected = false;
    return null;
  }
}

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Parsed JSON value or null
 */
export async function getCache(key) {
  if (!client || !isConnected) {
    return null; // Cache miss if Redis not available
  }

  try {
    const value = await client.get(key);
    if (!value) {
      return null;
    }
    return JSON.parse(value);
  } catch (error) {
    logger.error('Redis getCache error', { key, error: error.message });
    return null; // Fail gracefully
  }
}

/**
 * Set value in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache (will be JSON stringified)
 * @param {number} ttl - Time to live in seconds (default: 1 hour)
 * @returns {Promise<boolean>} Success status
 */
export async function setCache(key, value, ttl = 3600) {
  if (!client || !isConnected) {
    return false; // Skip if Redis not available
  }

  try {
    await client.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.error('Redis setCache error', { key, error: error.message });
    return false;
  }
}

/**
 * Delete key from cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} Success status
 */
export async function delCache(key) {
  if (!client || !isConnected) {
    return false;
  }

  try {
    await client.del(key);
    return true;
  } catch (error) {
    logger.error('Redis delCache error', { key, error: error.message });
    return false;
  }
}

/**
 * Delete keys matching pattern
 * @param {string} pattern - Key pattern (e.g., 'doctors:*')
 * @returns {Promise<number>} Number of keys deleted
 */
export async function delCachePattern(pattern) {
  if (!client || !isConnected) {
    return 0;
  }

  try {
    const keys = await client.keys(pattern);
    if (keys.length === 0) {
      return 0;
    }
    await client.del(keys);
    return keys.length;
  } catch (error) {
    logger.error('Redis delCachePattern error', { pattern, error: error.message });
    return 0;
  }
}

/**
 * Increment counter
 * Useful for rate limiting, analytics
 * @param {string} key - Counter key
 * @param {number} ttl - Optional TTL for counter expiration
 * @returns {Promise<number>} New counter value
 */
export async function incrementCounter(key, ttl = null) {
  if (!client || !isConnected) {
    return 0;
  }

  try {
    const value = await client.incr(key);
    if (ttl && value === 1) {
      // Set TTL only on first increment
      await client.expire(key, ttl);
    }
    return value;
  } catch (error) {
    logger.error('Redis incrementCounter error', { key, error: error.message });
    return 0;
  }
}

/**
 * Check if Redis is available and connected
 * @returns {boolean}
 */
export function isRedisAvailable() {
  return isConnected && client !== null;
}

/**
 * Gracefully close Redis connection
 */
export async function closeRedis() {
  if (client) {
    try {
      await client.quit();
      logger.info('Redis: Connection closed');
    } catch (error) {
      logger.error('Redis: Error closing connection', { error: error.message });
    }
  }
}

export default {
  initRedis,
  getCache,
  setCache,
  delCache,
  delCachePattern,
  incrementCounter,
  isRedisAvailable,
  closeRedis,
};

/**
 * USAGE EXAMPLES:
 * 
 * 1. Cache frequently accessed data:
 *    const doctors = await getCache('doctors:all');
 *    if (!doctors) {
 *      const fresh = await Doctor.find().lean();
 *      await setCache('doctors:all', fresh, 600); // 10 min TTL
 *      return fresh;
 *    }
 *    return doctors;
 * 
 * 2. Invalidate cache on update:
 *    await Doctor.findByIdAndUpdate(id, updates);
 *    await delCachePattern('doctors:*');
 * 
 * 3. Rate limiting:
 *    const attempts = await incrementCounter(`login:${ip}`, 3600);
 *    if (attempts > 5) {
 *      throw new Error('Too many attempts');
 *    }
 * 
 * 4. User-specific cache:
 *    const cacheKey = `user:${userId}:bookings`;
 *    const bookings = await getCache(cacheKey);
 *    if (!bookings) {
 *      const fresh = await Booking.find({ user: userId }).lean();
 *      await setCache(cacheKey, fresh, 300); // 5 min TTL
 *      return fresh;
 *    }
 * 
 * CACHE KEYS CONVENTION:
 * - doctors:all - All doctors list
 * - doctors:approved - Approved doctors
 * - doctor:{id} - Single doctor profile
 * - user:{id} - User profile
 * - user:{id}:bookings - User's bookings
 * - bookings:upcoming - Upcoming bookings dashboard
 * - config:* - System configuration
 * 
 * SETUP INSTRUCTIONS:
 * 
 * 1. Local development with Docker:
 *    docker run -d -p 6379:6379 --name redis redis:alpine
 * 
 * 2. Heroku (Production):
 *    - Add Heroku Data for Redis addon in Heroku dashboard
 *    - REDIS_URL is automatically set by Heroku
 *
 * 3. Add to .env:
 *    REDIS_URL=redis://localhost:6379
 *    # Heroku: redis://default:password@host:port
 * 
 * 4. Initialize in index.js:
 *    import { initRedis, closeRedis } from './utils/cache.js';
 *    await initRedis();
 *    
 *    // Graceful shutdown
 *    process.on('SIGTERM', async () => {
 *      await closeRedis();
 *      process.exit(0);
 *    });
 */
