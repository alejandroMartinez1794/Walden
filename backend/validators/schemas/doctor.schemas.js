/**
 * 👨‍⚕️ DOCTOR VALIDATION SCHEMAS
 * 
 * Esquemas de validación para operaciones de doctores
 * 
 * ¿Por qué validación específica para doctores?
 * - Los doctores tienen campos profesionales únicos (especialización, certificaciones)
 * - Mayor impacto en la plataforma (citas, pacientes)
 * - Información sensible (precios, disponibilidad)
 * - Requerimientos legales (licencia médica válida)
 * 
 * Diferencias con pacientes:
 * - Más campos obligatorios (especialización, licencia)
 * - Validación de precios y tarifas
 * - Control de disponibilidad horaria
 * - Experiencia y calificaciones
 */

import Joi from 'joi';
import {
  emailSchema,
  phoneSchema,
  textShortSchema,
  textLongSchema,
  mongoIdSchema,
  urlSchema,
  paginationSchema
} from './common.schemas.js';

/**
 * Schema para actualización de perfil de doctor
 * 
 * ¿Qué puede actualizar un doctor?
 * - Información profesional (especialización, experiencia)
 * - Tarifas de consulta
 * - Disponibilidad
 * - Foto y biografía
 * 
 * Seguridad:
 * - No puede cambiar su rol
 * - No puede auto-aprobarse (isApproved lo controla admin)
 * - Precio mínimo para prevenir errores (no puede ser gratis)
 * 
 * Todos los campos son opcionales (actualizaciones parciales)
 */
