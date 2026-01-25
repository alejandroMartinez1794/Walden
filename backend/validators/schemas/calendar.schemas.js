/**
 * 📅 CALENDAR VALIDATION SCHEMAS
 * 
 * Esquemas de validación para Google Calendar
 * 
 * ¿Por qué validar calendario?
 * - Prevenir eventos mal formados
 * - Asegurar fechas válidas
 * - Proteger integridad de sincronización
 */

import Joi from 'joi';
import { mongoIdSchema, dateISOSchema, emailSchema } from './common.schemas.js';

/**
 * Schema para crear evento en Google Calendar
 * 
 * Validación:
 * - summary: Título del evento (obligatorio)
 * - description: Descripción (opcional)
 * - start/startTime: Fecha/hora inicio (ISO 8601)
 * - end/endTime: Fecha/hora fin (ISO 8601, debe ser > start)
 * - attendees: Array de emails (opcional)
 * - doctorId: ID del doctor (para vincular booking)
 * - reason: Motivo de la consulta (para booking)
 */
export const createCalendarEventSchema = Joi.object({
  summary: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      'any.required': 'El título del evento es requerido',
      'string.min': 'El título debe tener al menos 3 caracteres',
      'string.max': 'El título no puede exceder 200 caracteres'
    }),

  description: Joi.string()
    .max(2000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'La descripción no puede exceder 2000 caracteres'
    }),

  // Soportar ambos nombres (start/startTime)
  start: dateISOSchema
    .min('now')
    .when('startTime', {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.required()
    })
    .messages({
      'date.min': 'La fecha de inicio no puede ser en el pasado',
      'any.required': 'La fecha de inicio es requerida'
    }),

  startTime: dateISOSchema
    .min('now')
    .optional()
    .messages({
      'date.min': 'La fecha de inicio no puede ser en el pasado'
    }),

  // Soportar ambos nombres (end/endTime)
  end: dateISOSchema
    .min(Joi.ref('start'))
    .when('endTime', {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.when('start', {
        is: Joi.exist(),
        then: Joi.required(),
        otherwise: Joi.optional()
      })
    })
    .messages({
      'date.min': 'La fecha de fin debe ser posterior a la de inicio',
      'any.required': 'La fecha de fin es requerida'
    }),

  endTime: dateISOSchema
    .min(Joi.ref('startTime'))
    .optional()
    .messages({
      'date.min': 'La fecha de fin debe ser posterior a la de inicio'
    }),

  attendees: Joi.array()
    .items(
      Joi.object({
        email: emailSchema.required()
      })
    )
    .max(20)
    .optional()
    .messages({
      'array.max': 'Máximo 20 asistentes permitidos'
    }),

  doctorId: mongoIdSchema
    .required()
    .messages({
      'any.required': 'El ID del doctor es requerido'
    }),

  reason: Joi.string()
    .min(20)
    .max(2000)
    .optional()
    .messages({
      'string.min': 'El motivo debe tener al menos 20 caracteres',
      'string.max': 'El motivo no puede exceder 2000 caracteres'
    })
});

/**
 * Schema para obtener eventos (query params)
 * 
 * Filtros opcionales:
 * - maxResults: Número de eventos (1-2500)
 * - timeMin: Fecha mínima (ISO 8601)
 * - timeMax: Fecha máxima (ISO 8601)
 */
export const getCalendarEventsQuerySchema = Joi.object({
  maxResults: Joi.number()
    .integer()
    .min(1)
    .max(2500)
    .default(50)
    .messages({
      'number.min': 'Mínimo 1 evento',
      'number.max': 'Máximo 2500 eventos'
    }),

  timeMin: dateISOSchema
    .optional()
    .messages({
      'date.base': 'Fecha mínima inválida'
    }),

  timeMax: dateISOSchema
    .optional()
    .min(Joi.ref('timeMin'))
    .messages({
      'date.base': 'Fecha máxima inválida',
      'date.min': 'Fecha máxima debe ser posterior a fecha mínima'
    })
});

/**
 * Schema para actualizar evento
 * 
 * Similar a crear pero todos los campos son opcionales
 */
export const updateCalendarEventSchema = Joi.object({
  summary: Joi.string().min(3).max(200),
  description: Joi.string().max(2000).allow(''),
  start: dateISOSchema.min('now'),
  end: dateISOSchema.min(Joi.ref('start')),
  attendees: Joi.array().items(
    Joi.object({
      email: emailSchema.required()
    })
  ).max(20)
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar'
});
