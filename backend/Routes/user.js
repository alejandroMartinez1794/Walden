import express from 'express';
import {
    updateUser,
    deleteUser,
    getAllUser,
    getSingleUser,
    getUserProfile,
    getMyAppointments,
    getActivePatientsForDoctor,
}   from "../Controllers/userController.js";

import { authenticate, restrict } from "../auth/verifyToken.js";

// ✅ IMPORTAR VALIDACIÓN
import { validate, validateId } from '../validators/middleware/validate.js';
import { 
	updateUserSchema, 
	getUserByIdSchema,
	getUsersQuerySchema,
	deleteUserSchema
} from '../validators/schemas/user.schemas.js';

const router = express.Router();

/**
 * 👥 OBTENER PACIENTES ACTIVOS (PARA DOCTORES)
 * 
 * Endpoint usado por doctores al agendar citas manualmente
 * 
 * ¿Qué es un paciente activo?
 * - Ha tenido al menos una cita
 * - O está registrado y aprobado
 * 
 * Seguridad:
 * - Solo doctores y admins pueden ver lista completa
 * - Prevenir acceso de pacientes a datos de otros pacientes
 */
router.get ("/patients/active", authenticate, restrict(['doctor', 'admin']), getActivePatientsForDoctor);

/**
 * 👤 OBTENER USUARIO POR ID
 * 
 * Validación:
 * - ID debe ser MongoDB ObjectId válido (24 caracteres hex)
 * - Previene CastError en Mongoose
 * 
 * Seguridad:
 * - Solo pacientes pueden ver perfiles de usuario
 * - Verificar en controller que el usuario existe
 * 
 * TODO: Verificar que el usuario solo pueda ver su propio perfil
 */
router.get ("/:id", authenticate, restrict(['paciente']), validateId, getSingleUser);

/**
 * 📋 OBTENER TODOS LOS USUARIOS (ADMIN)
 * 
 * Validación query params:
 * - page, limit (paginación)
 * - role (filtro por rol)
 * - search (búsqueda por nombre/email)
 * - isApproved (filtro por estado)
 * 
 * ¿Por qué solo admin?
 * - Información sensible (lista completa de usuarios)
 * - Protección de privacidad (HIPAA compliance)
 */
router.get ("/", authenticate, restrict(['admin']), validate(getUsersQuerySchema, 'query'), getAllUser);

/**
 * ✏️ ACTUALIZAR USUARIO
 * 
 * Validación:
 * - ID en params (MongoDB ObjectId)
 * - Datos en body (nombre, email, teléfono, etc.)
 * 
 * Seguridad:
 * - Usuario solo puede actualizar su propio perfil
 * - No puede cambiar rol (prevenir escalación de privilegios)
 * - No puede cambiar isApproved (solo admin puede hacerlo)
 * 
 * TODO: Verificar en controller que req.userId === req.params.id
 */
router.put ("/:id", authenticate, restrict(['paciente']), validateId, validate(updateUserSchema), updateUser);

/**
 * 🗑️ ELIMINAR USUARIO
 * 
 * Validación:
 * - ID debe ser válido
 * 
 * Consideraciones:
 * - ¿Soft delete o hard delete?
 * - ¿Qué pasa con las citas del usuario?
 * - ¿Qué pasa con las reseñas?
 * 
 * Recomendación: Implementar soft delete (deletedAt field)
 * 
 * TODO: Verificar en controller que req.userId === req.params.id
 */
router.delete ("/:id", authenticate, restrict(['paciente']), validateId, deleteUser);

/**
 * 👤 OBTENER MI PERFIL
 * 
 * No requiere validación de ID (usa req.userId del token JWT)
 * 
 * Ventaja de este endpoint:
 * - Usuario no necesita saber su propio ID
 * - Más seguro (no puede acceder a otros perfiles)
 */
router.get ("/profile/me", authenticate, restrict(['paciente']), getUserProfile);

/**
 * 📅 OBTENER MIS CITAS
 * 
 * Endpoint para que pacientes vean sus propias citas
 * 
 * No requiere validación (usa req.userId del token)
 * 
 * TODO: Agregar filtros opcionales (fecha, estado)
 */
router.get (
    "/appointments/my-appointments",
    authenticate,
    restrict(['paciente']),
    getMyAppointments);

export default router; 