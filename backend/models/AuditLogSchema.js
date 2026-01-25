/**
 * 📋 AUDIT LOG SCHEMA
 * 
 * Modelo para HIPAA Compliance - Registro de auditoría
 * 
 * ¿Por qué es CRÍTICO para HIPAA?
 * - HIPAA § 164.312(b) requiere audit logs de TODAS las acciones sobre PHI
 * - Permite detectar accesos no autorizados
 * - Facilita investigación de brechas de seguridad
 * - Cumple con "accounting of disclosures"
 * 
 * Retención requerida: Mínimo 6 años (HIPAA estándar)
 */

import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema({
  // ¿Quién? - Identificación del usuario
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: false, // Opcional para acciones no autenticadas (failed logins, etc.)
    index: true
  },
  
  userRole: {
    type: String,
    enum: ['paciente', 'doctor', 'admin', 'unknown'],
    required: true
  },
  
  userEmail: {
    type: String,
    required: false // Opcional para acciones sin contexto de usuario
  },

  // ¿Qué? - Acción realizada
  action: {
    type: String,
    required: true,
    enum: [
      // Autenticación
      'LOGIN_SUCCESS',
      'LOGIN_FAILED',
      'LOGOUT',
      'PASSWORD_CHANGE',
      'PASSWORD_RESET_REQUEST',
      'PASSWORD_RESET_COMPLETE',
      '2FA_ENABLED',
      '2FA_DISABLED',
      
      // Acceso a datos sensibles (PHI)
      'PHI_VIEW',
      'PHI_CREATE',
      'PHI_UPDATE',
      'PHI_DELETE',
      'PHI_EXPORT',
      
      // Gestión de usuarios
      'USER_CREATE',
      'USER_UPDATE',
      'USER_DELETE',
      'USER_ROLE_CHANGE',
      
      // Citas médicas
      'BOOKING_CREATE',
      'BOOKING_UPDATE',
      'BOOKING_CANCEL',
      'BOOKING_VIEW',
      
      // Datos clínicos
      'CLINICAL_RECORD_VIEW',
      'CLINICAL_RECORD_CREATE',
      'CLINICAL_RECORD_UPDATE',
      'PSYCHOLOGICAL_ASSESSMENT_VIEW',
      'PSYCHOLOGICAL_ASSESSMENT_CREATE',
      
      // Administrativo
      'ADMIN_PANEL_ACCESS',
      'SETTINGS_CHANGE',
      'EXPORT_DATA',
      'IMPORT_DATA'
    ],
    index: true
  },

  // ¿Sobre qué? - Recurso afectado
  resourceType: {
    type: String,
    enum: ['User', 'Doctor', 'Booking', 'ClinicalRecord', 'PsychologicalAssessment', 'Review', 'Settings'],
    required: true
  },

  resourceId: {
    type: mongoose.Types.ObjectId,
    required: false // Algunas acciones no tienen resourceId (ej: LOGIN_FAILED)
  },

  // ¿Cuándo? - Timestamp
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },

  // ¿Dónde? - Información de red
  ipAddress: {
    type: String,
    required: true
  },

  userAgent: {
    type: String,
    required: true
  },

  location: {
    country: String,
    city: String,
    // Se puede agregar geolocalización si es necesario
  },

  // ¿Cómo resultó? - Resultado de la acción
  result: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'DENIED'],
    required: true,
    default: 'SUCCESS'
  },

  // Detalles adicionales
  details: {
    type: mongoose.Schema.Types.Mixed,
    // Puede contener información adicional como:
    // - Campos modificados
    // - Razón del fallo
    // - Nivel de riesgo
  },

  // ¿Contiene PHI? - Indica si la acción involucró datos sensibles
  containsPHI: {
    type: Boolean,
    default: false,
    required: true,
    index: true
  },

  // Nivel de severidad (para alertas)
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW'
  },

  // Metadata para investigaciones
  sessionId: {
    type: String,
    // ID de sesión para correlacionar eventos
  },

  requestId: {
    type: String,
    // ID único de request para debugging
  }
}, {
  timestamps: false, // Usamos nuestro propio timestamp
  collection: 'audit_logs'
});

// Índices compuestos para queries comunes
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ containsPHI: 1, timestamp: -1 });
AuditLogSchema.index({ severity: 1, timestamp: -1 });

// TTL Index: Auto-delete logs después de 6 años (HIPAA minimum)
// 6 años = 6 * 365 * 24 * 60 * 60 = 189,216,000 segundos
AuditLogSchema.index(
  { timestamp: 1 },
  { 
    expireAfterSeconds: 189216000,
    name: 'hipaa_retention_ttl'
  }
);

// Método estático para crear audit log fácilmente
AuditLogSchema.statics.log = async function(data) {
  try {
    const log = new this(data);
    await log.save();
    
    // Si es CRITICAL, enviar alerta inmediata
    if (data.severity === 'CRITICAL') {
      // TODO: Integrar con sistema de alertas (email, Slack, PagerDuty)
      console.error('🚨 CRITICAL AUDIT EVENT:', data);
    }
    
    return log;
  } catch (error) {
    // NO fallar la request principal si el logging falla
    console.error('❌ Failed to create audit log:', error);
    return null;
  }
};

// Método para buscar accesos sospechosos
AuditLogSchema.statics.findSuspiciousActivity = async function(userId, timeWindow = 24) {
  const since = new Date(Date.now() - timeWindow * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        timestamp: { $gte: since },
        result: 'FAILED'
      }
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        lastAttempt: { $max: '$timestamp' }
      }
    },
    {
      $match: {
        count: { $gte: 3 } // 3+ intentos fallidos = sospechoso
      }
    }
  ]);
};

export default mongoose.model("AuditLog", AuditLogSchema);
