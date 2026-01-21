// backend/Models/BookingSchema.js
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointmentDate: { type: Date, required: true },
  reason: { type: String },
  calendarEventId: { type: String }, // Google Calendar ID
  status: { type: String, enum: ['pending', 'approved', 'cancelled', 'completed'], default: 'approved' },
  durationMinutes: { type: Number, default: 30 },
  ticketPrice: { type: Number },
  meetLink: { type: String },
  
  // Campos de automatización
  reminderSent24h: { type: Boolean, default: false },
  reminderSent1h: { type: Boolean, default: false },
  followUpSent: { type: Boolean, default: false },
  metricsReminderSent: { type: Boolean, default: false },
}, { timestamps: true });

bookingSchema.index({ appointmentDate: 1, status: 1 });
bookingSchema.index({ reminderSent24h: 1, appointmentDate: 1 });
bookingSchema.index({ reminderSent1h: 1, appointmentDate: 1 });
bookingSchema.index({ followUpSent: 1, appointmentDate: 1 });
bookingSchema.index({ metricsReminderSent: 1, appointmentDate: 1 });

// ✅ Previene OverwriteModelError cuando se recarga el backend
export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
