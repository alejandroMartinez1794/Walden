import express from 'express';
import {
    updateDoctor,
    deleteDoctor,
    getAllDoctor,
    getSingleDoctor,
    getDoctorProfile,
    getDoctorAppointments,
    confirmDoctorAppointment,
    cancelDoctorAppointment,
    rescheduleDoctorAppointment,
}   from "../Controllers/doctorController.js";

import { authenticate, restrict } from "../auth/verifyToken.js";

// ✅ IMPORTAR VALIDACIÓN
import { validate, validateId } from '../validators/middleware/validate.js';
import { 
	updateDoctorSchema, 
	getDoctorByIdSchema,
	getDoctorsQuerySchema,
	deleteDoctorSchema
} from '../validators/schemas/doctor.schemas.js';

import reviewRouter from './review.js'

const router = express.Router();

/**
 * 🔗 RUTAS ANIDADAS PARA RESEÑAS
 * 
 * Ejemplo: POST /api/v1/doctors/123/reviews
 * 
 * ¿Por qué anidar rutas?
 * - Estructura RESTful clara
 * - Reseñas siempre pertenecen a un doctor
 * - Más fácil de mantener y escalar
 */
router.use('/:doctorId/reviews', reviewRouter);

/**
 * ⚠️ ORDEN IMPORTANTE DE RUTAS
 * 
 * Express evalúa rutas en orden de definición:
 * 1. Rutas específicas primero (/profile/me, /appointments)
 * 2. Rutas genéricas después (/:id)
 * 
 * ¿Por qué?
 * Si /:id está primero, Express interpretará "profile" como un ID
 * Resultado: Error "Invalid ObjectId: profile"
 * 
 * Orden correcto:
 * ✅ /profile/me
 * ✅ /appointments
 * ✅ /:id (último)
 */

/**
 * 👤 OBTENER MI PERFIL (DOCTOR)
 * 
 * No requiere validación (usa req.userId del token JWT)
 * 
 * ¿Por qué endpoint separado?
 * - Doctor no necesita saber su propio ID
 * - Más seguro (no puede acceder a otros perfiles)
 * - Más conveniente para frontend
 */
router.get("/profile/me", authenticate, restrict(['doctor']), getDoctorProfile);

/**
 * 📅 OBTENER MIS CITAS (DOCTOR)
 * 
 * Endpoint para panel de doctor
 * 
 * TODO: Agregar validación de query params (filtros de fecha, estado)
 */
router.get("/appointments", authenticate, restrict(['doctor']), getDoctorAppointments);

/**
 * ✅ CONFIRMAR CITA
 * 
 * Flujo:
 * 1. Paciente solicita cita → status: "pending"
 * 2. Doctor confirma → status: "approved"
 * 3. Se crea evento en Google Calendar
 * 
 * Validación:
 * - ID debe ser MongoDB ObjectId válido
 * 
 * TODO: Agregar validación de body (confirmationMessage opcional)
 */
router.patch("/appointments/:id/confirm", authenticate, restrict(['doctor']), validateId, confirmDoctorAppointment);

/**
 * ❌ CANCELAR CITA
 * 
 * Validación:
 * - ID válido
 * - TODO: Requerir razón de cancelación en body
 * 
 * Consideraciones:
 * - Notificar al paciente por email
 * - Eliminar evento de Google Calendar
 * - ¿Política de reembolso?
 */
router.patch("/appointments/:id/cancel", authenticate, restrict(['doctor']), validateId, cancelDoctorAppointment);

/**
 * 🔄 REPROGRAMAR CITA
 * 
 * Validación:
 * - ID válido
 * - TODO: Validar nueva fecha/hora en body
 * 
 * Flujo:
 * 1. Doctor propone nueva fecha
 * 2. Paciente recibe notificación
 * 3. Paciente acepta/rechaza
 * 4. Si acepta, actualiza Google Calendar
 */
router.patch("/appointments/:id/reschedule", authenticate, restrict(['doctor']), validateId, rescheduleDoctorAppointment);

/**
 * 📋 OBTENER TODOS LOS DOCTORES (PÚBLICO)
 * 
 * Endpoint público para búsqueda de doctores
 * 
 * Validación query params:
 * - page, limit (paginación)
 * - search (búsqueda por nombre/especialización)
 * - specialization (filtro por especialización)
 * - minPrice, maxPrice (rango de precios)
 * - minExperience (años mínimos)
 * 
 * ¿Por qué público?
 * - Usuarios no autenticados pueden buscar doctores
 * - Solo muestra doctores aprobados (isApproved: true)
 */
router.get("/", validate(getDoctorsQuerySchema, 'query'), getAllDoctor);

/**
 * 👨‍⚕️ OBTENER DOCTOR POR ID (PÚBLICO)
 * 
 * Endpoint para ver perfil completo de doctor
 * 
 * Validación:
 * - ID debe ser MongoDB ObjectId válido
 * 
 * Información mostrada:
 * - Biografía, especialización, experiencia
 * - Calificaciones académicas
 * - Horarios disponibles
 * - Reseñas de pacientes (promedio de rating)
 */
router.get("/:id", validateId, getSingleDoctor);

/**
 * ✏️ ACTUALIZAR DOCTOR
 * 
 * Validación:
 * - ID en params (MongoDB ObjectId)
 * - Datos en body (especialización, tarifa, horarios, etc.)
 * 
 * Seguridad:
 * - Doctor solo puede actualizar su propio perfil
 * - No puede cambiar rol
 * - No puede auto-aprobarse
 * 
 * TODO: Verificar en controller que req.userId === req.params.id
 */
router.put("/:id", authenticate, restrict(['doctor']), validateId, validate(updateDoctorSchema), updateDoctor);

/**
 * 🗑️ ELIMINAR DOCTOR
 * 
 * Validación:
 * - ID debe ser válido
 * 
 * Consideraciones críticas:
 * - ¿Qué pasa con las citas futuras? (deben cancelarse)
 * - ¿Qué pasa con las citas pasadas? (mantener historial)
 * - ¿Qué pasa con las reseñas? (mantener o anonimizar)
 * 
 * Recomendación:
 * - Implementar soft delete (deletedAt field)
 * - Cancelar automáticamente citas futuras
 * - Mantener historial para pacientes
 * 
 * TODO: Verificar en controller que req.userId === req.params.id
 */
router.delete("/:id", authenticate, restrict(['doctor']), validateId, deleteDoctor);

export default router;
