// backend/Controllers/bookingController.js
import Booking from '../models/BookingSchema.js';
import User from '../models/UserSchema.js';
import Doctor from '../models/DoctorSchema.js';
import { deleteCalendarEvent } from './calendarController.js';
import { google } from 'googleapis';
import { getOAuthClientWithUserTokens } from '../utils/getOAuthClientWithUserTokens.js';

const tryCreateCalendarEvent = async ({ ownerId, doctorName, summary, description, start, end, attendees = [] }) => {
  try {
    if (!ownerId) return null;
    const authClient = await getOAuthClientWithUserTokens(ownerId);
    if (!authClient) return null;
    const calendar = google.calendar({ version: 'v3', auth: authClient });
    const event = {
      summary: summary || `Sesión con ${doctorName || 'terapeuta'}`,
      description,
      start: { dateTime: start, timeZone: 'America/Bogota' },
      end: { dateTime: end, timeZone: 'America/Bogota' },
      attendees,
    };
    const response = await calendar.events.insert({ calendarId: 'primary', resource: event });
    return response.data.id || null;
  } catch (err) {
    console.error('⚠️ No se pudo sincronizar con Google Calendar:', err.message);
    return null;
  }
};

/**
 * 📅 Crear nueva cita médica
 */
export const createBooking = async (req, res) => {
  try {
    const {
      doctorId: doctorIdBody,
      date,
      time,
      motivoConsulta,
      patientId,
      patientEmail,
      patientName,
      durationMinutes = 30,
    } = req.body;
    const requesterId = req.user.id;
    const requesterRole = (req.user.role || '').toLowerCase();
    const normalizedPatientEmail = patientEmail?.trim().toLowerCase() || '';
    const normalizedPatientName = patientName?.trim() || '';

    if (!date || !time) {
      return res.status(400).json({ success: false, message: 'Fecha y hora son requeridas' });
    }

    let userId = requesterId;
    let doctorId = doctorIdBody;
    let patientProfile = null;
    let autoCreatedPatient = false;

    if (requesterRole === 'doctor') {
      doctorId = requesterId;

      if (!patientId && !normalizedPatientEmail) {
        return res.status(400).json({ success: false, message: 'Debes indicar el paciente (patientId o patientEmail).' });
      }

      let patient = null;

      if (patientId) {
        patient = await User.findById(patientId);
      }

      if (!patient && normalizedPatientEmail) {
        patient = await User.findOne({ email: normalizedPatientEmail });
      }

      if (!patient && normalizedPatientEmail) {
        if (!normalizedPatientName) {
          return res.status(404).json({
            success: false,
            message: 'Paciente no encontrado. Proporciona el nombre para registrarlo automáticamente.',
          });
        }
        try {
          patient = await User.create({
            email: normalizedPatientEmail,
            name: normalizedPatientName,
            role: 'paciente',
            authProvider: 'local',
          });
          autoCreatedPatient = true;
        } catch (creationError) {
          if (creationError.code === 11000) {
            patient = await User.findOne({ email: normalizedPatientEmail });
          } else {
            throw creationError;
          }
        }
      }

      if (!patient) {
        return res.status(404).json({ success: false, message: 'Paciente no encontrado' });
      }
      userId = patient._id;
      patientProfile = patient;
    } else {
      patientProfile = await User.findById(userId).select('name email');
    }

    if (!doctorId) {
      return res.status(400).json({ success: false, message: 'Debes indicar el doctorId.' });
    }

    const doctorProfile = await Doctor.findById(doctorId).select('name email');
    if (!doctorProfile) {
      return res.status(404).json({ success: false, message: 'Doctor no encontrado' });
    }

    const startDateTime = new Date(`${date}T${time}:00`);
    if (Number.isNaN(startDateTime.getTime())) {
      return res.status(400).json({ success: false, message: 'La fecha u hora no es válida.' });
    }
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);

    const attendees = [];
    if (patientProfile?.email) {
      attendees.push({ email: patientProfile.email, displayName: patientProfile.name });
    }

    const calendarEventId = await tryCreateCalendarEvent({
      ownerId: doctorProfile._id,
      doctorName: doctorProfile.name,
      summary: 'Sesión terapéutica',
      description: motivoConsulta || 'Consulta clínica',
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      attendees,
    });

    const nuevaCita = await Booking.create({
      user: userId,
      doctor: doctorId,
      appointmentDate: startDateTime,
      reason: motivoConsulta,
      calendarEventId,
    });

    // 4. ✅ Enviar respuesta
    res.status(201).json({
      success: true,
      message: '✅ Cita creada exitosamente',
      data: nuevaCita,
      googleCalendarEventId: calendarEventId,
      calendarSync: Boolean(calendarEventId),
      patientAutoCreated: autoCreatedPatient,
    });

  } catch (error) {
    console.error('❌ Error al crear cita:', error);
    res.status(500).json({ success: false, message: 'Error al crear la cita' });
  }
};

/**
 * 🗑️ Cancelar cita médica (y evento en Google Calendar si aplica)
 */
export const cancelBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    if (booking.user.toString() !== userId) {
      return res.status(403).json({ error: 'No autorizado para cancelar esta cita' });
    }

    // Si tiene un evento en Google Calendar, lo eliminamos
    if (booking.calendarEventId) {
      const deleteEventReq = {
        user: { id: userId },
        params: { eventId: booking.calendarEventId },
      };
      const deleteEventRes = {
        status: () => ({ json: () => {} }), // mock básico
      };
      await deleteCalendarEvent(deleteEventReq, deleteEventRes);
    }

    // Eliminamos la cita de la base de datos
    await Booking.findByIdAndDelete(bookingId);

    res.status(200).json({ message: '✅ Cita cancelada exitosamente' });

  } catch (error) {
    console.error('❌ Error al cancelar la cita:', error);
    res.status(500).json({ error: 'Error al cancelar la cita' });
  }
};
/**
 * 📋 Obtener todas las citas del usuario
 */
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({ user: userId })
      .populate('doctor', 'name specialization photo')
      .sort({ appointmentDate: -1 });

    res.status(200).json({
      success: true,
      message: 'Citas obtenidas correctamente',
      data: bookings,
    });

  } catch (error) {
    console.error('❌ Error al obtener citas:', error);
    res.status(500).json({ error: 'Error al obtener las citas' });
  }
};
