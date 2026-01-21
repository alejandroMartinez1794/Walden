// backend/services/appointmentReminderService.js
import Booking from '../models/BookingSchema.js';
import User from '../models/UserSchema.js';
import Doctor from '../models/DoctorSchema.js';
import sendEmail from '../utils/emailService.js';
import { getAutomationConfig } from './automationConfig.js';
import { scheduleTask } from './automationScheduler.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 📧 Enviar recordatorio de cita por email
 */
const sendAppointmentReminder = async (booking, hoursBeforeText) => {
  try {
    const patient = await User.findById(booking.user);
    const doctor = await Doctor.findById(booking.doctor);

    if (!patient?.email) {
      console.log(`⚠️ No se pudo enviar recordatorio: paciente sin email`);
      return;
    }

    const appointmentDate = new Date(booking.appointmentDate);
    const formattedDate = appointmentDate.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = appointmentDate.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const doctorName = doctor ? `Dr(a). ${doctor.name}` : 'su terapeuta';

    await sendEmail({
      email: patient.email,
      subject: `🔔 Recordatorio: Tu cita ${hoursBeforeText}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0066ff;">¡Recordatorio de Cita! 📅</h2>
          <p>Hola <strong>${patient.name}</strong>,</p>
          <p>Este es un recordatorio de tu próxima sesión:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>📍 Con:</strong> ${doctorName}</p>
            <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${formattedDate}</p>
            <p style="margin: 5px 0;"><strong>⏰ Hora:</strong> ${formattedTime}</p>
            ${booking.ticketPrice ? `<p style="margin: 5px 0;"><strong>💰 Precio:</strong> $${booking.ticketPrice}</p>` : ''}
          </div>

          ${booking.meetLink ? `
            <p style="margin-top: 20px;">
              <a href="${booking.meetLink}" 
                 style="background-color: #0066ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                🎥 Unirse a la Sesión Virtual
              </a>
            </p>
          ` : ''}

          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Si necesitas cancelar o reprogramar, por favor contáctanos con anticipación.
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            Este es un mensaje automático de Psiconepsis. Por favor no respondas a este correo.
          </p>
        </div>
      `
    });

    console.log(`✅ Recordatorio enviado a ${patient.email} - Cita ${hoursBeforeText}`);
  } catch (error) {
    console.error('❌ Error enviando recordatorio:', error.message);
  }
};

/**
 * 🕐 Recordatorios 24 horas antes
 * Se ejecuta cada hora en minuto 0
 */
const schedule24HourReminders = () => {
  return scheduleTask('0 * * * *', 'Recordatorios 24h', async () => {
    try {
      const { maxBatch, emailThrottleMs } = getAutomationConfig();

      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000);

      // Buscar citas entre 24 y 25 horas desde ahora
      const upcomingBookings = await Booking.find({
        appointmentDate: {
          $gte: in24Hours,
          $lt: in25Hours
        },
        status: { $in: ['approved', 'pending'] },
        reminderSent24h: { $ne: true }
      }).limit(maxBatch);

      for (const booking of upcomingBookings) {
        await sendAppointmentReminder(booking, 'es mañana');
        
        // Marcar como enviado
        booking.reminderSent24h = true;
        await booking.save();
        
        // Pequeña pausa para no saturar el servidor de email
        await sleep(emailThrottleMs);
      }
    } catch (error) {
      console.error('❌ Error en tarea de recordatorios 24h:', error.message);
    }
  });
};

/**
 * 🕐 Recordatorios 1 hora antes
 * Se ejecuta cada 10 minutos
 */
const schedule1HourReminders = () => {
  return scheduleTask('*/10 * * * *', 'Recordatorios 1h', async () => {
    try {
      const { maxBatch, emailThrottleMs } = getAutomationConfig();

      const now = new Date();
      const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);
      const in70Minutes = new Date(now.getTime() + 70 * 60 * 1000);

      // Buscar citas entre 60 y 70 minutos desde ahora
      const upcomingBookings = await Booking.find({
        appointmentDate: {
          $gte: in1Hour,
          $lt: in70Minutes
        },
        status: { $in: ['approved', 'pending'] },
        reminderSent1h: { $ne: true }
      }).limit(maxBatch);

      for (const booking of upcomingBookings) {
        await sendAppointmentReminder(booking, 'es en 1 hora');
        
        // Marcar como enviado
        booking.reminderSent1h = true;
        await booking.save();
        
        await sleep(emailThrottleMs);
      }
    } catch (error) {
      console.error('❌ Error en tarea de recordatorios 1h:', error.message);
    }
  });
};

/**
 * 🚀 Iniciar todos los servicios de recordatorios
 */
export const startAppointmentReminderService = () => {
  const { enabled } = getAutomationConfig();

  if (!enabled) {
    return {};
  }
  
  const job24h = schedule24HourReminders();
  const job1h = schedule1HourReminders();

  return { job24h, job1h };
};

export default { startAppointmentReminderService };
