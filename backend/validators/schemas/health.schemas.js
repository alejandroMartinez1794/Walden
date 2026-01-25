/**
 * 🏥 HEALTH METRICS VALIDATION SCHEMAS
 * 
 * Esquemas de validación para métricas de salud
 * 
 * ¿Para qué sirven las métricas de salud?
 * - Seguimiento de signos vitales (presión, ritmo cardíaco)
 * - Monitoreo de actividad física (pasos, ejercicio)
 * - Control de peso y nutrición (calorías, agua)
 * - Historial médico para doctores
 * 
 * Consideraciones:
 * - Valores dentro de rangos médicos realistas
 * - Prevenir datos falsos o peligrosos
 * - Alertas automáticas para valores críticos
 * - Privacidad (datos sensibles HIPAA)
 */

import Joi from 'joi';
import { mongoIdSchema, dateISOSchema } from './common.schemas.js';

/**
 * Schema para crear métrica de salud
 * 
 * Estructura simplificada con type + value
 * Compatible con tests
 */
export const createHealthMetricSchema = Joi.object({
  /**
   * Tipo de métrica
   */
  type: Joi.string()
    .valid(
      'bloodPressure',
      'heartRate',
      'temperature',
      'weight',
      'bmi',
      'glucose',
      'oxygen',
      'steps',
      'water',
      'sleep',
      'calories',
      'exercise'
    )
    .required()
    .messages({
      'any.required': 'El tipo de métrica es requerido',
      'any.only': 'Tipo de métrica inválido'
    }),

  /**
   * Valor numérico de la métrica
   */
  value: Joi.number()
    .min(0)
    .max(10000)
    .required()
    .messages({
      'any.required': 'El valor es requerido',
      'number.min': 'El valor no puede ser negativo',
      'number.max': 'El valor no puede exceder 10000'
    }),

  /**
   * Unidad de medida
   */
  unit: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': 'La unidad no puede exceder 50 caracteres'
    }),

  /**
   * Fecha de registro
   */
  recordedAt: dateISOSchema
    .max('now')
    .default(() => new Date())
    .messages({
      'date.max': 'No se pueden registrar mediciones futuras'
    }),

  /**
   * Notas adicionales
   */
  notes: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Las notas no pueden exceder 500 caracteres'
    }),

  /**
   * Notas adicionales
   */
  notes: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Las notas no pueden exceder 500 caracteres'
    })
});

/**
 * Schema para actualizar métrica de salud
 */
export const updateHealthMetricSchema = Joi.object({
  value: Joi.number()
    .min(0)
    .max(10000)
    .messages({
      'number.min': 'El valor no puede ser negativo',
      'number.max': 'El valor no puede exceder 10000'
    }),

  unit: Joi.string()
    .max(50)
    .messages({
      'string.max': 'La unidad no puede exceder 50 caracteres'
    }),

  notes: Joi.string()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'Las notas no pueden exceder 500 caracteres'
    }),

  // No se permite cambiar el tipo
  type: Joi.any()
    .forbidden()
    .messages({
      'any.unknown': 'El tipo no puede ser modificado después de la creación'
    })
}).min(1)
  .messages({
    'object.min': 'Debe proporcionar al menos un campo para actualizar'
  });

/**
 * Schema para obtener métricas de salud (filtros)
 */
export const getHealthMetricsQuerySchema = Joi.object({
  // Rango de fechas
  dateFrom: dateISOSchema
    .messages({
      'date.format': 'dateFrom debe ser formato ISO 8601'
    }),

  dateTo: dateISOSchema
    .when('dateFrom', {
      is: Joi.exist(),
      then: Joi.date().greater(Joi.ref('dateFrom'))
    })
    .messages({
      'date.format': 'dateTo debe ser formato ISO 8601',
      'date.greater': 'dateTo debe ser posterior a dateFrom'
    }),

  // Filtro por tipo
  type: Joi.string()
    .valid(
      'bloodPressure',
      'heartRate',
      'temperature',
      'weight',
      'bmi',
      'glucose',
      'oxygen',
      'steps',
      'water',
      'sleep',
      'calories',
      'exercise'
    )
    .messages({
      'any.only': 'Tipo de métrica inválido'
    }),

  // Ordenamiento
  sortBy: Joi.string()
    .valid('recordedAt', 'value', 'type')
    .default('recordedAt')
    .messages({
      'any.only': 'Campo de ordenamiento inválido'
    }),

  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Orden inválido (use asc o desc)'
    }),

  // Paginación
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

