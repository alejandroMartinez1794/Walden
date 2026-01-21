/**
 * 🔐 AUTH VALIDATION SCHEMAS
 * 
 * Validaciones para endpoints de autenticación
 * 
 * Seguridad en capas:
 * 1. Validación de formato (esta capa)
 * 2. Rate limiting (middleware de Express)
 * 3. hCaptcha (anti-bots)
 * 4. Verificación de credenciales (controller)
 * 5. 2FA opcional (controller)
 */

import Joi from 'joi';
import { emailSchema, passwordSchema, roleSchema, textShortSchema } from './common.schemas.js';

/**
 * 📝 REGISTRO DE USUARIO
 * 
 * Campos validados:
 * - name: Nombre completo (2-100 caracteres)
 * - email: Email válido, normalizado
 * - password: Mínimo 8 caracteres con requisitos de seguridad
 * - role: Solo 'paciente' o 'doctor' (admin se crea manualmente)
 * - photo: Opcional, URL de imagen
 * - gender: Opcional, male/female/other
 * 
 * ¿Por qué no permitir crear admins desde registro?
 * - Seguridad: Admins deben crearse manualmente
 * - Auditoría: Registro de quién crea admins
 * - Prevención: Evita escalación de privilegios
 */
export const registerSchema = Joi.object({
  name: textShortSchema.required(),
  
  email: emailSchema.required(),
  
  password: passwordSchema.required(),
  
  role: Joi.string()
    .valid('paciente', 'doctor') // NO permitir 'admin' en registro público
    .default('paciente')
    .messages({
      'any.only': 'Rol debe ser "paciente" o "doctor"'
    }),
  
  photo: Joi.string()
    .uri()
    .optional()
    .allow('') // Permite string vacío
    .messages({
      'string.uri': 'Foto debe ser una URL válida'
    }),
  
  gender: Joi.string()
    .valid('male', 'female', 'other')
    .optional()
    .messages({
      'any.only': 'Género debe ser: male, female o other'
    }),
  
  // Campos específicos para doctores (opcionales en registro, se completan después)
  specialization: Joi.when('role', {
    is: 'doctor',
    then: Joi.string().min(3).max(100).optional(),
    otherwise: Joi.forbidden() // No permitir si no es doctor
  }),
  
  ticketPrice: Joi.when('role', {
    is: 'doctor',
    then: Joi.number().min(0).max(1000000).optional(),
    otherwise: Joi.forbidden()
  })
}).messages({
  'object.unknown': 'Campo {{#label}} no está permitido'
});

/**
 * 🔓 LOGIN
 * 
 * Solo email y password
 * 
 * ¿Por qué no validar más campos?
 * - Login debe ser rápido y simple
 * - Más campos = más oportunidades de error
 * - Rate limiting protege contra brute force
 * 
 * Nota: En producción, agregar hCaptcha token validation
 */
export const loginSchema = Joi.object({
  email: emailSchema.required(),
  
  password: Joi.string()
    .required()
    // NO validar formato en login, solo que exista
    // ¿Por qué? Usuario puede tener password viejo antes de actualizar requisitos
    .messages({
      'any.required': 'Password es requerido',
      'string.empty': 'Password no puede estar vacío'
    }),
  
  // Token de hCaptcha (opcional en dev, obligatorio en prod)
  hcaptchaToken: Joi.string()
    .when(Joi.ref('$env'), {
      is: 'production',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'any.required': 'Token hCaptcha es requerido'
    })
}).messages({
  'object.unknown': 'Campo {{#label}} no está permitido'
});

/**
 * 🔄 PASSWORD RESET REQUEST
 * 
 * Solo email, genera token de reset
 * 
 * ¿Por qué no revelar si email existe?
 * - Previene enumeración de usuarios
 * - Siempre devolver "Email enviado si existe"
 */
export const passwordResetRequestSchema = Joi.object({
  email: emailSchema.required()
});

/**
 * 🔄 PASSWORD RESET CONFIRM
 * 
 * Token + nuevo password
 * 
 * ¿Por qué validar token en middleware separado?
 * - Token viene de URL, no de body
 * - JWT validation es diferente a Joi validation
 */
export const passwordResetConfirmSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Token de reset es requerido'
    }),
  
  newPassword: passwordSchema.required(),
  
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Las contraseñas deben coincidir',
      'any.required': 'Confirmación de contraseña es requerida'
    })
});

/**
 * 🔐 CHANGE PASSWORD (usuario autenticado)
 * 
 * Requiere password actual para confirmar identidad
 * 
 * ¿Por qué pedir password actual?
 * - Previene cambio si alguien deja sesión abierta
 * - Segunda capa de autenticación
 */
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Password actual es requerido'
    }),
  
  newPassword: passwordSchema
    .invalid(Joi.ref('currentPassword'))
    .required()
    .messages({
      'any.invalid': 'Nuevo password debe ser diferente al actual'
    }),
  
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Las contraseñas deben coincidir'
    })
});

/**
 * 📧 EMAIL VERIFICATION
 * 
 * Token de verificación de email
 */
export const emailVerificationSchema = Joi.object({
  token: Joi.string()
    .length(64) // Token hexadecimal de 64 caracteres
    .hex()
    .required()
    .messages({
      'string.length': 'Token de verificación inválido',
      'string.hex': 'Token de verificación inválido',
      'any.required': 'Token es requerido'
    })
});

/**
 * 🔐 2FA SETUP
 * 
 * Confirmar código de 6 dígitos
 */
export const twoFactorSetupSchema = Joi.object({
  token: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.length': 'Código debe tener 6 dígitos',
      'string.pattern.base': 'Código debe contener solo números',
      'any.required': 'Código 2FA es requerido'
    })
});

/**
 * 🔐 2FA LOGIN
 * 
 * Email + código 2FA (sin password, ya se validó antes)
 */
export const twoFactorLoginSchema = Joi.object({
  token: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.length': 'Código debe tener 6 dígitos',
      'string.pattern.base': 'Código debe contener solo números',
      'any.required': 'Código 2FA es requerido'
    }),
  
  // Token temporal del primer paso de login
  tempToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Token temporal es requerido'
    })
});
