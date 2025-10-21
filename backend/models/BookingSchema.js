// backend/Models/BookingSchema.js
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointmentDate: { type: Date, required: true },
  reason: { type: String },
  calendarEventId: { type: String }, // Google Calendar ID
}, { timestamps: true });

// ✅ Previene OverwriteModelError cuando se recarga el backend
export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
