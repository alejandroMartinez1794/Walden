// backend/services/medicalAlertService.js
import Alert from '../models/AlertSchema.js';
import PsychologicalPatient from '../models/PsychologicalPatientSchema.js';
import Doctor from '../models/DoctorSchema.js';
import Measure from '../models/MeasureSchema.js';
import sendEmail from '../utils/emailService.js';
import { getAutomationConfig } from './automationConfig.js';
import { scheduleTask } from './automationScheduler.js';
import logger from '../utils/logger.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 🚨 Enviar notificación de alerta crítica al doctor
 */
const notifyDoctorAboutCriticalAlert = async (alert) => {
  try {
    const patient = await PsychologicalPatient.findById(alert.patient);
    const doctor = await Doctor.findById(alert.clinician);

    if (!doctor?.email) {
      logger.info(`⚠️ No se pudo notificar: doctor sin email`);
      return;
    }

    const severityEmoji = {
      critical: '🔴',
      high: '🟠',
      moderate: '🟡',
      low: '🟢'
    };

    const typeText = {
      suicide_risk: 'Riesgo de Suicidio',
      high_depression: 'Depresión Severa',
      worsening_trend: 'Empeoramiento de Síntomas',
      other: 'Alerta Médica'
    };

    await sendEmail({
      email: doctor.email,
      subject: `🚨 ALERTA ${alert.severity.toUpperCase()}: ${typeText[alert.type]}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 3px solid ${alert.severity === 'critical' ? '#dc2626' : '#f59e0b'};">
          <div style="background-color: ${alert.severity === 'critical' ? '#dc2626' : '#f59e0b'}; color: white; padding: 20px;">
            <h2 style="margin: 0;">${severityEmoji[alert.severity]} ALERTA CLÍNICA</h2>
          </div>
          
          <div style="padding: 20px;">
            <p><strong>Paciente:</strong> ${patient?.name || 'N/A'} (ID: ${patient?._id || 'N/A'})</p>
            <p><strong>Tipo de Alerta:</strong> ${typeText[alert.type]}</p>
            <p><strong>Severidad:</strong> ${alert.severity.toUpperCase()}</p>
            <p><strong>Fecha:</strong> ${new Date(alert.createdAt).toLocaleString('es-CO')}</p>
            
            ${alert.notes ? `
              <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <strong>Notas:</strong><br>
                ${alert.notes}
              </div>
            ` : ''}

            ${alert.mitigation?.urgentAppointment ? `
              <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <strong>⚠️ Se requiere cita urgente</strong>
                ${alert.mitigation.scheduledAt ? `<br>Programada para: ${new Date(alert.mitigation.scheduledAt).toLocaleString('es-CO')}` : ''}
              </div>
            ` : ''}

            <div style="margin-top: 30px; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
              <strong>🎯 Acciones Recomendadas:</strong>
              <ul style="margin: 10px 0;">
                ${alert.severity === 'critical' ? '<li><strong>Contactar al paciente inmediatamente</strong></li>' : ''}
                <li>Revisar el historial clínico del paciente</li>
                <li>Evaluar plan de seguridad y contactos de emergencia</li>
                <li>Considerar derivación si es necesario</li>
                ${alert.mitigation?.urgentAppointment ? '<li><strong>Programar cita de urgencia</strong></li>' : ''}
              </ul>
            </div>

            <p style="margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/doctors/dashboard/psychology" 
                 style="background-color: #0066ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                📊 Ver Dashboard Clínico
              </a>
            </p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p style="margin: 0;">Alerta generada automáticamente por el Sistema Basileiás</p>
            <p style="margin: 5px 0 0 0;">Por favor, tome acción dentro de las próximas 24 horas</p>
          </div>
        </div>
      `
    });

    logger.info(`✅ Alerta crítica notificada a ${doctor.email}`);
  } catch (error) {
    logger.error('❌ Error notificando alerta crítica:', error.message);
  }
};

/**
 * 🔍 Procesar alertas no resueltas
 * Se ejecuta cada 30 minutos
 */
