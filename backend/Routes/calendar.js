// backend/Routes/calendar.js

import express from 'express';
import {
  getGoogleAuthUrl,
  handleGoogleCallback,
  createCalendarEvent,
  getCalendarEvents,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '../Controllers/calendarController.js';

import { authenticate, restrict } from '../auth/verifyToken.js';

const router = express.Router();

// Ruta para redirigir al consentimiento de Google
router.get('/google-auth', /*authenticate,*/ getGoogleAuthUrl);

// Callback después de que el usuario autoriza acceso a su Google Calendar
router.get('/google/callback', handleGoogleCallback);

// Ruta para crear un evento en el Google Calendar del usuario autenticado
router.post('/create', authenticate, createCalendarEvent);

// Obtener eventos próximos del calendario
router.get('/events', authenticate, getCalendarEvents);

// Actualizar evento existente (requiere `eventId` y nuevos datos)
router.put('/update', authenticate, updateCalendarEvent);

// Eliminar evento por ID
router.delete('/delete/:eventId', authenticate, deleteCalendarEvent);

// Ruta adicional por si usas otro callback (puedes eliminarla si no la necesitas)
router.get('/auth/google/callback', handleGoogleCallback);

export default router;
