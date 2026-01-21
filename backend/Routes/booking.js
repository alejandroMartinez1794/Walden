import express from 'express';
import { createBooking, cancelBooking, getUserBookings } from '../Controllers/bookingController.js';
import { authenticate  } from '../auth/verifyToken.js';

// ✅ IMPORTAR VALIDACIÓN
import { validate, validateId } from '../validators/middleware/validate.js';
import { 
	createBookingSchema, 
	cancelBookingSchema,
	getBookingsQuerySchema 
} from '../validators/schemas/booking.schemas.js';

const router = express.Router();

/**
 * 📅 OBTENER MIS CITAS
 * 
 * Endpoint para que usuarios vean sus propias citas
 * 
 * Validación query params (opcional):
 * - status: Filtrar por estado (pending, approved, cancelled)
 * - dateFrom, dateTo: Rango de fechas
 * - doctorId: Filtrar por doctor
 * - page, limit: Paginación
 * 
 * ¿Por qué validar filtros?
 * - Prevenir queries maliciosas (inyección NoSQL)
 * - Asegurar formato correcto de fechas
 * - Limitar resultados (prevenir DoS)
 * 
 * Seguridad:
 * - Usuario solo ve sus propias citas (req.userId)
 * - No puede acceder a citas de otros usuarios
 */
router.get('/', authenticate, validate(getBookingsQuerySchema, 'query'), getUserBookings);

/**
 * ➕ CREAR NUEVA CITA
 * 
 * Validación exhaustiva:
 * - doctor: MongoDB ObjectId válido
 * - ticketPrice: Número positivo (debe coincidir con tarifa del doctor)
 * - appointmentDate: ISO 8601, futuro, dentro de horario laboral
 * - duration: 30min - 4hrs
 * 
 * Reglas de negocio validadas:
 * 1. Horario laboral: 8:00 - 20:00
 * 2. Reserva anticipada: Mínimo 1 hora
 * 3. No fines de semana
 * 4. Máximo 3 meses adelante
 * 
 * ¿Por qué estas reglas?
 * - Horario laboral: Proteger a doctores de citas fuera de horario
 * - Anticipación: Dar tiempo al doctor para prepararse
 * - No fines de semana: Mayoría de doctores no trabajan fines de semana
 * - Límite 3 meses: Evitar reservas muy lejanas (cambios de agenda)
 * 
 * TODO: Validar disponibilidad real del doctor (no solo horario)
 */
router.post('/', authenticate, validate(createBookingSchema), createBooking);

/**
 * ❌ CANCELAR CITA
 * 
 * Validación:
 * - bookingId: MongoDB ObjectId válido
 * - cancellationReason: String obligatorio (10-500 caracteres)
 * 
 * ¿Por qué requerir razón?
 * - Mejorar servicio (entender por qué cancelan)
 * - Estadísticas (causas comunes de cancelación)
 * - Protección legal (documentar razones)
 * 
 * Reglas de negocio:
 * - Solo puede cancelar antes de la cita
 * - Solo el usuario que creó la cita puede cancelarla
 * - Doctor recibe notificación por email
 * - Evento de Google Calendar se elimina
 * 
 * TODO: Política de cancelación (¿con cuánta anticipación?)
 * TODO: ¿Penalización por cancelaciones frecuentes?
 */
router.delete('/:bookingId', authenticate, validateId, cancelBooking);

export default router;
