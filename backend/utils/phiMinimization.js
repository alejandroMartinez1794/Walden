/**
 * 🔐 PHI Data Minimization Helper
 * 
 * Utilidades para minimizar PHI expuesto en servicios externos (Google Calendar, Emails)
 * según HIPAA "minimum necessary" rule
 */

import logger from './logger.js';

/**
 * Sanitizar datos de cita para Google Calendar
 * Elimina toda PHI específica, solo mantiene lo mínimo necesario
 * 
 * @param {Object} booking - Booking document de MongoDB
 * @returns {Object} - Evento sanitizado para Google Calendar
 */
export const sanitizeForCalendar = (booking) => {
  try {
    // ✅ HIPAA-compliant: Mínimo PHI
    const event = {
      summary: 'Sesión Programada',  // Generic, sin detalles
      description: `Booking ID: ${booking._id}\nPlataforma: Psiconepsis`,
      start: {
        dateTime: booking.appointmentDate,
        timeZone: process.env.TIMEZONE || 'America/Bogota'
      },
      end: {
        dateTime: calculateEndTime(booking.appointmentDate, booking.duration || 60),
        timeZone: process.env.TIMEZONE || 'America/Bogota'
      },
      colorId: '9',  // Color azul (default para citas médicas)
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 30 },
          { method: 'email', minutes: 1440 }  // 24h antes
        ]
      }
    };

    // ❌ NO incluir:
    // - Nombre del paciente
    // - Motivo de consulta
    // - Tipo de terapia
    // - Diagnóstico
    // - Notas clínicas

    logger.info('Calendar event sanitized', {
      bookingId: booking._id,
      phiExposed: 'minimal'
    });

    return event;

  } catch (error) {
    logger.error('Error sanitizing calendar event', { error: error.message });
    throw error;
  }
};

/**
 * Sanitizar datos para email template
 * 
 * @param {Object} booking - Booking document
 * @param {Object} user - User document
 * @returns {Object} - Datos seguros para email
 */
export const sanitizeForEmail = (booking, user) => {
  return {
    // ✅ Safe to include
    patientFirstName: user.name?.split(' ')[0] || 'Paciente',  // Solo primer nombre
    bookingId: booking._id,
    appointmentDate: formatDate(booking.appointmentDate),  // Solo fecha, no detalles
    portalLink: `${process.env.FRONTEND_BASE_URL}/bookings/${booking._id}`,
    
    // ❌ NO incluir:
    // - Diagnóstico
    // - Motivo de consulta
    // - Tipo de terapia
    // - Notas del doctor
    // - Resultados de evaluaciones
  };
};

/**
 * Validar que un objeto no contiene PHI sensible
 * Útil para logs y exports
 * 
 * @param {Object} data - Datos a validar
 * @returns {boolean} - true si es seguro, false si contiene PHI
 */
export const containsSensitivePHI = (data) => {
  const sensitiveKeywords = [
    'diagnosis', 'diagnóstico', 'treatment', 'tratamiento',
    'medication', 'medicamento', 'symptom', 'síntoma',
    'condition', 'condición', 'therapy', 'terapia',
    'assessment', 'evaluación', 'mental', 'psychological',
    'depression', 'anxiety', 'disorder', 'trastorno'
  ];

  const dataString = JSON.stringify(data).toLowerCase();
  
  return sensitiveKeywords.some(keyword => dataString.includes(keyword));
};

/**
 * Redactar PHI de un objeto para logging seguro
 * 
 * @param {Object} data - Datos a redactar
 * @returns {Object} - Datos redactados
 */
export const redactPHI = (data) => {
  const redacted = { ...data };
  
  const phiFields = [
    'diagnosis', 'diagnóstico', 'treatmentPlan', 'planTratamiento',
    'medications', 'medicamentos', 'clinicalNotes', 'notasClinicas',
    'symptoms', 'síntomas', 'assessmentResults', 'resultadosEvaluacion',
    'mentalHealthStatus', 'estadoSaludMental'
  ];

  phiFields.forEach(field => {
    if (redacted[field]) {
      redacted[field] = '[REDACTED - PHI]';
    }
  });

  return redacted;
};

/**
 * Helpers
 */
const calculateEndTime = (startDate, durationMinutes) => {
  const start = new Date(startDate);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  return end.toISOString();
};

const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Wrapper para audit log con PHI validation
 * Asegura que no se loguee PHI sensible accidentalmente
 */
export const safeAuditLog = (action, resource, req, metadata = {}) => {
  // Validar y redactar metadata si contiene PHI
  const safeMetadata = containsSensitivePHI(metadata) 
    ? redactPHI(metadata)
    : metadata;

  logger.info('Audit log', {
    action,
    resource,
    userId: req.userId,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    metadata: safeMetadata
  });
};

export default {
  sanitizeForCalendar,
  sanitizeForEmail,
  containsSensitivePHI,
  redactPHI,
  safeAuditLog
};
