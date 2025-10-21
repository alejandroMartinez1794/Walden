// backend/Controllers/bookingController.js
import Booking from '../models/BookingSchema.js';
import { createCalendarEvent, deleteCalendarEvent } from './calendarController.js';

/**
 * 📅 Crear nueva cita médica
 */
export const createBooking = async (req, res) => {
  try {
    const { doctorId, date, time, motivoConsulta } = req.body;
    const userId = req.user.id;

    // 1. 🕒 Construir rangos de hora para el evento
    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000); // 30 min

    // 2. 🗓️ Crear evento en Google Calendar
    const calendarReq = {
      body: {
        userId,
        summary: 'Cita médica',
        description: `Consulta médica con el doctor ID: ${doctorId}. Motivo: ${motivoConsulta}`,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      },
    };

    // Creamos un mock de `res` para capturar el resultado
    let calendarEventId = null;
    const calendarRes = {
      status: (code) => ({
        json: (data) => {
          if (data.eventId) {
            calendarEventId = data.eventId;
          }
          return { status: code, ...data };
        },
      }),
    };

    await createCalendarEvent(calendarReq, calendarRes);

    // 3. 📝 Crear la cita en MongoDB incluyendo el ID del evento
    const nuevaCita = await Booking.create({
      user: userId,
      doctor: doctorId,
      appointmentDate: startDateTime,
      reason: motivoConsulta,
      calendarEventId, // <- Guardamos el ID del evento
    });

    // 4. ✅ Enviar respuesta
    res.status(201).json({
      message: '✅ Cita creada exitosamente',
      cita: nuevaCita,
      googleCalendarEventId: calendarEventId,
    });

  } catch (error) {
    console.error('❌ Error al crear cita:', error);
    res.status(500).json({ error: 'Error al crear la cita' });
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
