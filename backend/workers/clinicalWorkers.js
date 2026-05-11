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
  if (workersStarted) return;

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
  };

  workersTimer = setInterval(attemptStart, delayMs);
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
