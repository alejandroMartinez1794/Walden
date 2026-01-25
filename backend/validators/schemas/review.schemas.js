/**
 * ⭐ REVIEW VALIDATION SCHEMAS
 * 
 * Esquemas de validación para sistema de reseñas
 * 
 * ¿Por qué validar reseñas?
 * - Prevenir spam y contenido malicioso
 * - Asegurar calidad de feedback
 * - Proteger reputación de doctores
 * - Cumplir con políticas de contenido
 * 
 * Consideraciones:
 * - Reseñas solo después de cita completada
 * - Rating de 1-5 estrellas (estándar)
 * - Texto opcional pero con límites razonables
 * - No permitir múltiples reseñas por cita
 */

import Joi from 'joi';
import { mongoIdSchema, textLongSchema } from './common.schemas.js';

/**
 * Schema para crear reseña
 * 
 * Campos:
 * - doctor: ID del doctor (obligatorio)
 * - rating: 1-5 estrellas (obligatorio)
 * - reviewText: Comentario (obligatorio)
 * 
 * ¿Por qué rating obligatorio?
 * - Reseña sin rating no tiene sentido
 * - Necesario para calcular promedio del doctor
 * 
 * ¿Por qué texto obligatorio?
 * - Reseña sin texto no aporta valor
 * - Prevenir spam de ratings sin contexto
 * - Dar información útil a otros pacientes
 * 
 * Nota: El user se obtiene de req.userId (autenticación)
 */
export const createReviewSchema = Joi.object({
  // Doctor siendo reseñado
  doctor: mongoIdSchema
    .optional() // Controller asigna esto desde req.params si no está en body
    .messages({
      'any.required': 'El ID del doctor es obligatorio'
    }),

  /**
   * Rating: 1-5 estrellas
   * 
   * ¿Por qué solo enteros?
   * - Más simple (no 3.5 estrellas)
   * - Frontend usa estrellas completas
   * - Estándar en la industria
   * 
   * ¿Por qué 0 no es válido?
   * - Confuso para usuarios (0 = no rating vs 1 = muy malo)
   * - Sistema de 1-5 es más claro
   */
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'any.required': 'La calificación es obligatoria',
      'number.base': 'La calificación debe ser un número',
      'number.integer': 'La calificación debe ser un número entero',
      'number.min': 'La calificación mínima es 1 estrella',
      'number.max': 'La calificación máxima es 5 estrellas'
    }),

  /**
   * Texto de la reseña
   * 
   * Límites:
   * - Mínimo: 10 caracteres (evitar "Bien", "Malo")
   * - Máximo: 1000 caracteres (suficiente pero no spam)
   * 
   * ¿Por qué requerir mínimo?
   * - Forzar feedback útil
   * - Prevenir spam de ratings sin contexto
   * - Ayudar a doctores a mejorar
   */
  reviewText: textLongSchema
    .min(10)
    .max(1000)
    .required()
    .messages({
      'any.required': 'El texto de la reseña es obligatorio',
      'string.min': 'La reseña debe tener al menos 10 caracteres',
      'string.max': 'La reseña no puede exceder 1000 caracteres'
    })
});

/**
 * Schema para actualizar reseña
 * 
 * Casos de uso:
 * - Usuario quiere corregir typo
 * - Usuario quiere cambiar rating después de seguimiento
 * - Usuario quiere agregar más detalles
 * 
 * Restricciones:
 * - Solo el autor puede actualizar
 * - No se puede cambiar el doctor
 * - Todos los campos son opcionales (actualización parcial)
 * - Al menos un campo debe ser enviado
 */
export const updateReviewSchema = Joi.object({
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .messages({
      'number.integer': 'La calificación debe ser un número entero',
      'number.min': 'La calificación mínima es 1 estrella',
      'number.max': 'La calificación máxima es 5 estrellas'
    }),

  reviewText: textLongSchema
    .min(10)
    .max(1000)
    .messages({
      'string.min': 'La reseña debe tener al menos 10 caracteres',
      'string.max': 'La reseña no puede exceder 1000 caracteres'
    })
}).min(1) // Al menos un campo
  .messages({
    'object.min': 'Debe proporcionar al menos un campo para actualizar'
  });

