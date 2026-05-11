// backend/services/ResilientTaskRunner.js
import logger from '../utils/logger.js';
import { clinicalMetrics } from './ClinicalMetrics.js';
import { circuitBreakerRegistry } from './CircuitBreaker.js';

// Simple in-memory store for tracking executed tasks (would use Redis in production)
class TaskTracker {
  constructor() {
    this.executedTasks = new Map(); // Store executed tasks to prevent duplicates
  }

  // Generate a unique key for idempotency
  generateTaskKey(taskType, entityId, scheduledDate) {
    return `${taskType}_${entityId}_${new Date(scheduledDate).toISOString().split('T')[0]}`;
  }

  // Check if task was already executed
  isExecuted(taskKey) {
    return this.executedTasks.has(taskKey);
  }

  // Mark task as executed
  markExecuted(taskKey) {
    this.executedTasks.set(taskKey, new Date());
    
    // Clean up old entries after some time (would use Redis TTL in production)
    setTimeout(() => {
      this.executedTasks.delete(taskKey);
    }, 24 * 60 * 60 * 1000); // 24 hours
  }
}

export const taskTracker = new TaskTracker();

// Calculate exponential backoff with jitter
const calculateBackoffWithJitter = (attempt, baseDelay = 1000, maxDelay = 30000) => {
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  
  // Add jitter: random value between 0 and 1, multiplied by exponential delay
  const jitter = Math.random() * exponentialDelay;
  
  // Apply the jitter to the exponential delay
  const delayWithJitter = exponentialDelay + jitter;
  
  // Cap the delay at maxDelay
  return Math.min(delayWithJitter, maxDelay);
};

// Execute a task with retry logic
export const executeTaskWithRetry = async (
  taskFunction, 
  taskType, 
  entityId, 
  options = {}
) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    critical = false,  // If true, bypasses circuit breaker
    scheduledDate = new Date()
  } = options;

  // Generate a unique key for idempotency
  const taskKey = taskTracker.generateTaskKey(taskType, entityId, scheduledDate);
  
  // Check if task was already executed to prevent duplicates
  if (taskTracker.isExecuted(taskKey)) {
    logger.info(`🔄 Task ${taskType} for entity ${entityId} already executed, skipping duplicate`);
    return { success: true, skipped: true, reason: 'Duplicate execution prevented' };
  }

  // Select appropriate circuit breaker based on task type
  const breaker = circuitBreakerRegistry.get(
    critical ? 'critical-alerts' : 'standard-automations',
    {
      failureThreshold: critical ? 10 : 5,  // Higher threshold for critical tasks
      resetTimeout: critical ? 60000 : 30000, // Longer reset time for critical
      importantTypes: ['suicide_risk', 'high_depression'] // Critical alert types
    }
  );

  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Try to execute through circuit breaker if not critical
      let result;
      if (critical) {
        // Critical tasks bypass circuit breaker
        result = await taskFunction();
      } else {
        // Non-critical tasks go through circuit breaker
        result = await breaker.fire(taskFunction, taskType.split('_')[0]); // Extract type from task type
      }
      
      // If successful, mark task as executed and return result
      taskTracker.markExecuted(taskKey);
      clinicalMetrics.incrementSuccess(taskType);
      
      logger.info(`✅ Task ${taskType} for entity ${entityId} completed successfully on attempt ${attempt + 1}`);
      
      return { 
        success: true, 
        result, 
        attempts: attempt + 1,
        skipped: false
      };
    } catch (error) {
      lastError = error;
      clinicalMetrics.incrementFailure(taskType);
      
      logger.error(`❌ Task ${taskType} for entity ${entityId} failed on attempt ${attempt + 1}:`, error.message);
      
      // If this was the last attempt, break the loop
      if (attempt === maxRetries) {
        break;
      }
      
      // Calculate delay with exponential backoff and jitter
      const delay = calculateBackoffWithJitter(attempt, baseDelay, maxDelay);
      clinicalMetrics.incrementRetry(taskType);
      
      logger.info(`⏳ Retrying task ${taskType} for entity ${entityId} in ${delay}ms (attempt ${attempt + 2}/${maxRetries + 1})`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // If we reach here, all retries have failed
  clinicalMetrics.incrementDLQ(taskType);
  
  logger.error(`🚨 Task ${taskType} for entity ${entityId} failed after ${maxRetries + 1} attempts, moving to dead letter queue`);
  
  return {
    success: false,
    error: lastError,
    attempts: maxRetries + 1,
    skipped: false
  };
};

// Enhanced scheduling function with resilience features
export const scheduleResilientTask = async (expression, taskName, taskFn, options = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    critical = false,
    taskType = taskName.toLowerCase().replace(/\s+/g, '_'),
    entityIdField = null  // Field in booking/alert object to use as entity ID
  } = options;

  // Dynamically import node-cron to avoid potential circular dependencies
  const cron = (await import('node-cron')).default;
  
  let isRunning = false;

  return cron.schedule(
    expression,
    async () => {
      if (isRunning) {
        logger.warn(`⚠️ Task ${taskName} is still running, skipping concurrent execution`);
        return;
      }

      isRunning = true;
      const startTime = Date.now();
      
      try {
        // Wrap the task function to add metrics and resilience
        const resilientTask = async () => {
          // Track execution time when finished
          const taskResult = await taskFn();
          
          const executionTime = Date.now() - startTime;
          clinicalMetrics.addExecutionTime(taskType, executionTime);
          
          logger.debug(`⏱️ Task ${taskName} completed in ${executionTime}ms`);
          
          return taskResult;
        };
        
        // Execute with retry logic
        const result = await executeTaskWithRetry(
          resilientTask,
          taskType,
          'batch_operation', // Default entity ID for batch operations
          { maxRetries, baseDelay, maxDelay, critical }
        );
        
        if (!result.success && !result.skipped) {
          logger.error(`💀 Task ${taskName} failed permanently after all retries`);
        }
      } catch (error) {
        logger.error(`💥 Unexpected error in task ${taskName}:`, error);
      } finally {
        isRunning = false;
      }
    },
    { 
      timezone: process.env.AUTOMATION_TIMEZONE || 'America/Bogota' 
    }
  );
};

export default { 
  executeTaskWithRetry, 
  scheduleResilientTask, 
  taskTracker,
  circuitBreakerRegistry,
  clinicalMetrics 
};