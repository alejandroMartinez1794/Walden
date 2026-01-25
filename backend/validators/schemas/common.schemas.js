/**
 * 📦 COMMON SCHEMAS
 * 
 * Esquemas reutilizables que se usan en múltiples endpoints
 * 
 * ¿Por qué separar esquemas comunes?
 * - DRY (Don't Repeat Yourself)
 * - Consistencia en validaciones
 * - Fácil actualización global
 */

import Joi from 'joi';

/**
 * 🆔 MongoDB ObjectId
 * 
 * Formato: String hexadecimal de 24 caracteres
 * Ejemplo: "507f1f77bcf86cd799439011"
 * 
 * ¿Por qué validar el formato?
 * - Evita queries inválidas a MongoDB
 * - Previene inyección de código malicioso
 * - Da feedback inmediato al usuario
 */
export const mongoIdSchema = Joi.string()
  .hex()
  .length(24)
  .messages({
    'string.hex': 'ID debe ser un string hexadecimal válido',
    'string.length': 'ID debe tener exactamente 24 caracteres',
    'any.required': 'ID es requerido'
  });

/**
 * 📧 Email
 * 
 * Valida formato de email según RFC 5322
 * Convierte a minúsculas automáticamente (normalización)
 * 
 * ¿Por qué normalizar?
 * - Email@example.com === email@example.com
 * - Evita duplicados por case sensitivity
 */
export const emailSchema = Joi.string()
  .email({ tlds: { allow: false } }) // Permite cualquier TLD (no solo .com, .org)
  .lowercase()
  .trim()
  .max(254) // RFC 5321 max length
  .messages({
    'string.email': 'Email debe tener formato válido',
    'string.max': 'Email no puede exceder 254 caracteres',
    'any.required': 'Email es requerido'
  });

/**
 * 🔐 Password
 * 
 * Requisitos de seguridad:
 * - Mínimo 8 caracteres
 * - Al menos 1 mayúscula
 * - Al menos 1 minúscula
 * - Al menos 1 número
 * - Al menos 1 símbolo especial
 * 
 * ¿Por qué estos requisitos?
 * - NIST guidelines (SP 800-63B)
 * - Protección contra ataques de diccionario
 * - Balance entre seguridad y usabilidad
 */
export const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .messages({
    'string.min': 'Password debe tener al menos 8 caracteres',
    'string.max': 'Password no puede exceder 128 caracteres',
    'string.pattern.base': 'Password debe contener: mayúscula, minúscula, número y símbolo especial (@$!%*?&)',
    'any.required': 'Password es requerido'
  });

/**
 * 📱 Teléfono (formato internacional)
 * 
 * Acepta formatos:
 * - +573001234567 (internacional)
 * - 3001234567 (local Colombia)
 * - +1-555-123-4567 (con guiones)
 * 
 * ¿Por qué formato flexible?
 * - Usuarios escriben teléfonos de formas distintas
 * - Backend puede normalizar después
 */
export const phoneSchema = Joi.string()
  .pattern(/^[+]?[\d\s\-()]{7,20}$/)
  .trim()
  .messages({
    'string.pattern.base': 'Teléfono debe contener solo números, espacios, guiones o paréntesis',
    'any.required': 'Teléfono es requerido'
  });

/**
 * 📅 Fecha ISO 8601
 * 
 * Formato: YYYY-MM-DDTHH:mm:ss.sssZ
 * Ejemplo: "2026-01-20T14:30:00.000Z"
 * 
 * ¿Por qué ISO 8601?
 * - Estándar internacional
 * - No hay ambigüedad (01/02/2026 = ¿ene 2 o feb 1?)
 * - MongoDB lo maneja nativamente
 */
export const dateISOSchema = Joi.date()
  .iso()
  .messages({
    'date.format': 'Fecha debe estar en formato ISO 8601',
    'date.base': 'Fecha inválida',
    'any.required': 'Fecha es requerida'
  });

/**
 * 🔢 Paginación
 * 
 * Esquema para endpoints con listados
 * Previene que usuarios pidan 10,000 registros y tumben el servidor
 * 
 * ¿Por qué limitar?
 * - Protección contra DoS (Denial of Service)
 * - Performance: queries grandes son lentas
 * - UX: Nadie quiere ver 1000 registros en pantalla
 */
export const paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Página debe ser un número',
      'number.min': 'Página debe ser mayor o igual a 1'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100) // Máximo 100 registros por request
    .default(20)
    .messages({
      'number.base': 'Límite debe ser un número',
      'number.min': 'Límite debe ser al menos 1',
      'number.max': 'Límite no puede exceder 100 registros'
    })
});

/**
 * 🏷️ Roles permitidos
 * 
 * ¿Por qué validar roles?
 * - Evita que usuarios se auto-asignen rol "admin"
 * - Previene roles no existentes en el sistema
 */
export const roleSchema = Joi.string()
  .valid('paciente', 'doctor', 'admin')
  .messages({
    'any.only': 'Rol debe ser: paciente, doctor o admin',
    'any.required': 'Rol es requerido'
  });

/**
 * 🔗 URL
 * 
 * Valida URLs para callbacks, redirects, etc.
 * 
 * ¿Por qué validar URLs?
 * - Previene Open Redirect vulnerabilities
 * - Evita XSS a través de javascript: URLs
 */
export const urlSchema = Joi.string()
  .uri({ scheme: ['http', 'https'] })
  .messages({
    'string.uri': 'URL debe ser válida y comenzar con http:// o https://',
    'any.required': 'URL es requerida'
  });

/**
 * 📝 Texto largo (descripciones, razones, notas)
 * 
 * ¿Por qué limitar caracteres?
 * - Evita spam/abuso
 * - Limita tamaño de documentos en DB
 * - UX: textos muy largos son difíciles de leer
 */
export const textLongSchema = Joi.string()
  .min(10)
  .max(2000)
  .trim()
  .messages({
    'string.min': 'Texto debe tener al menos 10 caracteres',
    'string.max': 'Texto no puede exceder 2000 caracteres',
    'any.required': 'Texto es requerido'
  });

/**
 * 📝 Texto corto (nombres, títulos)
 */
export const textShortSchema = Joi.string()
  .min(2)
  .max(100)
  .trim()
  .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/) // Solo letras, espacios y puntos
  .messages({
    'string.min': 'Debe tener al menos 2 caracteres',
    'string.max': 'No puede exceder 100 caracteres',
    'string.pattern.base': 'Solo se permiten letras, espacios y puntos',
    'any.required': 'Este campo es requerido'
  });