/**
 * 💊 MEDICATION SCHEMAS
 *
 * Validación para medicamentos
 */
export const createMedicationSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(200)
    .required()
    .messages({
      'any.required': 'Nombre del medicamento es requerido',
      'string.min': 'Nombre del medicamento debe tener al menos 2 caracteres',
      'string.max': 'Nombre del medicamento no puede exceder 200 caracteres'
    }),

  dosage: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'any.required': 'Dosis es requerida',
      'string.max': 'Dosis no puede exceder 100 caracteres'
    }),

  frequency: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'any.required': 'Frecuencia es requerida',
      'string.max': 'Frecuencia no puede exceder 100 caracteres'
    }),

  startDate: dateISOSchema
    .required()
    .messages({
      'any.required': 'Fecha de inicio es requerida'
    }),

  endDate: dateISOSchema
    .optional()
    .min(Joi.ref('startDate'))
    .messages({
      'date.min': 'Fecha de fin debe ser posterior o igual a la fecha de inicio'
    }),

  prescribedBy: Joi.string()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Prescrito por no puede exceder 200 caracteres'
    }),

  instructions: Joi.string()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Instrucciones no pueden exceder 1000 caracteres'
    }),

  remainingDoses: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.min': 'Dosis restantes no pueden ser negativas'
    }),

  totalDoses: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.min': 'Dosis totales no pueden ser negativas'
    }),

  status: Joi.string()
    .valid('active', 'completed', 'stopped')
    .optional()
    .messages({
      'any.only': 'Estado inválido'
    })
}).messages({
  'object.unknown': 'Campo {{#label}} no está permitido'
});

export const updateMedicationSchema = Joi.object({
  name: Joi.string().min(2).max(200),
  dosage: Joi.string().min(1).max(100),
  frequency: Joi.string().min(2).max(100),
  startDate: dateISOSchema,
  endDate: dateISOSchema.min(Joi.ref('startDate')),
  prescribedBy: Joi.string().max(200).allow(''),
  instructions: Joi.string().max(1000).allow(''),
  remainingDoses: Joi.number().integer().min(0),
  totalDoses: Joi.number().integer().min(0),
  status: Joi.string().valid('active', 'completed', 'stopped')
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar',
  'object.unknown': 'Campo {{#label}} no está permitido'
});

/**
 * 🗂️ MEDICAL RECORD SCHEMA
 */
export const createMedicalRecordSchema = Joi.object({
  type: Joi.string()
    .valid('consultation', 'lab', 'prescription', 'other')
    .required()
    .messages({
      'any.required': 'Tipo de registro es requerido',
      'any.only': 'Tipo de registro inválido'
    }),

  title: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      'any.required': 'Título es requerido',
      'string.min': 'Título debe tener al menos 3 caracteres',
      'string.max': 'Título no puede exceder 200 caracteres'
    }),

  description: Joi.string()
    .max(2000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Descripción no puede exceder 2000 caracteres'
    }),

  date: dateISOSchema
    .max('now')
    .optional()
    .messages({
      'date.max': 'La fecha no puede ser futura'
    }),

  createdBy: mongoIdSchema.optional(),

  attachments: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().uri().required().messages({
          'string.uri': 'URL de adjunto inválida'
        }),
        name: Joi.string().max(200).required(),
        type: Joi.string().max(100).required()
      })
    )
    .max(10)
    .optional()
    .messages({
      'array.max': 'Máximo 10 adjuntos permitidos'
    })
}).messages({
  'object.unknown': 'Campo {{#label}} no está permitido'
});

/**
 * Schema para eliminar métrica
 */
export const deleteHealthMetricSchema = Joi.object({
  id: mongoIdSchema.required()
    .messages({
      'any.required': 'El ID de la métrica es obligatorio'
    })
});
