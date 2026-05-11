// backend/workers/clinicalWorker.js
import { startAppointmentReminderService } from '../services/appointmentReminderService.js';
import { startFollowUpService } from '../services/followUpService.js';
import { startMedicalAlertService } from '../services/medicalAlertService.js';
import { clinicalMetrics } from '../services/ClinicalMetrics.js';
import { circuitBreakerRegistry } from '../services/CircuitBreaker.js';
import logger from '../utils/logger.js';
import { getAutomationConfig } from '../services/automationConfig.js';

class ClinicalWorker {
  constructor() {
    this.services = {};
    this.config = getAutomationConfig();
    this.running = false;
  }

  /**
   * Start all clinical automation services
   */
  start() {
    if (!this.config.enabled) {
      logger.warn('⚠️ Clinical automation is disabled via configuration');
      return;
    }

    logger.info('🏥 Starting Clinical Worker Services...');
    
    try {
      // Start all services
      this.services.reminders = startAppointmentReminderService();
      this.services.followUps = startFollowUpService();
      this.services.alerts = startMedicalAlertService();
      
      this.running = true;
      
      logger.info('✅ Clinical Worker Services started successfully');
      logger.info('📋 Active services:', Object.keys(this.services));
      
      // Log metrics periodically
      setInterval(() => {
        if (this.running) {
          logger.info('📊 Current Clinical Metrics:', clinicalMetrics.getMetrics());
        }
      }, 60000); // Log metrics every minute
      
    } catch (error) {
      logger.error('❌ Failed to start Clinical Worker Services:', error);
      throw error;
    }
  }

  /**
   * Stop all clinical automation services
   */
  stop() {
    logger.info('🛑 Stopping Clinical Worker Services...');
    
    try {
      // Stop all scheduled tasks
      Object.values(this.services).forEach(service => {
        Object.values(service).forEach(job => {
          if (job && typeof job.stop === 'function') {
            job.stop();
          }
        });
      });
      
      this.running = false;
      logger.info('✅ Clinical Worker Services stopped successfully');
    } catch (error) {
      logger.error('❌ Error stopping Clinical Worker Services:', error);
    }
  }

  /**
   * Get current status of all services
   */
  getStatus() {
    return {
      running: this.running,
      config: this.config,
      services: Object.keys(this.services),
      metrics: clinicalMetrics.getMetrics(),
      circuitBreakers: circuitBreakerRegistry.getAllStatus(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Reset all circuit breakers (useful for recovery)
   */
  resetCircuitBreakers() {
    logger.info('🔄 Manually resetting all circuit breakers');
    circuitBreakerRegistry.resetAll();
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    logger.info('🔄 Resetting clinical metrics');
    clinicalMetrics.resetMetrics();
  }
}

// Create and export singleton instance
export const clinicalWorker = new ClinicalWorker();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info(' RECEIVED SIGTERM, shutting down gracefully');
  clinicalWorker.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info(' RECEIVED SIGINT, shutting down gracefully');
  clinicalWorker.stop();
  process.exit(0);
});

// Export default for direct execution
export default clinicalWorker;