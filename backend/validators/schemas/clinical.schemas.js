/**
 * 🏥 CLINICAL VALIDATION SCHEMAS
 * 
 * Esquemas de validación para módulo clínico avanzado
 * 
 * Componentes:
 * - Mediciones clínicas (scores de riesgo)
 * - Alertas clínicas automatizadas
 * - Sugerencias clínicas basadas en IA
 * - Logs de auditoría (HIPAA compliance)
 * - Consentimiento de pacientes
 * 
 * Consideraciones de seguridad:
 * - Datos altamente sensibles (scores de riesgo suicida)
 * - Encriptación obligatoria
 * - Auditoría completa (quién accedió, cuándo, por qué)
 * - Cumplimiento HIPAA estricto
 */

import Joi from 'joi';
import { mongoIdSchema, textLongSchema, textShortSchema, emailSchema } from './common.schemas.js';

/**
 * Schema para crear medición clínica
 * 
 * Mediciones incluyen:
 * - Scores de riesgo (PHQ-9, Columbia, etc.)
 * - Severidad de síntomas
 * - Alertas automáticas si umbral es alto
 * 
 * Ejemplo: PHQ-9
 * - Pregunta 9: "Pensamientos de muerte o autolesión"
 * - Respuesta > 0 → Alerta de riesgo suicida
 */
export const createMeasureSchema = Joi.object({
  /**
   * ID del paciente (en params de la ruta)
   * 
   * Ruta: POST /clinical/patients/:id/measures
   * Por lo tanto, 'id' viene de params, no de body
   */

  /**
   * Tipo de medición
   * 
   * Instrumentos validados:
   * - phq9: Patient Health Questionnaire-9 (depresión)
   * - gad7: Generalized Anxiety Disorder-7 (ansiedad)
   * - columbia: Columbia-Suicide Severity Rating Scale
   * - phq2: PHQ-2 (screening rápido depresión)
   * - audit: Alcohol Use Disorders Identification Test
   */
  measureType: Joi.string()
    .valid('phq9', 'gad7', 'columbia', 'phq2', 'audit', 'other')
    .required()
    .messages({
      'any.required': 'El tipo de medición es obligatorio',
      'any.only': 'Tipo de medición inválido'
    }),

  /**
   * Respuestas del cuestionario
   * 
   * Formato: Array de objetos con pregunta y respuesta
   * 
   * Ejemplo PHQ-9:
   * [
   *   { question: "Poco interés en hacer cosas", score: 2 },
   *   { question: "Sentirse deprimido", score: 3 },
   *   ...
   * ]
   */
  responses: Joi.array()
    .items(
      Joi.object({
        question: textShortSchema
          .min(5)
          .max(200)
          .required(),
        
        score: Joi.number()
          .integer()
          .min(0)
          .max(10)
          .required()
          .messages({
            'number.min': 'El score mínimo es 0',
            'number.max': 'El score máximo es 10'
          })
      })
    )
    .min(1)
    .max(50)
    .required()
    .messages({
      'any.required': 'Las respuestas son obligatorias',
      'array.min': 'Debe proporcionar al menos 1 respuesta',
      'array.max': 'Máximo 50 respuestas'
    }),

  /**
   * Score total calculado
   * 
   * Se calcula sumando todos los scores individuales
   * Backend debería recalcular para validar
   */
  totalScore: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .required()
    .messages({
      'any.required': 'El score total es obligatorio',
      'number.min': 'El score mínimo es 0',
      'number.max': 'El score máximo es 100'
    }),

  /**
   * Nivel de severidad
   * 
   * Basado en score:
   * - none: Sin síntomas (score 0-4)
   * - mild: Leve (5-9)
   * - moderate: Moderado (10-14)
   * - moderately-severe: Moderadamente severo (15-19)
   * - severe: Severo (20+)
   */
  severity: Joi.string()
    .valid('none', 'mild', 'moderate', 'moderately-severe', 'severe')
    .required()
    .messages({
      'any.required': 'La severidad es obligatoria',
      'any.only': 'Severidad inválida'
    }),

  /**
   * Notas adicionales del clínico
   * 
   * Contexto importante:
   * - Factores estresantes actuales
   * - Cambios recientes en vida del paciente
   * - Observaciones durante la evaluación
   */
  notes: textLongSchema
    .max(2000)
    .messages({
      'string.max': 'Las notas no pueden exceder 2000 caracteres'
    })
});

