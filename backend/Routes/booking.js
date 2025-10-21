import express from 'express';
import { createBooking, cancelBooking, getUserBookings } from '../Controllers/bookingController.js';
import { authenticate  } from '../auth/verifyToken.js';

const router = express.Router();

// Obtener todas las citas del usuario autenticado
router.get('/', authenticate, getUserBookings);

// Ruta protegida para crear cita
router.post('/', authenticate , createBooking);

// Cancelar una cita específica
router.delete('/:bookingId', authenticate, cancelBooking);

export default router;
