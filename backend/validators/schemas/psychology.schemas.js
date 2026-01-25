/**
 * 🧠 PSYCHOLOGY VALIDATION SCHEMAS
 * 
 * Esquemas de validación para módulo de psicología
 * 
 * Componentes del sistema:
 * - Pacientes psicológicos (diferente de pacientes médicos)
 * - Sesiones de terapia
 * - Evaluaciones psicológicas (tests, cuestionarios)
 * - Planes de tratamiento
 * - Historia clínica psicológica
 * 
 * Consideraciones especiales:
 * - Confidencialidad extrema (más que medicina general)
 * - Datos sensibles (salud mental, trauma)
 * - Cumplimiento HIPAA + APA Ethics Code
 * - Notas de sesión privadas
 */

import Joi from 'joi';
import { mongoIdSchema, textLongSchema, textShortSchema, dateISOSchema } from './common.schemas.js';

/**
 * Schema para crear paciente psicológico
 * 
 * ¿Por qué schema separado de pacientes médicos?
 * - Campos específicos de salud mental
 * - Motivo de consulta psicológica
 * - Historial psiquiátrico previo
 * - Referencias (opcional)
 */
export const createPsychologyPatientSchema = Joi.object({
  // Información básica del paciente (puede ser referencia a User)
  name: textShortSchema
    .min(2)
    .max(100)
    .required()
    .messages({
      'any.required': 'El nombre del paciente es obligatorio'
    }),

  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .messages({
      'string.email': 'Email inválido'
    }),

  phone: Joi.string()
    .pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .messages({
      'string.pattern.base': 'Formato de teléfono inválido'
    }),

  age: Joi.number()
    .integer()
    .min(5)
    .max(120)
    .messages({
      'number.min': 'La edad mínima es 5 años',
      'number.max': 'La edad máxima es 120 años'
    }),

  gender: Joi.string()
    .valid('male', 'female', 'other', 'prefer-not-to-say'),

  /**
   * Motivo de consulta
   * 
   * ¿Por qué viene el paciente?
   * - Ansiedad, depresión, trauma, etc.
   * - Importante para diagnóstico inicial
   * - Guía el enfoque terapéutico
   */
  reasonForConsultation: textLongSchema
    .min(20)
    .max(1000)
    .required()
    .messages({
      'any.required': 'El motivo de consulta es obligatorio',
      'string.min': 'El motivo debe tener al menos 20 caracteres'
    }),

  // Referencia (opcional - quién lo refirió)
  referredBy: textShortSchema
    .max(100)
    .messages({
      'string.max': 'La referencia no puede exceder 100 caracteres'
    }),

  // Nivel de riesgo inicial
  riskLevel: Joi.string()
    .valid('low', 'medium', 'high', 'critical')
    .default('low')
    .messages({
      'any.only': 'Nivel de riesgo inválido'
    })
});

/**
 * Schema para crear sesión de terapia
 * 
 * Componentes:
 * - Fecha y duración
 * - Tipo de terapia (CBT, psicodinámica, etc.)
 * - Notas de sesión (confidenciales)
 * - Estado emocional del paciente
 * - Objetivos trabajados
 */
