/**
 * 📅 BOOKING VALIDATION SCHEMAS
 * 
 * Validaciones para el sistema de reservas de citas
 * 
 * Reglas de negocio implementadas:
 * - Citas solo en horario laboral (8am - 8pm)
 * - Mínimo 1 hora de anticipación
 * - Máximo 3 meses en el futuro
 * - Duración entre 30 min y 4 horas
 */

import Joi from 'joi';
import { mongoIdSchema, textLongSchema } from './common.schemas.js';

/**
 * ✅ CREATE BOOKING
 * 
 * Campos requeridos:
 * - doctorId: ID del doctor (debe existir en DB)
 * - appointmentDate: Fecha/hora de la cita
 * - reason: Motivo de la consulta
 * 
 * Validaciones de negocio:
 * 1. Fecha futura (no se puede agendar en el pasado)
 * 2. Dentro de horario laboral (8am - 8pm)
 * 3. Mínimo 1 hora de anticipación
 * 4. Máximo 3 meses adelante
 * 
 * ¿Por qué estas restricciones?
 * - Horario laboral: Evita citas a medianoche
 * - Anticipación: Doctor necesita prepararse
 * - Máximo 3 meses: Disponibilidad puede cambiar
 */
export const createBookingSchema = Joi.object({
  doctorId: mongoIdSchema.required(),
  
  appointmentDate: Joi.date()
    .iso()
    .min('now') // No se puede agendar en el pasado
    .max(Joi.ref('$maxDate')) // Máximo 3 meses (se pasa desde middleware)
    .required()
    .custom((value, helpers) => {
      const date = new Date(value);
      const hour = date.getHours();
      
      // Validar horario laboral (8am - 8pm)
      if (hour < 8 || hour >= 20) {
        return helpers.error('date.workingHours');
      }
      
      // Validar que sea al menos 1 hora en el futuro
      const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
      if (date < oneHourFromNow) {
        return helpers.error('date.tooSoon');
      }
      
      // Validar que no sea fin de semana (opcional)
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return helpers.error('date.weekend');
      }
      
      return value;
    })
    .messages({
      'date.base': 'Fecha inválida',
      'date.min': 'No se pueden agendar citas en el pasado',
      'date.max': 'Solo se pueden agendar citas hasta 3 meses adelante',
      'date.workingHours': 'Citas solo entre 8:00 AM y 8:00 PM',
      'date.tooSoon': 'Citas deben agendarse con al menos 1 hora de anticipación',
      'date.weekend': 'No se agendan citas los fines de semana',
      'any.required': 'Fecha de cita es requerida'
    }),
  
  reason: textLongSchema
    .min(20) // Mínimo 20 caracteres para razón
    .required()
    .messages({
      'string.min': 'Motivo de consulta debe tener al menos 20 caracteres',
      'any.required': 'Motivo de consulta es requerido'
    }),
  
  // Campos opcionales
  notes: Joi.string()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Notas no pueden exceder 1000 caracteres'
    }),
  
  // Duración estimada en minutos (30, 60, 90, 120, etc.)
  duration: Joi.number()
    .integer()
    .min(30)
    .max(240) // Máximo 4 horas
    .default(60)
    .messages({
      'number.min': 'Duración mínima: 30 minutos',
      'number.max': 'Duración máxima: 4 horas (240 minutos)'
    })
});

/**
 * 🔄 UPDATE BOOKING
 * 
 * Similar a create, pero todos los campos son opcionales
 * Solo se actualiza lo que se envía
 * 
 * ¿Por qué permitir actualización parcial?
 * - UX: Usuario puede cambiar solo la fecha sin re-escribir todo
 * - Eficiencia: Menos datos en el request
 * 
 * Restricciones:
 * - No se puede cambiar el doctor (debe cancelar y crear nueva)
 * - No se puede actualizar si la cita ya pasó
 * - No se puede actualizar si está cancelada
 */
export const updateBookingSchema = Joi.object({
  appointmentDate: Joi.date()
    .iso()
    .min('now')
    .optional()
    .custom((value, helpers) => {
      const date = new Date(value);
      const hour = date.getHours();
      
      if (hour < 8 || hour >= 20) {
        return helpers.error('date.workingHours');
      }
      
      const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
      if (date < oneHourFromNow) {
        return helpers.error('date.tooSoon');
      }
      
      return value;
    })
    .messages({
      'date.workingHours': 'Citas solo entre 8:00 AM y 8:00 PM',
      'date.tooSoon': 'Citas deben agendarse con al menos 1 hora de anticipación'
    }),
  
  reason: textLongSchema.min(20).optional(),
  
  notes: Joi.string().max(1000).optional().allow(''),
  
  duration: Joi.number().integer().min(30).max(240).optional(),
  
  // Estado de la cita (solo doctor puede cambiar)
  status: Joi.string()
    .valid('pending', 'confirmed', 'cancelled', 'completed')
    .optional()
    .messages({
      'any.only': 'Estado inválido'
    })
}).min(1) // Al menos un campo debe estar presente
  .messages({
    'object.min': 'Debe proporcionar al menos un campo para actualizar'
  });

/**
 * ❌ CANCEL BOOKING
 * 
 * Solo requiere razón de cancelación
 * 
 * ¿Por qué pedir razón?
 * - Analytics: Entender por qué cancelan
 * - Mejora: Identificar problemas recurrentes
 * - Compliance: Auditoría de cambios
 */
export const cancelBookingSchema = Joi.object({
  cancellationReason: Joi.string()
    .min(10)
    .max(500)
    .required()
    .messages({
      'string.min': 'Razón de cancelación debe tener al menos 10 caracteres',
      'string.max': 'Razón de cancelación no puede exceder 500 caracteres',
      'any.required': 'Razón de cancelación es requerida'
    })
});

/**
 * 📋 GET BOOKINGS (con filtros)
 * 
 * Query parameters para filtrar citas
 * 
 * Filtros disponibles:
 * - status: pending, confirmed, cancelled, completed
 * - dateFrom: Desde fecha X
 * - dateTo: Hasta fecha Y
 * - doctorId: Citas con doctor específico
 * 
 * ¿Por qué validar query params?
 * - Previene queries maliciosas
 * - Mejora performance (no queries innecesarias)
 */
export const getBookingsQuerySchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'confirmed', 'cancelled', 'completed', 'all')
    .default('all')
    .messages({
      'any.only': 'Estado debe ser: pending, confirmed, cancelled, completed o all'
    }),
  
  dateFrom: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.base': 'Fecha desde inválida'
    }),
  
  dateTo: Joi.date()
    .iso()
    .min(Joi.ref('dateFrom')) // dateTo debe ser después de dateFrom
    .optional()
    .messages({
      'date.base': 'Fecha hasta inválida',
      'date.min': 'Fecha hasta debe ser posterior a fecha desde'
    }),
  
  doctorId: mongoIdSchema.optional(),
  
  // Paginación
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

/**
 * ⭐ RATE BOOKING (calificación post-cita)
 * 
 * Permite al paciente calificar la cita después de completada
 * 
 * ¿Por qué permitir calificaciones?
 * - Feedback para doctores
 * - Mejora continua
 * - Transparencia para otros pacientes
 */
export const rateBookingSchema = Joi.object({
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.min': 'Calificación debe ser entre 1 y 5',
      'number.max': 'Calificación debe ser entre 1 y 5',
      'any.required': 'Calificación es requerida'
    }),
  
  comment: Joi.string()
    .min(10)
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.min': 'Comentario debe tener al menos 10 caracteres',
      'string.max': 'Comentario no puede exceder 1000 caracteres'
    })
});
