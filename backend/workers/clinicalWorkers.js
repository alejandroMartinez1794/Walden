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

export function scheduleClinicalWorkersStart(delayMs = 5000) {
  if (workersTimer) {
    clearTimeout(workersTimer);
  }

  workersTimer = setTimeout(() => {
    if (mongoose.connection.readyState !== 1) {
      logger.warn('   ⚠ Workers clinicos no iniciados: MongoDB aun no esta listo. Reintentando...');
      workersTimer = null;
      scheduleClinicalWorkersStart(delayMs);
      return;
    }

    workersTimer = null;
    startWorkersNow();
  }, delayMs);
}

export async function stopClinicalWorkers() {
  if (workersTimer) {
    clearTimeout(workersTimer);
    workersTimer = null;
  }

  // Los workers actuales no exponen stop handlers, solo evitamos nuevos arranques.
  workersStarted = false;
}