/**
 * Schema para obtener reseña por ID
 * 
 * Uso: GET /api/v1/doctors/:doctorId/reviews/:id
 */
export const getReviewByIdSchema = Joi.object({
  id: mongoIdSchema.required()
    .messages({
      'any.required': 'El ID de la reseña es obligatorio'
    })
});

/**
 * Schema para obtener reseñas de un doctor
 * 
 * Filtros disponibles:
 * - rating: Filtrar por calificación específica
 * - minRating: Filtrar por calificación mínima
 * - sortBy: Ordenar por fecha o rating
 * - page, limit: Paginación
 * 
 * ¿Por qué filtros de rating?
 * - Usuarios quieren ver reseñas positivas/negativas
 * - Doctores quieren analizar feedback negativo
 * - Estadísticas y análisis
 */
export const getDoctorReviewsQuerySchema = Joi.object({
  // Paginación
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10),

  // Filtro por rating exacto
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .messages({
      'number.min': 'El rating debe ser entre 1 y 5',
      'number.max': 'El rating debe ser entre 1 y 5'
    }),

  // Filtro por rating mínimo
  minRating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .messages({
      'number.min': 'El rating mínimo debe ser entre 1 y 5',
      'number.max': 'El rating mínimo debe ser entre 1 y 5'
    }),

  /**
   * Ordenamiento
   * 
   * Opciones:
   * - recent: Más recientes primero (default)
   * - oldest: Más antiguas primero
   * - highest: Mejor rating primero
   * - lowest: Peor rating primero
   */
  sortBy: Joi.string()
    .valid('recent', 'oldest', 'highest', 'lowest')
    .default('recent')
    .messages({
      'any.only': 'sortBy debe ser: recent, oldest, highest, o lowest'
    })
});

/**
 * Schema para eliminar reseña
 * 
 * Consideraciones:
 * - Solo el autor puede eliminar
 * - Solo admin puede eliminar cualquier reseña (spam/abuso)
 * - Se recalcula promedio del doctor después de eliminar
 * 
 * TODO: Considerar soft-delete (mantener historial)
 */
export const deleteReviewSchema = Joi.object({
  id: mongoIdSchema.required()
    .messages({
      'any.required': 'El ID de la reseña es obligatorio para eliminación'
    })
});

/**
 * Schema para reportar reseña (abuso/spam)
 * 
 * Casos de uso:
 * - Doctor reporta reseña falsa
 * - Usuario reporta reseña inapropiada
 * - Admin revisa y elimina si es necesario
 * 
 * Campos:
 * - reason: Razón del reporte
 * - details: Detalles adicionales opcionales
 * 
 * TODO: Implementar sistema de reportes en backend
 */
export const reportReviewSchema = Joi.object({
  id: mongoIdSchema.required()
    .messages({
      'any.required': 'El ID de la reseña es obligatorio'
    }),

  /**
   * Razón del reporte
   * 
   * Categorías:
   * - spam: Contenido promocional o repetitivo
   * - fake: Reseña falsa o fraudulenta
   * - inappropriate: Lenguaje ofensivo o inapropiado
   * - irrelevant: Contenido no relacionado con el servicio
   * - other: Otra razón (requiere details)
   */
  reason: Joi.string()
    .valid('spam', 'fake', 'inappropriate', 'irrelevant', 'other')
    .required()
    .messages({
      'any.required': 'La razón del reporte es obligatoria',
      'any.only': 'Razón inválida. Debe ser: spam, fake, inappropriate, irrelevant, u other'
    }),

  // Detalles adicionales (obligatorio si reason = 'other')
  details: Joi.string()
    .min(10)
    .max(500)
    .when('reason', {
      is: 'other',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'any.required': 'Debe proporcionar detalles si la razón es "other"',
      'string.min': 'Los detalles deben tener al menos 10 caracteres',
      'string.max': 'Los detalles no pueden exceder 500 caracteres'
    })
});
