// backend/Controllers/calendarController.js

import { google } from 'googleapis';
import GoogleToken from '../Models/GoogleTokenSchema.js';
import User from '../Models/UserSchema.js';
import { createJWT } from '../utils/jwt.js';
import oAuth2Client from '../config/google.js';
import jwt from 'jsonwebtoken';
import {getOAuthClientWithUserTokens} from '../utils/getOAuthClientWithUserTokens.js';
import Booking from '../models/BookingSchema.js';

/**
 * 🔗 Genera URL de autenticación de Google
 */
export const getGoogleAuthUrl = (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  });

  res.redirect(url);
};

/**
 * ✅ Callback después de autorización de Google
 */
export const handleGoogleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oAuth2Client, version: 'v2' });
    const { data: userInfo } = await oauth2.userinfo.get();
    const { email, name, picture } = userInfo;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        role: 'paciente',
        authProvider: 'google',
        profilePicture: picture,
      });
    }

    const token = createJWT({ id: user._id, role: user.role });

    await GoogleToken.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        scope: tokens.scope,
        token_type: tokens.token_type,
        expiry_date: tokens.expiry_date,
      },
      { upsert: true, new: true }
    );

    const frontendRedirect = `http://localhost:5173/google-auth-redirect?token=${token}&user=${encodeURIComponent(
      JSON.stringify({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture || null,
      })
    )}`;

    return res.redirect(frontendRedirect);

  } catch (error) {
    console.error('🔴 Error en handleGoogleCallback:', error);
    return res.status(500).json({ error: 'Error en la autenticación con Google' });
  }
};

/**
 * 🗓️ Crear evento en Google Calendar
 */
export const createCalendarEvent = async (req, res) => {
  try {
    console.log("📥 Petición recibida para crear evento");

    const { summary, description, start, end, attendees, doctorId, reason } = req.body;

    if (!summary || !start || !end || !doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: summary, start, end o doctorId',
      });
    }

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const userId = decoded.id;
    const oAuth2Client = await getOAuthClientWithUserTokens(userId);
    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    const event = {
      summary,
      description,
      start: {
        dateTime: start,
        timeZone: "America/Bogota",
      },
      end: {
        dateTime: end,
        timeZone: "America/Bogota",
      },
      attendees,
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });

    console.log("📅 Evento creado:", response.data);

    const newBooking = await Booking.create({
      user: userId,
      doctor: doctorId,
      appointmentDate: start,
      reason: reason || description,
      calendarEventId: response.data.id,
    });

    // Devuelve el evento de Google y el booking en Mongo
    res.status(201).json({
      success: true,
      message: "Cita creada correctamente",
      calendarEvent: response.data,
      booking: newBooking,
    });

  } catch (err) {
    console.error("❌ Error creando evento:", err.response?.data || err.message || err);
    res.status(500).json({
      success: false,
      message: "No se pudo crear el evento",
    });
  }
};


/**
 * 📅 Obtener próximos eventos
 */
export const getCalendarEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const oAuth2Client = await getOAuthClientWithUserTokens(userId);
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date('1970-01-01T00:00:00Z').toISOString(),
      timeMax: new Date('2100-01-01T00:00:00Z').toISOString(),
      maxResults: 2500,
      singleEvents: true,
      orderBy: 'startTime',
    });

    res.status(200).json({  
      success: true,
      message: "Eventos obtenidos correctamente",
      data: response.data.items,
    });
  } catch (error) {
    console.error('❌ Error al obtener eventos:', error);
    res.status(500).json({ error: 'No se pudieron obtener los eventos' });
  }
};

/**
 * ✏️ Actualizar evento
 */
export const updateCalendarEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId, summary, description, startTime, endTime, reason } = req.body;

    const oAuth2Client = await getOAuthClientWithUserTokens(userId);
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    const updatedEvent = await calendar.events.update({
      calendarId: 'primary',
      eventId,
      resource: {
        summary,
        description,
        start: { dateTime: startTime, timeZone: 'America/Bogota' },
        end: { dateTime: endTime, timeZone: 'America/Bogota' },
      },
    });

    await Booking.findOneAndUpdate(
      { calendarEventId: eventId },
      {
        appointmentDate: startTime,
        reason: reason || description,
      }
    );

    res.status(200).json({ message: 'Evento actualizado', event: updatedEvent.data });

  } catch (error) {
    console.error('❌ Error al actualizar evento:', error);
    res.status(500).json({ error: 'No se pudo actualizar el evento' });
  }
};

/**
 * 🗑️ Eliminar evento
 */
export const deleteCalendarEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;

    const oAuth2Client = await getOAuthClientWithUserTokens(userId);
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });

    await Booking.findOneAndDelete({ calendarEventId: eventId });

    res.status(200).json({ message: 'Evento eliminado' });

  } catch (error) {
    console.error('❌ Error al eliminar evento:', error);
    res.status(500).json({ error: 'No se pudo eliminar el evento' });
  }
};
