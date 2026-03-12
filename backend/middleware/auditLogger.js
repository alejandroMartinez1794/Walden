/**
 * 🔒 AUDIT LOGGING MIDDLEWARE
 * 
 * Middleware para registrar automáticamente acciones en audit logs
 * Cumplimiento HIPAA § 164.312(b)
 * 
 * ¿Cuándo usar?
 * - TODAS las rutas que accedan/modifiquen PHI (Protected Health Information)
 * - Operaciones de autenticación
 * - Cambios administrativos
 * 
 * Uso:
 * router.get('/patient/:id', authenticate, auditLog('PHI_VIEW', 'User'), getPatient);
 */

import AuditLog from '../models/AuditLogSchema.js';
import logger from '../utils/logger.js';

/**
 * Middleware principal de audit logging
 * 
 * @param {string} action - Acción realizada (ej: 'PHI_VIEW', 'BOOKING_CREATE')
 * @param {string} resourceType - Tipo de recurso (ej: 'User', 'Booking')
 * @param {object} options - Opciones adicionales
 * @returns {Function} Express middleware
 */
export const auditLog = (action, resourceType, options = {}) => {
  return async (req, res, next) => {
    // Guardar el método original de res.json para interceptar la respuesta
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
      // Ejecutar logging después de que la response sea exitosa
      setImmediate(async () => {
        try {
          // Determinar resultado basado en status code
          let result = 'SUCCESS';
          if (res.statusCode >= 400 && res.statusCode < 500) {
            result = 'DENIED';
          } else if (res.statusCode >= 500) {
            result = 'FAILED';
          }

          // Determinar severidad
          let severity = 'LOW';
          if (action.includes('DELETE') || action.includes('EXPORT')) {
            severity = 'HIGH';
          } else if (action.includes('PHI') || action.includes('CLINICAL')) {
            severity = 'MEDIUM';
          }

          // Extraer resourceId de params o body
          const resourceId = req.params.id || req.params.doctorId || req.params.userId || 
                           req.body._id || req.body.id || options.resourceId;

          // Crear audit log
          await AuditLog.log({
            userId: req.userId || req.user?.id,
            userRole: req.role || req.user?.role || 'unknown',
            userEmail: req.user?.email || 'unknown',
            action,
            resourceType,
            resourceId,
            timestamp: new Date(),
            ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
            userAgent: req.get('user-agent') || 'unknown',
            result,
            details: {
              method: req.method,
              path: req.originalUrl,
              statusCode: res.statusCode,
              ...options.details
            },
            containsPHI: options.containsPHI !== undefined ? options.containsPHI : 
                        (action.includes('PHI') || action.includes('CLINICAL')),
            severity,
            sessionId: req.sessionID,
            requestId: req.id // Si usas express-request-id
          });
        } catch (error) {
          // NO bloquear la respuesta si el logging falla
          logger.error('❌ Audit logging error:', error);
        }
      });

      // Continuar con la respuesta normal
      return originalJson(data);
    };

    next();
  };
};

/**
 * Middleware específico para operaciones PHI
 * Automáticamente marca containsPHI: true y severity: MEDIUM
 */
export const auditPHI = (action, resourceType, options = {}) => {
  return auditLog(action, resourceType, {
    ...options,
    containsPHI: true,
    severity: options.severity || 'MEDIUM'
  });
};

/**
 * Middleware para operaciones de autenticación
 */
export const auditAuth = (action) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
      setImmediate(async () => {
        try {
          const result = res.statusCode === 200 ? 'SUCCESS' : 'FAILED';
          
          await AuditLog.log({
            userId: req.userId || req.body.userId || data.data?._id,
            userRole: req.role || data.role || 'unknown',
            userEmail: req.body.email || data.data?.email || 'unknown',
            action,
            resourceType: 'User',
            resourceId: req.userId || data.data?._id,
            timestamp: new Date(),
            ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
            userAgent: req.get('user-agent') || 'unknown',
            result,
            details: {
              method: req.method,
              path: req.originalUrl,
              statusCode: res.statusCode,
              loginAttempt: action.includes('LOGIN'),
              failureReason: result === 'FAILED' ? data.message : undefined
            },
            containsPHI: false,
            severity: result === 'FAILED' && action.includes('LOGIN') ? 'HIGH' : 'LOW',
            sessionId: req.sessionID
          });

          // Detectar múltiples intentos fallidos
          if (result === 'FAILED' && action === 'LOGIN_FAILED') {
            const suspicious = await AuditLog.findSuspiciousActivity(req.body.email, 1);
            if (suspicious.length > 0) {
              logger.warn('⚠️ Suspicious login activity detected:', req.body.email);
              // TODO: Bloquear cuenta temporalmente o enviar alerta
            }
          }
        } catch (error) {
          logger.error('❌ Auth audit logging error:', error);
        }
      });

      return originalJson(data);
    };

    next();
  };
};

/**
 * Middleware para operaciones administrativas
 * Severity: HIGH por defecto
 */
export const auditAdmin = (action, resourceType, options = {}) => {
  return auditLog(action, resourceType, {
    ...options,
    severity: 'HIGH'
  });
};

/**
 * Helper: Registrar manualmente un evento (para uso en controllers)
 * 
 * Uso:
 * await logAuditEvent(req, 'EXPORT_DATA', 'Booking', { format: 'CSV' });
 */
export const logAuditEvent = async (req, action, resourceType, details = {}) => {
  try {
    return await AuditLog.log({
      userId: req.userId || req.user?.id,
      userRole: req.role || req.user?.role || 'unknown',
      userEmail: req.user?.email || 'unknown',
      action,
      resourceType,
      resourceId: details.resourceId,
      timestamp: new Date(),
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
      result: details.result || 'SUCCESS',
      details,
      containsPHI: details.containsPHI || false,
      severity: details.severity || 'LOW',
      sessionId: req.sessionID
    });
  } catch (error) {
    logger.error('❌ Manual audit logging error:', error);
    return null;
  }
};
