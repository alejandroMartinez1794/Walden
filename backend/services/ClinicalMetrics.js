import logger from '../utils/logger.js';

class ClinicalMetrics {
  constructor() {
    this.metrics = {
      clinicalTasks: {
        success: 0,
        failed: 0,
        retried: 0,
        dropped: 0,
      },
      medicalAlerts: {
        success: 0,
        failed: 0,
        retried: 0,
        dropped: 0,
      },
      appointmentReminders: {
        success: 0,
        failed: 0,
        retried: 0,
        dropped: 0,
      },
      followUps: {
        success: 0,
        failed: 0,
        retried: 0,
        dropped: 0,
      },
      general: {
        success: 0,
        failed: 0,
        retried: 0,
        dropped: 0,
      },
      executionTimes: [],
    };

    // Track unique workers to identify if we're in the main process or worker
    this.workerId = Math.random().toString(36).substring(7);
    this.startTime = Date.now();
  }

  incrementSuccess(taskType) {
    if (this.metrics[taskType]) {
      this.metrics[taskType].success += 1;
    } else {
      this.metrics.general.success += 1;
    }
    
    logger.info(`Clinical task succeeded: ${taskType}`, {
      taskType,
      successCount: this.metrics[taskType] ? this.metrics[taskType].success : this.metrics.general.success,
      workerId: this.workerId,
    });
  }

  incrementFailure(taskType) {
    if (this.metrics[taskType]) {
      this.metrics[taskType].failed += 1;
    } else {
      this.metrics.general.failed += 1;
    }
    
    logger.error(`Clinical task failed: ${taskType}`, {
      taskType,
      failureCount: this.metrics[taskType] ? this.metrics[taskType].failed : this.metrics.general.failed,
      workerId: this.workerId,
    });
  }

  incrementRetry(taskType) {
    if (this.metrics[taskType]) {
      this.metrics[taskType].retried += 1;
    } else {
      this.metrics.general.retried += 1;
    }
    
    logger.debug(`Clinical task retry: ${taskType}`, {
      taskType,
      retryCount: this.metrics[taskType] ? this.metrics[taskType].retried : this.metrics.general.retried,
      workerId: this.workerId,
    });
  }

  incrementDropped(taskType) {
    if (this.metrics[taskType]) {
      this.metrics[taskType].dropped += 1;
    } else {
      this.metrics.general.dropped += 1;
    }
    
    logger.warn(`Clinical task dropped: ${taskType}`, {
      taskType,
      dropCount: this.metrics[taskType] ? this.metrics[taskType].dropped : this.metrics.general.dropped,
      workerId: this.workerId,
    });
  }

  incrementDLQ(taskType) {
    this.incrementDropped(taskType);
  }

  addExecutionTime(taskType, durationMs) {
    this.metrics.executionTimes.push({
      taskType,
      durationMs,
      timestamp: new Date().toISOString(),
    });

    if (this.metrics.executionTimes.length > 1000) {
      this.metrics.executionTimes = this.metrics.executionTimes.slice(-1000);
    }
  }

  getMetrics() {
    const uptime = Date.now() - this.startTime;
    
    return {
      ...this.metrics,
      uptime,
      workerId: this.workerId,
      timestamp: new Date().toISOString(),
    };
  }

  resetMetrics() {
    for (const category in this.metrics) {
      if (Array.isArray(this.metrics[category])) {
        this.metrics[category] = [];
        continue;
      }

      for (const metric in this.metrics[category]) {
        this.metrics[category][metric] = 0;
      }
    }
    
    logger.info('Clinical metrics reset', { workerId: this.workerId });
  }

  reset() {
    this.resetMetrics();
  }
}

// Export singleton instance
export const clinicalMetrics = new ClinicalMetrics();

export default clinicalMetrics;