import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, verifyEmail, resendVerification, getCsrfToken, logout } from '../Controllers/authController.js';
import { authenticate } from '../auth/verifyToken.js';
import { auditAuth } from '../middleware/auditLogger.js';

// ✅ IMPORTAR VALIDACIÓN
import { validate } from '../validators/middleware/validate.js';
import { 
	registerSchema, 
	loginSchema, 
	emailVerificationSchema,
	passwordResetRequestSchema 
} from '../validators/schemas/auth.schemas.js';

const router = express.Router();

/**
 * 🛡️ RATE LIMITER PARA AUTENTICACIÓN
 * 
 * ¿Por qué limitar intentos?
 * - Prevenir ataques de fuerza bruta (adivinar contraseñas)
 * - Prevenir enumeración de usuarios (verificar si un email existe)
 * - Proteger recursos del servidor
 * 
 * Configuración:
 * - Ventana: 15 minutos
 * - Máximo: 10 intentos por ventana
 * - Después: Bloqueo temporal de 15 minutos
 * 
 * ⚠️ DESHABILITADO en tests para no bloquear integration tests
 */
const authLimiter = process.env.NODE_ENV === 'test' 
	? (req, res, next) => next() // Bypass en tests
	: rateLimit({
		windowMs: 15 * 60 * 1000,
		max: 10,
		message: 'Demasiados intentos. Intenta nuevamente en 15 minutos.',
	});

/**
 * 📝 REGISTRO DE USUARIO
 * 
 * Capas de seguridad:
 * 1. Rate limiting (10 intentos/15min)
 * 2. Validación Joi (formato, tipos, reglas de negocio)
 * 3. Controller (lógica, hash de contraseña, verificación de duplicados)
 * 
 * ¿Por qué validar ANTES del controller?
 * - Fallar rápido = menos carga en el servidor
 * - Errores claros = mejor UX
 * - Prevenir datos maliciosos lleguen a MongoDB
 */
router.post('/register', authLimiter, validate(registerSchema), register);

/**
 * 🔐 LOGIN DE USUARIO
 * 
 * Validación simple:
 * - Email formato válido
 * - Password no vacío (no validamos complejidad en login)
 * 
 * ¿Por qué no validar complejidad en login?
 * - Pueden existir contraseñas legacy (creadas antes de reglas actuales)
 * - La validación de complejidad solo aplica en REGISTRO
 * - En login solo verificamos que el input no sea vacío
 * 
 * HIPAA Compliance: auditAuth('LOGIN_SUCCESS') registra todos los intentos
 */
router.post('/login', authLimiter, validate(loginSchema), auditAuth('LOGIN_SUCCESS'), login);

/**
 * 🎫 CSRF TOKEN
 * 
 * No requiere validación (endpoint público GET sin parámetros)
 */
router.get('/csrf-token', getCsrfToken);

/**
 * ✉️ VERIFICACIÓN DE EMAIL
 * 
 * Valida formato de token:
 * - Debe ser string hexadecimal de 64 caracteres
 * - Previene inyección de datos maliciosos
 * 
 * Ejemplo: GET /verify-email?token=abc123...
 */
router.get('/verify-email', validate(emailVerificationSchema, 'query'), verifyEmail);

/**
 * 🔄 REENVIAR EMAIL DE VERIFICACIÓN
 * 
 * Rate limited para prevenir spam de emails
 * Valida que el email sea formato válido
 */
router.post('/resend-verification', authLimiter, validate(passwordResetRequestSchema), resendVerification);

/**
 * 🚪 LOGOUT
 * 
 * ✅ SEGURIDAD: Ahora requiere autenticación para invalidar el token
 * - Middleware authenticate extrae el token y userId
 * - Controller lo agrega a blacklist
 * - Audit log registra el evento (HIPAA compliance)
 */
router.post('/logout', authenticate, logout);

export default router;