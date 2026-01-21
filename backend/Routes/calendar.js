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

// ✅ IMPORTAR VALIDACIÓN
import { validate, validateId } from '../validators/middleware/validate.js';

const router = express.Router();

/**
 * 📅 RUTAS DE GOOGLE CALENDAR
 * 
 * Integración con Google Calendar API
 * 
 * Flujo OAuth2:
 * 1. GET /google-auth → Redirige a Google para autorizar
 * 2. Google redirige a /google/callback con código
 * 3. Backend intercambia código por tokens
 * 4. Tokens guardados en MongoDB (GoogleTokenSchema)
 * 
 * Operaciones:
 * - Crear eventos (citas con pacientes)
 * - Obtener eventos próximos
 * - Actualizar eventos (reprogramar)
 * - Eliminar eventos (cancelar)
 * 
 * Seguridad:
 * - Tokens encriptados en BD
 * - Refresh automático de tokens
 * - Un calendario por doctor
 */

/**
 * GET /api/v1/calendar/google-auth
 * 
 * Iniciar flujo OAuth2 con Google
 * 
 * No requiere autenticación (usuario está iniciando sesión)
 * Redirige a Google para autorizar acceso
 */
router.get('/google-auth', getGoogleAuthUrl);

/**
 * GET /api/v1/calendar/google/callback
 * 
 * Callback de Google OAuth2
 * 
 * Google redirige aquí con código de autorización
 * Backend intercambia código por tokens (access + refresh)
 * Guarda tokens en MongoDB
 * Redirige al frontend
 * 
 * No requiere validación (Google controla el formato)
 */
router.get('/google/callback', handleGoogleCallback);

/**
 * POST /api/v1/calendar/create
 * 
 * Crear evento en Google Calendar
 * 
 * TODO: Crear schema de validación
 * - summary: Título del evento (obligatorio)
 * - description: Descripción (opcional)
 * - startDateTime: ISO 8601 (obligatorio)
 * - endDateTime: ISO 8601 (obligatorio, > startDateTime)
 * - attendees: Array de emails (opcional)
 * 
 * Validar:
 * - Fechas en formato correcto
 * - End > Start
 * - No en el pasado
 */
router.post('/create', authenticate, createCalendarEvent);

/**
 * GET /api/v1/calendar/events
 * 
 * Obtener eventos próximos del calendario
 * 
 * Query params opcionales:
 * - maxResults: Número de eventos (1-100)
 * - timeMin: Fecha mínima (ISO 8601)
 * - timeMax: Fecha máxima (ISO 8601)
 * 
 * TODO: Crear schema de validación para query params
 */
router.get('/events', authenticate, getCalendarEvents);

/**
 * PUT /api/v1/calendar/update
 * 
 * Actualizar evento existente
 * 
 * Body:
 * - eventId: ID del evento en Google Calendar
 * - updates: Campos a actualizar (summary, startDateTime, etc.)
 * 
 * TODO: Crear schema de validación
 */
router.put('/update', authenticate, updateCalendarEvent);

/**
 * DELETE /api/v1/calendar/delete/:eventId
 * 
 * Eliminar evento del calendario
 * 
 * Params:
 * - eventId: ID del evento en Google Calendar
 * 
 * Nota: eventId NO es MongoDB ObjectId, es ID de Google
 * Por lo tanto, no usar validateId (que valida MongoDB ObjectId)
 * 
 * TODO: Crear validación específica para Google Calendar Event IDs
 */
router.delete('/delete/:eventId', authenticate, deleteCalendarEvent);

/**
 * Ruta duplicada de callback (por compatibilidad)
 * TODO: Consolidar en una sola ruta de callback
 */
router.get('/auth/google/callback', handleGoogleCallback);

export default router;