export const createSessionSchema = Joi.object({
  patient: mongoIdSchema
    .required()
    .messages({
      'any.required': 'El ID del paciente es obligatorio'
    }),

  /**
   * Fecha de la sesión
   * 
   * Puede ser pasada (registrar sesión después)
   * Puede ser futura (agendar)
   */
  sessionDate: dateISOSchema
    .required()
    .messages({
      'any.required': 'La fecha de la sesión es obligatoria'
    }),

  /**
   * Duración de la sesión (minutos)
   * 
   * Típico:
   * - Sesión individual: 45-60 min
   * - Sesión grupal: 90 min
   * - Primera sesión: 60-90 min
   */
  duration: Joi.number()
    .integer()
    .min(30)
    .max(180)
    .default(50)
    .messages({
      'number.min': 'La duración mínima es 30 minutos',
      'number.max': 'La duración máxima es 180 minutos'
    }),

  /**
   * Tipo de terapia/modalidad
   * 
   * Opciones comunes:
   * - cbt: Cognitive Behavioral Therapy
   * - dbt: Dialectical Behavior Therapy
   * - psychodynamic: Terapia psicodinámica
   * - humanistic: Terapia humanista
   * - emdr: EMDR para trauma
   * - other: Otra modalidad
   */
  therapyType: Joi.string()
    .valid('cbt', 'dbt', 'psychodynamic', 'humanistic', 'emdr', 'family', 'group', 'other')
    .default('cbt')
    .messages({
      'any.only': 'Tipo de terapia inválido'
    }),

  /**
   * Notas de sesión (confidenciales)
   * 
   * ¿Qué incluir?
   * - Temas discutidos
   * - Insights del paciente
   * - Progreso hacia objetivos
   * - Observaciones del terapeuta
   * - Plan para próxima sesión
   * 
   * IMPORTANTE:
   * - NUNCA compartir con terceros sin consentimiento
   * - Encriptar en base de datos
   * - Solo accesible por terapeuta asignado
   */
  notes: textLongSchema
    .min(50)
    .max(5000)
    .required()
    .messages({
      'any.required': 'Las notas de sesión son obligatorias',
      'string.min': 'Las notas deben tener al menos 50 caracteres'
    }),

  /**
   * Estado emocional del paciente
   * 
   * Escala subjetiva del terapeuta:
   * - stable: Estable, sin crisis
   * - improving: Mejorando progresivamente
   * - declining: Empeorando
   * - crisis: En crisis, requiere intervención
   */
  emotionalState: Joi.string()
    .valid('stable', 'improving', 'declining', 'crisis')
    .messages({
      'any.only': 'Estado emocional inválido'
    }),

  /**
   * Objetivos trabajados en la sesión
   * 
   * Array de strings:
   * ["Reducir ansiedad social", "Técnicas de mindfulness"]
   */
  objectivesWorked: Joi.array()
    .items(Joi.string().min(5).max(200))
    .max(10)
    .messages({
      'array.max': 'Máximo 10 objetivos por sesión'
    })
});

/**
 * Schema para crear evaluación psicológica
 * 
 * Tests estandarizados:
 * - BDI-II: Inventario de Depresión de Beck
 * - BAI: Inventario de Ansiedad de Beck
 * - PHQ-9: Patient Health Questionnaire
 * - GAD-7: Generalized Anxiety Disorder
 * - Etc.
 */
export const createAssessmentSchema = Joi.object({
  patient: mongoIdSchema
    .required()
    .messages({
      'any.required': 'El ID del paciente es obligatorio'
    }),

  /**
   * Tipo de test
   * 
   * Tests validados científicamente
   */
  testType: Joi.string()
    .valid(
      'BDI-II',
      'BAI',
      'PHQ-9',
      'GAD-7',
      'PCL-5',
      'OCI-R',
      'YBOCS',
      'AUDIT',
      'PSS',
      'other'
    )
    .required()
    .messages({
      'any.required': 'El tipo de test es obligatorio',
      'any.only': 'Tipo de test inválido'
    }),

  testDate: dateISOSchema
    .max('now')
    .default(() => new Date())
    .messages({
      'date.max': 'No se pueden registrar evaluaciones futuras'
    }),

  /**
   * Puntuación total del test
   * 
   * Cada test tiene su rango:
   * - BDI-II: 0-63
   * - BAI: 0-63
   * - PHQ-9: 0-27
   * - GAD-7: 0-21
   * 
   * Validamos rango amplio (0-100)
   */
  totalScore: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .required()
    .messages({
      'any.required': 'La puntuación total es obligatoria',
      'number.min': 'La puntuación mínima es 0',
      'number.max': 'La puntuación máxima es 100'
    }),

  /**
   * Interpretación de la puntuación
   * 
   * Categorías generales:
   * - minimal: Síntomas mínimos
   * - mild: Leve
   * - moderate: Moderado
   * - severe: Severo
   */
  interpretation: Joi.string()
    .valid('minimal', 'mild', 'moderate', 'severe')
    .required()
    .messages({
      'any.required': 'La interpretación es obligatoria',
      'any.only': 'Interpretación inválida'
    }),

  // Notas adicionales del psicólogo
  notes: textLongSchema
    .max(2000)
    .messages({
      'string.max': 'Las notas no pueden exceder 2000 caracteres'
    })
});

