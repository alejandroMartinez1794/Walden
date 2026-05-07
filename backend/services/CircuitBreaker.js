// backend/services/CircuitBreaker.js
import logger from '../utils/logger.js';
import { clinicalMetrics } from './ClinicalMetrics.js';

class CircuitBreakerState {
  static CLOSED = 'CLOSED'; // Normal operation
  static OPEN = 'OPEN';     // Trip - stop processing
  static HALF_OPEN = 'HALF_OPEN'; // Test if we can close
}

class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 5; // Failures before opening
    this.timeout = options.timeout || 60000; // Ms to wait before half-open
    this.resetTimeout = options.resetTimeout || 30000; // Ms to stay open before trying to reset
    this.importantTypes = options.importantTypes || ['suicide_risk', 'high_depression']; // Types that bypass circuit
    
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttempt = null;
    
    // Track execution statistics
    this.executions = [];
  }

  // Check if a request should be allowed
  async fire(fn, type) {
    // Allow critical alerts to bypass circuit breaker
    if (type && this.importantTypes.includes(type)) {
      return await fn();
    }

    if (this.state === CircuitBreakerState.OPEN) {
      // Check if timeout has passed
      if (Date.now() >= this.nextAttempt) {
        this.state = CircuitBreakerState.HALF_OPEN;
        logger.warn(`⚠️ Circuit breaker ${this.name} in HALF_OPEN state`);
      } else {
        clinicalMetrics.incrementTotalDropped();
        throw new Error(`Circuit breaker ${this.name} is OPEN. Request blocked.`);
      }
    }

    try {
      const result = await fn();
      
      // Success case
      if (this.state === CircuitBreakerState.HALF_OPEN) {
        // Success in half-open state means we can close the circuit
        this.close();
        logger.info(`✅ Circuit breaker ${this.name} closed after successful execution`);
      }
      
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  onFailure(error) {
    this.failureCount++;
    this.lastFailureTime = new Date();
    
    logger.error(`❌ Circuit breaker ${this.name} failure #${this.failureCount}`, error.message);

    // If we've exceeded threshold, open the circuit
    if (this.failureCount >= this.failureThreshold) {
      this.open();
    }
  }

  open() {
    this.state = CircuitBreakerState.OPEN;
    this.nextAttempt = Date.now() + this.resetTimeout;
    logger.error(`🚨 Circuit breaker ${this.name} is NOW OPEN. All non-critical requests blocked.`);
  }

  close() {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    logger.info(`✅ Circuit breaker ${this.name} is NOW CLOSED. Normal operation resumed.`);
  }

  // Get current status of the circuit breaker
  getStatus() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      nextAttempt: this.nextAttempt,
      isOpen: this.state === CircuitBreakerState.OPEN,
      isClosed: this.state === CircuitBreakerState.CLOSED,
      isHalfOpen: this.state === CircuitBreakerState.HALF_OPEN,
    };
  }

  // Reset the circuit breaker manually
  reset() {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttempt = null;
    logger.info(`🔄 Circuit breaker ${this.name} was manually reset`);
  }
}

// Create a registry of circuit breakers for different automation types
class CircuitBreakerRegistry {
  constructor() {
    this.breakers = new Map();
  }

  // Get or create a circuit breaker
  get(name, options = {}) {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker(name, options));
    }
    return this.breakers.get(name);
  }

  // Get status of all circuit breakers
  getAllStatus() {
    const status = {};
    for (const [name, breaker] of this.breakers) {
      status[name] = breaker.getStatus();
    }
    return status;
  }

  // Reset a specific circuit breaker
  reset(name) {
    const breaker = this.breakers.get(name);
    if (breaker) {
      breaker.reset();
    }
  }

  // Reset all circuit breakers
  resetAll() {
    for (const [, breaker] of this.breakers) {
      breaker.reset();
    }
  }
}

// Export singleton instance
export const circuitBreakerRegistry = new CircuitBreakerRegistry();

export default circuitBreakerRegistry;