export const updateDoctorSchema = Joi.object({
  // Información básica
  name: textShortSchema
    .min(3)
    .max(100)
    .messages({
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres'
    }),

  email: emailSchema,

  phone: phoneSchema,

  photo: urlSchema
    .messages({
      'string.uri': 'La URL de la foto no es válida'
    }),

  // Información profesional
  specialization: Joi.string()
    .valid(
      'Psicologia', 'Psiquiatria', 'Medicina General', 'Cardiologia',
      'Neurologia', 'Pediatria', 'Dermatologia', 'Ginecologia'
    )
    .messages({
      'any.only': 'La especialización debe ser una de las permitidas',
      'string.min': 'La especialización debe tener al menos 3 caracteres',
      'string.max': 'La especialización no puede exceder 100 caracteres'
    }),

  /**
   * Años de experiencia
   * 
   * ¿Por qué validar esto?
   * - Confianza del paciente (experiencia = credibilidad)
   * - Filtrado de búsqueda (pacientes buscan doctores con X años)
   * - Prevenir fraudes (experiencia negativa no tiene sentido)
   * 
   * Límites:
   * - Mínimo: 0 (recién graduados)
   * - Máximo: 60 (realista para carrera médica)
   */
  experience: Joi.number()
    .integer()
    .min(0)
    .max(60)
    .messages({
      'number.base': 'La experiencia debe ser un número',
      'number.integer': 'La experiencia debe ser un número entero',
      'number.min': 'La experiencia no puede ser negativa',
      'number.max': 'La experiencia no puede exceder 60 años'
    }),

  /**
   * Biografía del doctor
   * 
   * ¿Para qué sirve?
   * - Presentación profesional
   * - Conectar con pacientes
   * - SEO y búsquedas
   * 
   * Límites:
   * - Mínimo: 50 caracteres (forzar descripción útil)
   * - Máximo: 2000 caracteres (prevenir spam)
   */
  bio: textLongSchema
    .min(50)
    .messages({
      'string.min': 'La biografía debe tener al menos 50 caracteres'
    }),

  /**
   * Tarifa por consulta (en USD o moneda local)
   * 
   * ¿Por qué validar precio?
   * - Prevenir errores de captura ($10 vs $10000)
   * - Evitar consultas gratis no intencionales
   * - Proteger ingresos del doctor
   * 
   * Límites:
   * - Mínimo: 10 (consulta mínima viable)
   * - Máximo: 1000 (realista para consultas privadas)
   * 
   * TODO: Soportar múltiples monedas (USD, EUR, MXN)
   */
  ticketPrice: Joi.number()
    .positive()
    .min(10)
    .max(1000)
    .precision(2) // Solo 2 decimales ($49.99)
    .messages({
      'number.base': 'El precio debe ser un número',
      'number.positive': 'El precio debe ser positivo',
      'number.min': 'El precio mínimo es $10',
      'number.max': 'El precio máximo es $1000',
      'number.precision': 'El precio solo puede tener 2 decimales'
    }),

  /**
   * Calificaciones académicas
   * 
   * Formato esperado:
   * [
   *   {
   *     degree: "MD",
   *     institution: "Harvard Medical School",
   *     year: 2015
   *   }
   * ]
   * 
   * ¿Por qué validar esto?
   * - Credibilidad profesional
   * - Verificación de antecedentes
   * - Confianza del paciente
   */
  qualifications: Joi.array()
    .items(
      Joi.object({
        degree: Joi.string()
          .min(2)
          .max(100)
          .required()
          .messages({
            'any.required': 'El grado académico es obligatorio',
            'string.min': 'El grado debe tener al menos 2 caracteres'
          }),

        institution: Joi.string()
          .min(3)
          .max(200)
          .required()
          .messages({
            'any.required': 'La institución es obligatoria',
            'string.min': 'La institución debe tener al menos 3 caracteres'
          }),

        year: Joi.number()
          .integer()
          .min(1950) // Año razonable para graduación más antigua
          .max(new Date().getFullYear()) // No puede graduarse en el futuro
          .required()
          .messages({
            'any.required': 'El año de graduación es obligatorio',
            'number.min': 'El año debe ser posterior a 1950',
            'number.max': 'El año no puede ser futuro'
          })
      })
    )
    .max(10) // Máximo 10 calificaciones (prevenir spam)
    .messages({
      'array.max': 'Máximo 10 calificaciones permitidas'
    }),

  /**
   * Horarios de disponibilidad
   * 
   * Formato esperado:
   * [
   *   {
   *     day: "Monday",
   *     startTime: "09:00",
   *     endTime: "17:00"
   *   }
   * ]
   * 
   * ¿Por qué validar horarios?
   * - Prevenir reservas en horarios no disponibles
   * - Optimizar calendario de Google
   * - Mejorar UX (pacientes solo ven horarios disponibles)
   */
  timeSlots: Joi.array()
    .items(
      Joi.object({
        day: Joi.string()
          .valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
          .required()
          .messages({
            'any.required': 'El día es obligatorio',
            'any.only': 'Día inválido. Usa nombres en inglés (Monday, Tuesday, etc.)'
          }),

        startTime: Joi.string()
          .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/) // HH:MM formato (09:00, 14:30)
          .required()
          .messages({
            'any.required': 'La hora de inicio es obligatoria',
            'string.pattern.base': 'Formato de hora inválido. Use HH:MM (ej: 09:00)'
          }),

        endTime: Joi.string()
          .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
          .required()
          .messages({
            'any.required': 'La hora de fin es obligatoria',
            'string.pattern.base': 'Formato de hora inválido. Use HH:MM (ej: 17:00)'
          })
      })
    )
    .max(7) // Máximo 7 días (una semana)
    .messages({
      'array.max': 'Máximo 7 horarios permitidos (uno por día)'
    }),

  /**
   * Sobre (descripción extendida)
   * 
   * Diferencia con bio:
   * - bio: Breve presentación (elevator pitch)
   * - about: Información detallada, filosofía, enfoque
   */
  about: textLongSchema
    .min(100)
    .messages({
      'string.min': 'La descripción debe tener al menos 100 caracteres'
    }),

  // Experiencias laborales
  experiences: Joi.array()
    .items(
      Joi.object({
        position: Joi.string().required(),
        hospital: Joi.string().required(),
        startDate: Joi.date().required(),
        endDate: Joi.date().greater(Joi.ref('startDate')).allow(null)
      })
    )
    .messages({
      'array.base': 'Experiencias debe ser un arreglo'
    })
}).min(1) // Al menos un campo debe ser enviado
  .messages({
    'object.min': 'Debe proporcionar al menos un campo para actualizar'
  });

/**
 * Schema para obtener doctor por ID
 * 
 * Ejemplo: GET /api/v1/doctors/507f1f77bcf86cd799439011
 */
