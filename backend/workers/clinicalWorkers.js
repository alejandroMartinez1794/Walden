import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import { startAppointmentReminderService } from '../services/appointmentReminderService.js';
import { startMedicalAlertService } from '../services/medicalAlertService.js';
import { startFollowUpService } from '../services/followUpService.js';

let workersStarted = false;
let workersTimer = null;

function startWorkersNow() {
  if (workersStarted) return;

  workersStarted = true;
  logger.info('\n🤖 [6/6] Activando servicios de automatizacion...');
  logger.info('   ✓ Recordatorios de citas');
  logger.info('   ✓ Alertas medicas criticas');
  logger.info('   ✓ Seguimiento post-sesion');

  startAppointmentReminderService();
  startMedicalAlertService();
  startFollowUpService();

  logger.info('\n═══════════════════════════════════════════════════════');
  logger.info('✅ BACKEND LISTO PARA TRABAJAR');
  logger.info('═══════════════════════════════════════════════════════\n');
}

export function scheduleClinicalWorkersStart(delayMs = 5000, callbacks = {}) {
  const {
    onScheduled,
    onStarted,
  } = callbacks;

  const isLocalEnv = process.env.SECURITY_TIER === 'local' ||
    process.env.SECURITY_TIER === 'dev' ||
    process.env.NODE_ENV === 'test';

  if (workersStarted) return;

  if (isLocalEnv && mongoose.connection.readyState !== 1) {
    logger.info('   ⚠ Workers clinicos omitidos en entorno local sin MongoDB');
    onScheduled?.({ scheduled: false, skipped: true, reason: 'mongo-unavailable-local' });
    return;
  }

  if (workersTimer) {
    clearInterval(workersTimer);
  }

  const attemptStart = () => {
    if (workersStarted) {
      clearInterval(workersTimer);
      workersTimer = null;
      return;
    }

    if (mongoose.connection.readyState !== 1) {
      logger.warn('   ⚠ Workers clinicos no iniciados: MongoDB aun no esta listo. Reintentando...');
      return;
    }

    clearInterval(workersTimer);
    workersTimer = null;
    startWorkersNow();
    onStarted?.({ started: true, delayMs });
  };

  workersTimer = setInterval(attemptStart, delayMs);
  onScheduled?.({ scheduled: true, delayMs });
  attemptStart();
}

export async function stopClinicalWorkers() {
  if (workersTimer) {
    clearInterval(workersTimer);
    workersTimer = null;
  }

  // Los workers actuales no exponen stop handlers, solo evitamos nuevos arranques.
  workersStarted = false;
}
