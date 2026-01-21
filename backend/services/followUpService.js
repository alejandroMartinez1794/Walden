// backend/services/followUpService.js
import Booking from '../models/BookingSchema.js';
import User from '../models/UserSchema.js';
import Doctor from '../models/DoctorSchema.js';
import sendEmail from '../utils/emailService.js';
import { getAutomationConfig } from './automationConfig.js';
import { scheduleTask } from './automationScheduler.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 📝 Enviar cuestionario de seguimiento post-sesión
 */
const sendFollowUpSurvey = async (booking) => {
  try {
    const patient = await User.findById(booking.user);
    const doctor = await Doctor.findById(booking.doctor);

    if (!patient?.email) {
      console.log(`⚠️ No se pudo enviar seguimiento: paciente sin email`);
      return;
    }

    const doctorName = doctor ? `Dr(a). ${doctor.name}` : 'su terapeuta';
    const surveyLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/patient/feedback/${booking._id}`;

    await sendEmail({
      email: patient.email,
      subject: '📝 ¿Cómo estuvo tu sesión? - Feedback',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0066ff;">¿Cómo te fue en tu sesión? 💙</h2>
          <p>Hola <strong>${patient.name}</strong>,</p>
          
          <p>Esperamos que tu sesión con <strong>${doctorName}</strong> haya sido de ayuda.</p>
          
          <p>Nos gustaría conocer tu experiencia para seguir mejorando nuestros servicios. 
          Por favor, tómate un momento para responder estas breves preguntas:</p>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>¿Cómo calificarías la sesión?</strong></p>
            <p style="margin: 10px 0;"><strong>¿Te sentiste escuchado/a?</strong></p>
            <p style="margin: 10px 0;"><strong>¿El terapeuta respondió tus dudas?</strong></p>
            <p style="margin: 10px 0;"><strong>¿Recomendarías este servicio?</strong></p>
          </div>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${surveyLink}" 
               style="background-color: #0066ff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              📝 Responder Cuestionario (2 minutos)
            </a>
          </p>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Tu opinión es muy importante para nosotros y nos ayuda a mejorar constantemente.
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            Este es un mensaje automático de Psiconepsis. Tu respuesta es opcional pero muy valiosa.
          </p>
        </div>
      `
    });

    console.log(`✅ Cuestionario de seguimiento enviado a ${patient.email}`);
  } catch (error) {
    console.error('❌ Error enviando seguimiento:', error.message);
  }
};

/**
 * 📊 Solicitar actualización de métricas de salud
 */
const sendHealthMetricsReminder = async (booking) => {
  try {
    const patient = await User.findById(booking.user);

    if (!patient?.email) return;

    const metricsLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/patient/health-metrics`;

    await sendEmail({
      email: patient.email,
      subject: '💪 Actualiza tus métricas de bienestar',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">¡Es momento de actualizar tus métricas! 📊</h2>
          <p>Hola <strong>${patient.name}</strong>,</p>
          
          <p>Después de tu última sesión, es importante que actualices tus métricas de bienestar 
          para que tu terapeuta pueda hacer un mejor seguimiento de tu progreso.</p>

          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p style="margin: 5px 0;"><strong>📈 Métricas a actualizar:</strong></p>
            <ul style="margin: 10px 0;">
              <li>Estado de ánimo actual</li>
              <li>Nivel de ansiedad</li>
              <li>Calidad del sueño</li>
              <li>Energía y motivación</li>
            </ul>
          </div>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${metricsLink}" 
               style="background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              📊 Actualizar Métricas (3 minutos)
            </a>
          </p>

          <p style="color: #666; font-size: 14px;">
            Estas métricas ayudan a tu terapeuta a personalizar tu tratamiento y celebrar tus avances.
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            Recordatorio automático de Psiconepsis.
          </p>
        </div>
      `
    });

    console.log(`✅ Recordatorio de métricas enviado a ${patient.email}`);
  } catch (error) {
    console.error('❌ Error enviando recordatorio de métricas:', error.message);
  }
};

/**
 * 🕐 Enviar seguimiento 24 horas después de la sesión
 * Se ejecuta cada hora
 */
const schedulePostSessionFollowUp = () => {
  return scheduleTask('0 * * * *', 'Seguimiento post-sesión (24h)', async () => {
    try {

      const { maxBatch, emailThrottleMs } = getAutomationConfig();

      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const yesterdayMinus1h = new Date(now.getTime() - 25 * 60 * 60 * 1000);

      // Buscar citas completadas hace 24 horas que no han recibido seguimiento
      const completedBookings = await Booking.find({
        appointmentDate: {
          $gte: yesterdayMinus1h,
          $lt: yesterday
        },
        status: 'approved',
        followUpSent: { $ne: true }
      }).limit(maxBatch);

      for (const booking of completedBookings) {
        await sendFollowUpSurvey(booking);
        
        // Marcar como enviado
        booking.followUpSent = true;
        await booking.save();
        
        await sleep(Math.max(emailThrottleMs, 2000));
      }

      console.log('✅ Seguimiento post-sesión completado');
    } catch (error) {
      console.error('❌ Error en seguimiento post-sesión:', error.message);
    }
  });
};

