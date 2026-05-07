#!/usr/bin/env node

// backend/start-clinical-worker.js
import { clinicalWorker } from './workers/clinicalWorker.js';
import logger from './utils/logger.js';

// Initialize the clinical worker
try {
  logger.info('🏥 Starting Clinical Automation Worker...');
  clinicalWorker.start();
  
  logger.info('✅ Clinical Automation Worker started successfully!');
  logger.info('🔧 The worker is now handling:');
  logger.info('   - Appointment reminders');
  logger.info('   - Post-session follow-ups');
  logger.info('   - Clinical risk alerts');
  logger.info('   - Patient health metrics reminders');
  logger.info('   - Pattern detection for clinical risks');
  logger.info('');
  logger.info('📊 Metrics and status available at /api/v1/health/clinical endpoints');
} catch (error) {
  logger.error('❌ Failed to start Clinical Automation Worker:', error);
  process.exit(1);
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info(' RECEIVED SIGTERM SIGNAL');
  clinicalWorker.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info(' RECEIVED SIGINT SIGNAL');
  clinicalWorker.stop();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  clinicalWorker.stop();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  clinicalWorker.stop();
  process.exit(1);
});