/**
 * Schema para generar resumen clínico con IA
 * 
 * Usa OpenAI/Claude para:
 * - Resumir historial del paciente
 * - Identificar patrones
 * - Sugerir intervenciones
 * - Detectar riesgos
 */
export const generateClinicalSummarySchema = Joi.object({
  /**
   * Prompt personalizado (opcional)
   * 
   * Permite al clínico hacer preguntas específicas:
   * - "¿Cuál es el patrón de empeoramiento?"
   * - "¿Qué intervenciones han funcionado mejor?"
   * - "¿Hay riesgo inmediato?"
   */
  customPrompt: textLongSchema
    .max(500)
    .messages({
      'string.max': 'El prompt no puede exceder 500 caracteres'
    }),

  /**
   * Incluir datos históricos
   * 
   * Opciones:
   * - last30days: Últimos 30 días
   * - last90days: Últimos 3 meses
   * - last6months: Últimos 6 meses
   * - all: Todo el historial
   */
  dataRange: Joi.string()
    .valid('last30days', 'last90days', 'last6months', 'all')
    .default('last90days')
    .messages({
      'any.only': 'Rango de datos inválido'
    }),

  /**
   * Tipo de análisis
   * 
   * - summary: Resumen general
   * - risk: Análisis de riesgo
   * - trends: Tendencias temporales
   * - recommendations: Recomendaciones de tratamiento
   */
  analysisType: Joi.string()
    .valid('summary', 'risk', 'trends', 'recommendations')
    .default('summary')
    .messages({
      'any.only': 'Tipo de análisis inválido'
    })
});

/**
 * Schema para resolver alerta clínica
 * 
 * Alertas se generan automáticamente cuando:
 * - Score PHQ-9 > 15 (moderadamente severo)
 * - Respuesta a pregunta 9 > 0 (ideación suicida)
 * - Empeoramiento rápido (score +5 en 1 semana)
 * - Falta de mejora (sin cambio en 4 semanas)
 */
export const resolveAlertSchema = Joi.object({
  /**
   * Estado de resolución
   * 
   * - acknowledged: Revisado pero sin acción
   * - resolved: Resuelto (explica cómo en notes)
   * - escalated: Escalado a supervisor/emergencia
   */
  status: Joi.string()
    .valid('acknowledged', 'resolved', 'escalated')
    .required()
    .messages({
      'any.required': 'El estado es obligatorio',
      'any.only': 'Estado inválido'
    }),

  /**
   * Acción tomada
   * 
   * Obligatorio si status = 'resolved' o 'escalated'
   * 
   * Ejemplos:
   * - "Sesión de emergencia programada para hoy"
   * - "Contactado a familiar de emergencia"
   * - "Referido a hospital para evaluación"
   */
  actionTaken: textLongSchema
    .min(20)
    .max(1000)
    .when('status', {
      is: Joi.valid('resolved', 'escalated'),
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'any.required': 'La acción tomada es obligatoria para alertas resueltas/escaladas',
      'string.min': 'La acción debe tener al menos 20 caracteres'
    }),

  /**
   * Notas adicionales
   */
  notes: textLongSchema
    .max(2000)
});

/**
 * Schema para actualizar mitigación de alerta
 * 
 * Plan para reducir riesgo:
 * - Aumentar frecuencia de sesiones
 * - Involucrar familia/apoyo
 * - Evaluar medicación
 * - Crear plan de seguridad
 */