/**
 * Schema para crear plan de tratamiento
 * 
 * Componentes:
 * - Diagnóstico (si aplica)
 * - Objetivos terapéuticos
 * - Intervenciones planificadas
 * - Duración estimada
 * - Frecuencia de sesiones
 */
export const createTreatmentPlanSchema = Joi.object({
  patient: mongoIdSchema
    .required()
    .messages({
      'any.required': 'El ID del paciente es obligatorio'
    }),

  /**
   * Diagnóstico (opcional)
   * 
   * ¿Por qué opcional?
   * - No siempre se diagnostica de inmediato
   * - Algunos terapeutas evitan etiquetar
   * - Puede agregarse después
   */
  diagnosis: textShortSchema
    .min(5)
    .max(200)
    .messages({
      'string.min': 'El diagnóstico debe tener al menos 5 caracteres',
      'string.max': 'El diagnóstico no puede exceder 200 caracteres'
    }),

  /**
   * Objetivos terapéuticos
   * 
   * Array de objetivos SMART:
   * - Specific (específico)
   * - Measurable (medible)
   * - Achievable (alcanzable)
   * - Relevant (relevante)
   * - Time-bound (con plazo)
   * 
   * Ejemplos:
   * - "Reducir ataques de pánico de 5/semana a 1/semana en 3 meses"
   * - "Mejorar puntuación PHQ-9 de 18 (moderado-severo) a <10 (leve) en 8 semanas"
   */
  goals: Joi.array()
    .items(textShortSchema.min(10).max(300))
    .min(1)
    .max(10)
    .required()
    .messages({
      'any.required': 'Debe proporcionar al menos un objetivo',
      'array.min': 'Debe haber al menos 1 objetivo',
      'array.max': 'Máximo 10 objetivos'
    }),

  /**
   * Intervenciones planificadas
   * 
   * Técnicas terapéuticas a usar:
   * - "Reestructuración cognitiva (CBT)"
   * - "Exposición gradual"
   * - "Técnicas de relajación"
   * - "Mindfulness"
   */
  interventions: Joi.array()
    .items(textShortSchema.min(5).max(200))
    .min(1)
    .max(15)
    .required()
    .messages({
      'any.required': 'Debe proporcionar al menos una intervención',
      'array.min': 'Debe haber al menos 1 intervención',
      'array.max': 'Máximo 15 intervenciones'
    }),

  /**
   * Duración estimada del tratamiento (semanas)
   * 
   * Típico:
   * - Corto plazo: 8-12 semanas
   * - Medio plazo: 12-24 semanas
   * - Largo plazo: 24+ semanas
   */
  estimatedDuration: Joi.number()
    .integer()
    .min(4)
    .max(104) // 2 años máximo
    .messages({
      'number.min': 'La duración mínima es 4 semanas',
      'number.max': 'La duración máxima es 104 semanas (2 años)'
    }),

  /**
   * Frecuencia de sesiones (por semana)
   * 
   * Típico:
   * - 1x semana: Terapia estándar
   * - 2x semana: Crisis o intensivo
   * - 1x cada 2 semanas: Mantenimiento
   */
  sessionFrequency: Joi.number()
    .precision(1)
    .min(0.5) // Cada 2 semanas
    .max(4)   // 4 veces por semana (intensivo)
    .default(1)
    .messages({
      'number.min': 'La frecuencia mínima es 0.5 (cada 2 semanas)',
      'number.max': 'La frecuencia máxima es 4 sesiones por semana'
    })
});

/**
 * Schema para actualizar plan de tratamiento
 */
export const updateTreatmentPlanSchema = createTreatmentPlanSchema
  .fork(['patient'], (schema) => schema.forbidden())
  .fork(['goals', 'interventions'], (schema) => schema.optional())
  .min(1);

/**
 * Schema para query params generales
 */
export const getPsychologyQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  
  // Filtros por fecha
  dateFrom: dateISOSchema,
  dateTo: dateISOSchema
    .when('dateFrom', {
      is: Joi.exist(),
      then: Joi.date().greater(Joi.ref('dateFrom'))
    })
});

/**
 * Schema para validar ID en params
 */
export const psychologyIdSchema = Joi.object({
  id: mongoIdSchema.required(),
  patientId: mongoIdSchema
});
