// backend/Controllers/bookingController.js
import Booking from '../models/BookingSchema.js';
import User from '../models/UserSchema.js';
import Doctor from '../models/DoctorSchema.js';
import { deleteCalendarEvent } from './calendarController.js';
import { google } from 'googleapis';
import { getOAuthClientWithUserTokens } from '../utils/getOAuthClientWithUserTokens.js';
import sendEmail from '../utils/emailService.js';
import { auditPHI } from '../middleware/auditLogger.js';
import { sanitizeForCalendar } from '../utils/phiMinimization.js';
import logger from '../utils/logger.js';

const tryCreateCalendarEvent = async ({ ownerId, bookingData }) => {
  try {
    if (!ownerId) return null;
    const authClient = await getOAuthClientWithUserTokens(ownerId);
    if (!authClient) return null;
    const calendar = google.calendar({ version: 'v3', auth: authClient });
    
    // ✅ HIPAA-compliant: Usar sanitización de PHI
    const event = sanitizeForCalendar(bookingData);
    
    // sendUpdates: 'all' envía notificaciones a los invitados (paciente)
    const response = await calendar.events.insert({ 
      calendarId: 'primary', 
      resource: event,
      sendUpdates: 'all',
      conferenceDataVersion: 1,
    });
    
    // Audit log de creación de evento
    logger.info('Calendar event created', {
      bookingId: bookingData._id,
      calendarEventId: response.data.id,
      phiExposed: 'minimal'
    });
    
    return response.data.id || null;
  } catch (err) {
    logger.error('Failed to sync with Google Calendar', {
      error: err.message,
      bookingId: bookingData._id
    });
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

    // Crear booking primero (necesitamos el ID para auditoría)
    const nuevaCita = await Booking.create({
      user: userId,
      doctor: doctorId,
      appointmentDate: startDateTime,
      reason: motivoConsulta,
      status: 'approved',
      durationMinutes,
    });

    // Crear evento de Google Calendar con PHI mínimo
    const calendarEventId = await tryCreateCalendarEvent({
      ownerId: doctorProfile._id,
      bookingData: {
        _id: nuevaCita._id,
        appointmentDate: startDateTime,
        duration: durationMinutes
      }
    });

    // Actualizar booking con calendarEventId
    if (calendarEventId) {
      nuevaCita.calendarEventId = calendarEventId;
      await nuevaCita.save();
    }

    // Enviar notificaciones por correo (sin await para no bloquear)
    try {
      console.log('📧 Intentando enviar correos...');
      console.log('👤 Paciente:', patientProfile?.email);
      console.log('👨‍⚕️ Doctor:', doctorProfile?.email);

      // Correo al paciente
      if (patientProfile?.email) {
        console.log('📨 Enviando correo al paciente...');
        sendEmail({
          email: patientProfile.email,
          subject: 'Confirmación de Cita - Psiconepsis',
          message: `Hola ${patientProfile.name},\n\nTu cita con el Dr. ${doctorProfile.name} ha sido programada para el ${startDateTime.toLocaleString()}.\n\nMotivo: ${motivoConsulta}\n\nGracias por confiar en nosotros.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Confirmación de Cita</h2>
              <p>Hola <strong>${patientProfile.name}</strong>,</p>
              <p>Tu cita con el Dr. <strong>${doctorProfile.name}</strong> ha sido programada exitosamente.</p>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${startDateTime.toLocaleDateString()}</p>
                <p style="margin: 5px 0;"><strong>⏰ Hora:</strong> ${startDateTime.toLocaleTimeString()}</p>
                <p style="margin: 5px 0;"><strong>📝 Motivo:</strong> ${motivoConsulta}</p>
              </div>
              <p>Si necesitas reprogramar, por favor contáctanos.</p>
            </div>
          `
        })
        await sendEmail({
          email: patientProfile.email,
          subject: 'Cita Confirmada - Psiconepsis',
          message: `Hola ${patientProfile.name},\n\nTu cita ha sido confirmada para el ${startDateTime.toLocaleString()}.\n\nMotivo: ${motivoConsulta}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #059669;">¡Cita Confirmada!</h2>
              <p>Hola <strong>${patientProfile.name}</strong>,</p>
              <p>Tu cita ha sido confirmada exitosamente.</p>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>👨‍⚕️ Doctor:</strong> ${doctorProfile.name}</p>
                <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${startDateTime.toLocaleDateString()}</p>
                <p style="margin: 5px 0;"><strong>⏰ Hora:</strong> ${startDateTime.toLocaleTimeString()}</p>
                <p style="margin: 5px 0;"><strong>📝 Motivo:</strong> ${motivoConsulta}</p>
              </div>
              <p>Si necesitas reprogramar, por favor contáctanos.</p>
            </div>
          `
        })
          .then(() => console.log('✅ Correo enviado al paciente'))
          .catch(err => console.error('⚠️ Error enviando correo al paciente:', err.message));
      } else {
        console.warn('⚠️ No se envió correo al paciente porque no tiene email registrado.');
      }

      // Correo al doctor
      if (doctorProfile?.email) {
        console.log('📨 Enviando correo al doctor...');
        await sendEmail({
          email: doctorProfile.email,
          subject: 'Nueva Cita Programada - Psiconepsis',
          message: `Hola Dr. ${doctorProfile.name},\n\nSe ha programado una nueva cita con el paciente ${patientProfile.name} para el ${startDateTime.toLocaleString()}.\n\nMotivo: ${motivoConsulta}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #059669;">Nueva Cita Programada</h2>
              <p>Hola Dr. <strong>${doctorProfile.name}</strong>,</p>
              <p>Se ha programado una nueva cita en su agenda.</p>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>👤 Paciente:</strong> ${patientProfile.name}</p>
                <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${startDateTime.toLocaleDateString()}</p>
                <p style="margin: 5px 0;"><strong>⏰ Hora:</strong> ${startDateTime.toLocaleTimeString()}</p>
                <p style="margin: 5px 0;"><strong>📝 Motivo:</strong> ${motivoConsulta}</p>
              </div>
            </div>
          `
        })
          .then(() => console.log('✅ Correo enviado al doctor'))
          .catch(err => console.error('⚠️ Error enviando correo al doctor:', err.message));
      }
    } catch (emailError) {
      console.error('⚠️ Error preparando correos:', emailError.message);
    }

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
    const { id: bookingId } = req.params; // Cambio: ruta usa /:id

    const booking = await Booking.findById(bookingId)
      .populate('user', 'name email')
      .populate('doctor', 'name email');

    if (!booking) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    if (booking.user._id.toString() !== userId) {
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

    // Enviar notificación de cancelación (sin await)
    try {
      const patient = booking.user;
      const doctor = booking.doctor;
      const dateStr = new Date(booking.appointmentDate).toLocaleString();

      // Correo al paciente
      if (patient?.email) {
        sendEmail({
          email: patient.email,
          subject: 'Cita Cancelada - Psiconepsis',
          message: `Hola ${patient.name},\n\nTu cita con el Dr. ${doctor.name} programada para el ${dateStr} ha sido cancelada.\n\nSi no fuiste tú quien realizó esta acción, por favor contáctanos.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Cita Cancelada</h2>
              <p>Hola <strong>${patient.name}</strong>,</p>
              <p>Tu cita con el Dr. <strong>${doctor.name}</strong> programada para el <strong>${dateStr}</strong> ha sido cancelada.</p>
              <p>Si deseas reprogramar, visita nuestra plataforma.</p>
            </div>
          `
        }).catch(err => console.error('⚠️ Error enviando correo cancelación paciente:', err.message));
      }

      // Correo al doctor
      if (doctor?.email) {
        sendEmail({
          email: doctor.email,
          subject: 'Cita Cancelada - Psiconepsis',
          message: `Hola Dr. ${doctor.name},\n\nLa cita con el paciente ${patient.name} programada para el ${dateStr} ha sido cancelada.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Cita Cancelada</h2>
              <p>Hola Dr. <strong>${doctor.name}</strong>,</p>
              <p>La cita con el paciente <strong>${patient.name}</strong> programada para el <strong>${dateStr}</strong> ha sido cancelada.</p>
            </div>
          `
        }).catch(err => console.error('⚠️ Error enviando correo cancelación doctor:', err.message));
      }
    } catch (emailError) {
      console.error('⚠️ Error preparando correos de cancelación:', emailError.message);
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