const processUnresolvedAlerts = () => {
  return scheduleTask('*/30 * * * *', 'Alertas críticas no resueltas', async () => {
    try {
      const { maxBatch, emailThrottleMs, alertRenotifyHours } = getAutomationConfig();
      const renotifyWindow = new Date(Date.now() - alertRenotifyHours * 60 * 60 * 1000);

      // Buscar alertas críticas/altas no resueltas y no notificadas recientemente
      const criticalAlerts = await Alert.find({
        resolved: false,
        severity: { $in: ['critical', 'high'] },
        $or: [
          { lastNotified: { $exists: false } },
          { lastNotified: { $lt: renotifyWindow } }
        ]
      }).limit(maxBatch);

      for (const alert of criticalAlerts) {
        await notifyDoctorAboutCriticalAlert(alert);
        
        // Actualizar timestamp de última notificación
        alert.lastNotified = new Date();
        await alert.save();
        
        await sleep(Math.max(emailThrottleMs, 2000));
      }
    } catch (error) {
      logger.error('❌ Error procesando alertas:', error.message);
    }
  });
};

/**
 * 📊 Detectar patrones de riesgo en métricas
 * Se ejecuta diariamente a las 2 AM
 */
const detectRiskPatterns = () => {
  return scheduleTask('0 2 * * *', 'Detección de patrones clínicos', async () => {
    try {
      logger.info('🔄 Analizando patrones de riesgo en métricas...');

      // Buscar pacientes con mediciones recientes
      const recentMeasures = await Measure.find({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Última semana
      }).populate('patient clinician');

      const patientsAnalyzed = new Set();
      let alertsCreated = 0;

      for (const measure of recentMeasures) {
        if (!measure.patient || !measure.clinician) continue;
        
        const patientId = measure.patient._id.toString();
        if (patientsAnalyzed.has(patientId)) continue;

        // Detectar riesgo suicida
        if (measure.phq9Score >= 20 || measure.suicidalIdeation === 'high') {
          const existingAlert = await Alert.findOne({
            patient: measure.patient._id,
            type: 'suicide_risk',
            resolved: false
          });

          if (!existingAlert) {
            await Alert.create({
              patient: measure.patient._id,
              clinician: measure.clinician._id,
              type: 'suicide_risk',
              severity: 'critical',
              relatedMeasureId: measure._id,
              notes: `Detección automática: PHQ-9 score ${measure.phq9Score || 'N/A'}, ideación suicida registrada`
            });
            alertsCreated++;
            logger.info(`🚨 Alerta de riesgo suicida creada para paciente ${patientId}`);
          }
        }

        // Detectar depresión severa
        if (measure.phq9Score >= 15 && measure.phq9Score < 20) {
          const existingAlert = await Alert.findOne({
            patient: measure.patient._id,
            type: 'high_depression',
            resolved: false
          });

          if (!existingAlert) {
            await Alert.create({
              patient: measure.patient._id,
              clinician: measure.clinician._id,
              type: 'high_depression',
              severity: 'high',
              relatedMeasureId: measure._id,
              notes: `Detección automática: PHQ-9 score ${measure.phq9Score} (depresión moderadamente severa)`
            });
            alertsCreated++;
            logger.info(`🟠 Alerta de depresión severa creada para paciente ${patientId}`);
          }
        }

        patientsAnalyzed.add(patientId);
      }

      logger.info(`✅ Análisis de patrones completado: ${alertsCreated} nuevas alertas creadas`);
    } catch (error) {
      logger.error('❌ Error en análisis de patrones:', error.message);
    }
  });
};

/**
 * 🚀 Iniciar servicio de alertas médicas
 */
export const startMedicalAlertService = () => {
  const { enabled } = getAutomationConfig();

  if (!enabled) {
    return {};
  }
  
  const unresolvedJob = processUnresolvedAlerts();
  const patternJob = detectRiskPatterns();

  return { unresolvedJob, patternJob };
};

export default { startMedicalAlertService };
