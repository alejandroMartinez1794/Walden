/**
 * 🧑‍⚕️ USER VALIDATION SCHEMAS
 * 
 * Esquemas de validación para operaciones de pacientes
 * 
 * ¿Por qué validar usuarios?
 * - Los pacientes pueden actualizar su perfil
 * - Prevenir inyección de datos maliciosos
 * - Asegurar integridad de datos médicos
 * - Proteger información sensible (HIPAA)
 * 
 * Principios de validación:
 * 1. Menos campos en actualización = menos superficie de ataque
 * 2. Nunca permitir cambiar rol desde el frontend
 * 3. Sanitizar todos los inputs de texto
 * 4. Validar formatos estrictamente (teléfono, email)
 */

import Joi from 'joi';
import {
  emailSchema,
  phoneSchema,
  textShortSchema,
  mongoIdSchema,
  urlSchema,
  paginationSchema
} from './common.schemas.js';

/**
 * Schema para actualización de perfil de paciente
 * 
 * ¿Qué puede actualizar un paciente?
 * - Información de contacto (nombre, email, teléfono)
 * - Foto de perfil
 * - Género
 * - Tipo de sangre
 * 
 * ¿Qué NO puede actualizar?
 * - role: Evitar escalación de privilegios
 * - password: Tiene endpoint separado (seguridad)
 * - isApproved: Solo admin puede cambiar esto
 * 
 * Nota: Todos los campos son opcionales para permitir actualizaciones parciales
 */
export const updateUserSchema = Joi.object({
  // Información básica
  name: textShortSchema
    .min(2)
    .max(100)
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres'
    }),

  email: emailSchema,

  phone: phoneSchema,

  // Foto de perfil (URL de Cloudinary u otro servicio)
  photo: urlSchema
    .messages({
      'string.uri': 'La URL de la foto no es válida'
    }),

  // Género (opciones limitadas para privacidad)
  gender: Joi.string()
    .valid('male', 'female', 'other', 'prefer-not-to-say')
    .messages({
      'any.only': 'El género debe ser: male, female, other, o prefer-not-to-say'
    }),

  // Tipo de sangre (validación médica importante)
  bloodType: Joi.string()
    .valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
    .messages({
      'any.only': 'Tipo de sangre inválido. Valores permitidos: A+, A-, B+, B-, AB+, AB-, O+, O-'
    })
}).min(1) // Al menos un campo debe ser enviado
  .messages({
    'object.min': 'Debe proporcionar al menos un campo para actualizar'
  });

/**
 * Schema para obtener perfil de usuario por ID
 * 
 * ¿Por qué validar esto?
 * - Prevenir inyección de datos maliciosos en parámetros de ruta
 * - Asegurar que el ID es un ObjectId válido de MongoDB
 * - Evitar errores de CastError en Mongoose
 * 
 * Ejemplo: GET /api/v1/users/507f1f77bcf86cd799439011
 */
export const getUserByIdSchema = Joi.object({
  id: mongoIdSchema.required()
    .messages({
      'any.required': 'El ID de usuario es obligatorio'
    })
});

/**
 * Schema para obtener lista de usuarios (admin)
 * 
 * ¿Por qué paginación?
 * - Prevenir ataques DoS (no cargar 100K usuarios de una vez)
 * - Mejorar rendimiento de la base de datos
 * - Reducir uso de memoria
 * 
 * Filtros disponibles:
 * - role: Filtrar por tipo de usuario (paciente, doctor, admin)
 * - search: Búsqueda por nombre o email
 * - isApproved: Filtrar usuarios aprobados/pendientes
 */
export const getUsersQuerySchema = Joi.object({
  // Paginación (heredada de common.schemas.js)
  ...paginationSchema.extract(['page', 'limit']),

  // Filtro por rol
  role: Joi.string()
    .valid('paciente', 'doctor', 'admin')
    .messages({
      'any.only': 'Rol inválido. Valores permitidos: paciente, doctor, admin'
    }),

  // Búsqueda de texto (case-insensitive)
  search: Joi.string()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'La búsqueda debe tener al menos 2 caracteres',
      'string.max': 'La búsqueda no puede exceder 100 caracteres'
    }),

  // Filtro por estado de aprobación
  isApproved: Joi.boolean()
    .messages({
      'boolean.base': 'isApproved debe ser true o false'
    })
});

/**
 * Schema para eliminar usuario
 * 
 * ¿Por qué validar eliminación?
 * - Prevenir eliminación accidental de múltiples usuarios
 * - Asegurar que solo se elimine un usuario específico
 * - Proteger contra ataques de fuerza bruta
 * 
 * Consideraciones de seguridad:
 * - Solo admins pueden eliminar usuarios
 * - Verificar en middleware que el ID existe
 * - Considerar soft-delete en lugar de hard-delete
 * 
 * TODO: Implementar soft-delete (campo deletedAt)
 */
export const deleteUserSchema = Joi.object({
  id: mongoIdSchema.required()
    .messages({
      'any.required': 'El ID de usuario es obligatorio para eliminación'
    })
});

/**
 * Schema para aprobar/rechazar usuario (admin)
 * 
 * ¿Para qué sirve?
 * - Algunos usuarios requieren aprobación manual (verificación KYC)
 * - Prevenir cuentas falsas o spam
 * - Control de calidad de la plataforma
 * 
 * Flujo:
 * 1. Usuario se registra → isApproved = false
 * 2. Admin revisa perfil
 * 3. Admin aprueba → isApproved = true
 * 4. Usuario puede acceder a todas las funciones
 */
export const approveUserSchema = Joi.object({
  id: mongoIdSchema.required()
    .messages({
      'any.required': 'El ID de usuario es obligatorio'
    }),

  isApproved: Joi.boolean()
    .required()
    .messages({
      'any.required': 'El estado de aprobación es obligatorio',
      'boolean.base': 'isApproved debe ser true o false'
    }),

  // Razón de rechazo (obligatorio si se rechaza)
  rejectionReason: Joi.string()
    .min(10)
    .max(500)
    .when('isApproved', {
      is: false,
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'any.required': 'Debe proporcionar una razón de rechazo',
      'string.min': 'La razón debe tener al menos 10 caracteres',
      'string.max': 'La razón no puede exceder 500 caracteres'
    })
});
