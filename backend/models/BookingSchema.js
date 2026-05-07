// backend/Models/BookingSchema.js
import mongoose from 'mongoose';
import { encryptClinicalData, decryptClinicalData } from '../utils/clinicalCrypto.js';

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

const PHI_FIELDS = ['reason', 'meetLink'];

const processPhiFields = (target, processor) => {
  if (!target) return;

  PHI_FIELDS.forEach((field) => {
    const value = target[field];
    if (typeof value !== 'string' || !value) return;

    const isEncryptedFormat = value.includes(':') && value.length > 32;
    if (processor === encryptClinicalData && !isEncryptedFormat) {
      target[field] = processor(value);
    }

    if (processor === decryptClinicalData && isEncryptedFormat) {
      target[field] = processor(value);
    }
  });
};

bookingSchema.pre('save', function (next) {
  processPhiFields(this, encryptClinicalData);
  next();
});

bookingSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update?.$set) {
    processPhiFields(update.$set, encryptClinicalData);
  }
  next();
});

bookingSchema.post(['find', 'findOne', 'findOneAndUpdate'], function (docs) {
  if (!docs) return;

  const docList = Array.isArray(docs) ? docs : [docs];
  docList.forEach((doc) => processPhiFields(doc, decryptClinicalData));
});

// ✅ Previene OverwriteModelError cuando se recarga el backend
export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
