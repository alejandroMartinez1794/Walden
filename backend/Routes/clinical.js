// backend/Routes/clinical.js
import express from 'express';
import { authenticate, restrict } from '../auth/verifyToken.js';
import { createMeasure, generateClinicalSummaryHandler, listAlerts, resolveAlert, updateAlertMitigation, acceptSuggestion, sendConsentEmail } from '../Controllers/clinicalController.js';

// ✅ IMPORTAR VALIDACIÓN
import { validate, validateId } from '../validators/middleware/validate.js';
import { 
    createMeasureSchema,
    generateClinicalSummarySchema,
    resolveAlertSchema,
    updateAlertMitigationSchema,
    acceptSuggestionSchema,
    sendConsentEmailSchema,
    getAlertsQuerySchema
} from '../validators/schemas/clinical.schemas.js';

const router = express.Router();

/**
 * 🏥 RUTAS CLÍNICAS AVANZADAS
 * 
 * Módulo para manejo clínico con IA y alertas automáticas
 * 
 * Componentes:
 * - Mediciones clínicas (PHQ-9, GAD-7, Columbia)
 * - Alertas automáticas (riesgo suicida, empeoramiento)
 * - Sugerencias clínicas por IA
 * - Resúmenes clínicos generados por IA
 * - Logs de auditoría (HIPAA compliance)
 * 
 * Seguridad crítica:
 * - Solo doctores pueden acceder
 * - Datos altamente sensibles (scores de riesgo)
 * - Encriptación obligatoria
 * - Auditoría completa de accesos
 */

// Todas las rutas requieren autenticación como doctor
router.use(authenticate, restrict(['doctor']));

// ============ HERRAMIENTAS ============
/**
 * POST /api/v1/clinical/send-consent
 * 
 * Enviar email de consentimiento al paciente
 * 
 * Validación:
 * - patientEmail: Email válido
 * - patientName: 2-100 caracteres
 * - consentType: treatment, communication, research, sharing
 * - customMessage: Opcional (máx 500 caracteres)
 * 
 * ¿Por qué?
 * - HIPAA requiere consentimiento explícito
 * - Documentar que paciente fue informado
 * - Evidencia legal
 */
router.post('/send-consent', validate(sendConsentEmailSchema), sendConsentEmail);

// ============ MEDICIONES ============
/**
 * POST /api/v1/clinical/patients/:id/measures
 * 
 * Crear medición clínica (genera alertas automáticas)
 * 
 * Validación:
 * - measureType: phq9, gad7, columbia, etc.
 * - responses: Array de preguntas/respuestas
 * - totalScore: 0-100
 * - severity: none, mild, moderate, moderately-severe, severe
 * 
 * Alertas automáticas:
 * - PHQ-9 > 15: Depresión moderada-severa
 * - PHQ-9 pregunta 9 > 0: Riesgo suicida
 * - Empeoramiento rápido: +5 puntos en 1 semana
 */
router.post('/patients/:id/measures', validateId, validate(createMeasureSchema), createMeasure);

// ============ RESUMEN CLÍNICO CON IA ============
/**
 * POST /api/v1/clinical/patients/:id/clinical-summary
 * 
 * Generar resumen clínico usando IA (OpenAI/Claude)
 * 
 * Validación:
 * - customPrompt: Opcional (máx 500 caracteres)
 * - dataRange: last30days, last90days, last6months, all
 * - analysisType: summary, risk, trends, recommendations
 * 
 * Ejemplos de uso:
 * - "Resumir progreso del paciente"
 * - "Identificar patrones de empeoramiento"
 * - "Sugerir ajustes al tratamiento"
 */
router.post('/patients/:id/clinical-summary', validateId, validate(generateClinicalSummarySchema), generateClinicalSummaryHandler);

// ============ ALERTAS ============
/**
 * GET /api/v1/clinical/patients/:id/alerts
 * 
 * Obtener alertas clínicas del paciente
 * 
 * Query params:
 * - status: active, acknowledged, resolved, escalated
 * - riskLevel: low, moderate, high, critical
 * - page, limit: Paginación
 */
router.get('/patients/:id/alerts', validateId, validate(getAlertsQuerySchema, 'query'), listAlerts);

/**
 * PATCH /api/v1/clinical/alerts/:alertId/resolve
 * 
 * Resolver alerta clínica
 * 
 * Validación:
 * - status: acknowledged, resolved, escalated
 * - actionTaken: Obligatorio si resolved/escalated (20-1000 caracteres)
 * - notes: Opcional
 * 
 * Ejemplos:
 * - acknowledged: "Revisado, no requiere acción inmediata"
 * - resolved: "Sesión de emergencia programada, plan de seguridad creado"
 * - escalated: "Referido a hospital para evaluación psiquiátrica"
 */
router.patch('/alerts/:alertId/resolve', validateId, validate(resolveAlertSchema), resolveAlert);

/**
 * PATCH /api/v1/clinical/alerts/:alertId/mitigation
 * 
 * Actualizar plan de mitigación de alerta
 * 
 * Validación:
 * - mitigationSteps: Array de pasos (1-10)
 * - reviewInDays: 1-30 días
 * 
 * Ejemplo:
 * {
 *   "mitigationSteps": [
 *     "Sesiones 2x por semana por 2 semanas",
 *     "Plan de seguridad creado con paciente",
 *     "Contacto de emergencia notificado"
 *   ],
 *   "reviewInDays": 7
 * }
 */
router.patch('/alerts/:alertId/mitigation', validateId, validate(updateAlertMitigationSchema), updateAlertMitigation);

// ============ SUGERENCIAS DE IA ============
/**
 * PATCH /api/v1/clinical/suggestions/:logId/accept
 * 
 * Aceptar/rechazar sugerencia clínica de IA
 * 
 * Validación:
 * - action: accepted, rejected, deferred
 * - reason: Obligatorio si rejected (20-1000 caracteres)
 * - notes: Opcional
 * 
 * ¿Por qué importante?
 * - Feedback para mejorar IA
 * - Documentar decisiones clínicas
 * - Aprendizaje del sistema
 */
router.patch('/suggestions/:logId/accept', validateId, validate(acceptSuggestionSchema), acceptSuggestion);

export default router;