export const getDoctorByIdSchema = Joi.object({
  id: mongoIdSchema.required()
    .messages({
      'any.required': 'El ID del doctor es obligatorio'
    })
});

/**
 * Schema para búsqueda y filtrado de doctores
 * 
 * Filtros disponibles:
 * - search: Buscar por nombre o especialización
 * - specialization: Filtrar por especialización exacta
 * - minPrice/maxPrice: Rango de precios
 * - minExperience: Años mínimos de experiencia
 * - availability: Filtrar doctores con horarios disponibles
 * 
 * ¿Por qué tantos filtros?
 * - Mejorar UX (pacientes encuentran el doctor correcto)
 * - Reducir carga en el servidor (solo devolver resultados relevantes)
 * - Personalización (cada paciente tiene necesidades únicas)
 */
export const getDoctorsQuerySchema = Joi.object({
  // Paginación
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'La página debe ser un número',
      'number.min': 'La página debe ser mayor o igual a 1'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'El límite debe ser un número',
      'number.max': 'El límite máximo es 100 registros por página'
    }),

  // Búsqueda de texto
  search: Joi.string()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'La búsqueda debe tener al menos 2 caracteres',
      'string.max': 'La búsqueda no puede exceder 100 caracteres'
    }),

  // Filtro por especialización
  specialization: Joi.string()
    .min(3)
    .max(100)
    .messages({
      'string.min': 'La especialización debe tener al menos 3 caracteres'
    }),

  // Rango de precios
  minPrice: Joi.number()
    .positive()
    .max(1000)
    .messages({
      'number.positive': 'El precio mínimo debe ser positivo',
      'number.max': 'El precio mínimo no puede exceder $1000'
    }),

  maxPrice: Joi.number()
    .positive()
    .max(1000)
    .when('minPrice', {
      is: Joi.exist(),
      then: Joi.number().greater(Joi.ref('minPrice'))
    })
    .messages({
      'number.positive': 'El precio máximo debe ser positivo',
      'number.max': 'El precio máximo no puede exceder $1000',
      'number.greater': 'El precio máximo debe ser mayor que el precio mínimo'
    }),

  // Experiencia mínima
  minExperience: Joi.number()
    .integer()
    .min(0)
    .max(60)
    .messages({
      'number.min': 'La experiencia mínima no puede ser negativa',
      'number.max': 'La experiencia mínima no puede exceder 60 años'
    }),

  // Filtrar solo doctores con horarios disponibles
  availability: Joi.boolean()
    .messages({
      'boolean.base': 'availability debe ser true o false'
    }),

  // Filtrar por estado de aprobación
  isApproved: Joi.boolean()
    .messages({
      'boolean.base': 'isApproved debe ser true o false'
    }),

  // Ordenamiento
  sortBy: Joi.string()
    .valid('name', 'ticketPrice', 'experience', 'createdAt')
    .default('createdAt')
    .messages({
      'any.only': 'sortBy debe ser: name, ticketPrice, experience o createdAt'
    }),

  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'sortOrder debe ser: asc o desc'
    })
});

/**
 * Schema para eliminar doctor
 * 
 * Consideraciones:
 * - ¿Qué pasa con las citas existentes?
 * - ¿Qué pasa con las reseñas?
 * - Mejor usar soft-delete (deletedAt field)
 * 
 * TODO: Implementar verificación de citas pendientes antes de eliminar
 */
export const deleteDoctorSchema = Joi.object({
  id: mongoIdSchema.required()
    .messages({
      'any.required': 'El ID del doctor es obligatorio para eliminación'
    })
});

/**
 * Schema para aprobar/rechazar doctor (admin)
 * 
 * Flujo de aprobación:
 * 1. Doctor se registra → isApproved = false
 * 2. Admin verifica credenciales (licencia médica, certificaciones)
 * 3. Admin aprueba → isApproved = true
 * 4. Doctor aparece en búsquedas públicas
 * 
 * ¿Por qué verificación manual?
 * - Proteger a pacientes de médicos falsos
 * - Cumplimiento legal (verificar licencias)
 * - Control de calidad de la plataforma
 */
export const approveDoctorSchema = Joi.object({
  id: mongoIdSchema.required()
    .messages({
      'any.required': 'El ID del doctor es obligatorio'
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