export const updateAlertMitigationSchema = Joi.object({
  /**
   * Pasos del plan de mitigación
   * 
   * Array de acciones específicas:
   * [
   *   "Sesiones 2x por semana por 2 semanas",
   *   "Plan de seguridad creado con paciente",
   *   "Contacto de emergencia notificado"
   * ]
   */
  mitigationSteps: Joi.array()
    .items(textShortSchema.min(10).max(300))
    .min(1)
    .max(10)
    .required()
    .messages({
      'any.required': 'Los pasos de mitigación son obligatorios',
      'array.min': 'Debe proporcionar al menos 1 paso',
      'array.max': 'Máximo 10 pasos'
    }),

  /**
   * Plazo de revisión (días)
   * 
   * ¿Cuándo revisar si la mitigación funcionó?
   * - Crisis: 1-3 días
   * - Alto riesgo: 7 días
   * - Riesgo moderado: 14 días
   */
  reviewInDays: Joi.number()
    .integer()
    .min(1)
    .max(30)
    .required()
    .messages({
      'any.required': 'El plazo de revisión es obligatorio',
      'number.min': 'El plazo mínimo es 1 día',
      'number.max': 'El plazo máximo es 30 días'
    })
});

/**
 * Schema para aceptar sugerencia clínica de IA
 * 
 * IA genera sugerencias como:
 * - "Considerar evaluación de PTSD (score PCL-5 alto)"
 * - "Respuesta a tratamiento lenta, considerar ajuste"
 * - "Patrón sugiere ansiedad comórbida"
 * 
 * Clínico decide si acepta o rechaza
 */
export const acceptSuggestionSchema = Joi.object({
  /**
   * Acción del clínico
   * 
   * - accepted: Acepto la sugerencia, voy a implementarla
   * - rejected: Rechazo la sugerencia (explica por qué)
   * - deferred: Pospongo decisión para más tarde
   */
  action: Joi.string()
    .valid('accepted', 'rejected', 'deferred')
    .required()
    .messages({
      'any.required': 'La acción es obligatoria',
      'any.only': 'Acción inválida'
    }),

  /**
   * Razón (obligatoria si se rechaza)
   * 
   * Importante para mejorar IA:
   * - "Contexto del paciente no considerado por IA"
   * - "Ya intentamos eso sin éxito"
   * - "Sugerencia no aplicable a este caso"
   */
  reason: textLongSchema
    .min(20)
    .max(1000)
    .when('action', {
      is: 'rejected',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'any.required': 'Debe explicar por qué rechaza la sugerencia',
      'string.min': 'La razón debe tener al menos 20 caracteres'
    }),

  // Notas adicionales
  notes: textLongSchema
    .max(1000)
});

/**
 * Schema para enviar email de consentimiento
 * 
 * HIPAA requiere consentimiento explícito para:
 * - Compartir información con terceros
 * - Usar datos para investigación
 * - Comunicaciones electrónicas
 */
export const sendConsentEmailSchema = Joi.object({
  /**
   * Email del paciente
   */
  patientEmail: emailSchema
    .required()
    .messages({
      'any.required': 'El email del paciente es obligatorio'
    }),

  /**
   * Nombre del paciente
   */
  patientName: textShortSchema
    .min(2)
    .max(100)
    .required()
    .messages({
      'any.required': 'El nombre del paciente es obligatorio'
    }),

  /**
   * Tipo de consentimiento
   * 
   * - treatment: Consentimiento para tratamiento
   * - communication: Comunicaciones electrónicas
   * - research: Uso de datos para investigación
   * - sharing: Compartir con otros proveedores
   */
  consentType: Joi.string()
    .valid('treatment', 'communication', 'research', 'sharing')
    .required()
    .messages({
      'any.required': 'El tipo de consentimiento es obligatorio',
      'any.only': 'Tipo de consentimiento inválido'
    }),

  /**
   * Mensaje personalizado (opcional)
   */
  customMessage: textLongSchema
    .max(500)
    .messages({
      'string.max': 'El mensaje no puede exceder 500 caracteres'
    })
});

/**
 * Schema para query params de alertas
 */
export const getAlertsQuerySchema = Joi.object({
  // Filtro por estado
  status: Joi.string()
    .valid('active', 'acknowledged', 'resolved', 'escalated'),

  // Filtro por nivel de riesgo
  riskLevel: Joi.string()
    .valid('low', 'moderate', 'high', 'critical'),

  // Paginación
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

/**
 * Schema para validar ID en params
 */
export const clinicalIdSchema = Joi.object({
  id: mongoIdSchema.required(),
  alertId: mongoIdSchema,
  logId: mongoIdSchema
});