/**
 * 📊 Recordatorio de actualización de métricas (48h post-sesión)
 * Se ejecuta cada 6 horas
 */
const scheduleHealthMetricsReminder = () => {
  return scheduleTask('0 */6 * * *', 'Recordatorio de métricas (48h)', async () => {
    try {
      console.log('🔄 Enviando recordatorios de métricas de salud...');

      const { maxBatch, emailThrottleMs } = getAutomationConfig();

      const now = new Date();
      const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      const twoDaysAgoPlus6h = new Date(now.getTime() - 42 * 60 * 60 * 1000);

      // Buscar sesiones completadas hace 48h sin actualización de métricas
      const bookingsForMetrics = await Booking.find({
        appointmentDate: {
          $gte: twoDaysAgo,
          $lt: twoDaysAgoPlus6h
        },
        status: 'approved',
        metricsReminderSent: { $ne: true }
      }).limit(maxBatch);

      console.log(`📊 ${bookingsForMetrics.length} pacientes requieren actualizar métricas`);

      for (const booking of bookingsForMetrics) {
        await sendHealthMetricsReminder(booking);
        
        booking.metricsReminderSent = true;
        await booking.save();
        
        await sleep(Math.max(emailThrottleMs, 2000));
      }

      console.log('✅ Recordatorios de métricas enviados');
    } catch (error) {
      console.error('❌ Error enviando recordatorios de métricas:', error.message);
    }
  });
};

/**
 * 📧 Recordatorio de próxima sesión recomendada (7 días sin citas)
 * Se ejecuta diariamente a las 10 AM
 */
const scheduleNextAppointmentReminder = () => {
  return scheduleTask('0 10 * * *', 'Recordatorio próxima cita (7+ días)', async () => {
    try {
      console.log('🔄 Enviando recordatorios de próxima cita...');

      const { maxBatch, emailThrottleMs } = getAutomationConfig();

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      // Buscar pacientes con última cita hace más de 7 días y sin próximas citas
      const inactiveBookings = await Booking.aggregate([
        { $match: { status: 'approved', appointmentDate: { $lte: sevenDaysAgo } } },
        { $sort: { appointmentDate: -1 } },
        { $group: { _id: '$user', lastBooking: { $first: '$$ROOT' } } },
        { $limit: maxBatch }
      ]);

      let remindersSent = 0;

      for (const item of inactiveBookings) {
        const patient = await User.findById(item._id);
        if (!patient?.email) continue;

        // Verificar que no tenga citas futuras
        const futureBookings = await Booking.countDocuments({
          user: item._id,
          appointmentDate: { $gt: new Date() },
          status: { $in: ['approved', 'pending'] }
        });

        if (futureBookings > 0) continue;

        const bookLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/doctors`;

        await sendEmail({
          email: patient.email,
          subject: '🌟 ¿Cómo has estado? Es hora de tu próxima sesión',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0066ff;">¡Te extrañamos! 💙</h2>
              <p>Hola <strong>${patient.name}</strong>,</p>
              
              <p>Ha pasado una semana desde tu última sesión. El seguimiento continuo es clave 
              para mantener tu bienestar emocional y consolidar los avances que has logrado.</p>

              <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>💡 Beneficios del seguimiento regular:</strong></p>
                <ul style="margin: 10px 0;">
                  <li>Mantiene la continuidad del tratamiento</li>
                  <li>Previene recaídas</li>
                  <li>Refuerza las herramientas aprendidas</li>
                  <li>Ajusta el plan según tu progreso</li>
                </ul>
              </div>

              <p style="text-align: center; margin: 30px 0;">
                <a href="${bookLink}" 
                   style="background-color: #0066ff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  📅 Agendar mi Próxima Sesión
                </a>
              </p>

              <p style="color: #666; font-size: 14px;">
                Si tienes dudas o necesitas ajustar tu plan de tratamiento, no dudes en contactarnos.
              </p>

              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              <p style="color: #999; font-size: 12px;">
                Este es un recordatorio amistoso de Psiconepsis para apoyar tu bienestar.
              </p>
            </div>
          `
        });

        remindersSent++;
        await sleep(Math.max(emailThrottleMs, 3000));
      }

      console.log(`✅ ${remindersSent} recordatorios de próxima cita enviados`);
    } catch (error) {
      console.error('❌ Error enviando recordatorios de próxima cita:', error.message);
    }
  });
};

/**
 * 🚀 Iniciar servicio de seguimiento post-sesión
 */
export const startFollowUpService = () => {
  const { enabled } = getAutomationConfig();

  if (!enabled) {
    return {};
  }
  
  const followUpJob = schedulePostSessionFollowUp();
  const metricsJob = scheduleHealthMetricsReminder();
  const nextApptJob = scheduleNextAppointmentReminder();

  return { followUpJob, metricsJob, nextApptJob };
};

export default { startFollowUpService };
