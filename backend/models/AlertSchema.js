// backend/models/AlertSchema.js
import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'PsychologicalPatient', required: true },
  clinician: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  type: { type: String, enum: ['suicide_risk', 'high_depression', 'worsening_trend', 'other'], required: true },
  severity: { type: String, enum: ['low', 'moderate', 'high', 'critical'], default: 'moderate' },
  relatedMeasureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Measure' },
  mitigation: {
    emergencyContact: String,
    safetyPlan: String,
    urgentAppointment: { type: Boolean, default: false },
    scheduledAt: Date,
  },
  resolved: { type: Boolean, default: false },
  resolvedAt: Date,
  notes: String,
}, { timestamps: true });

AlertSchema.index({ patient: 1, clinician: 1, createdAt: -1 });

export default mongoose.models.Alert || mongoose.model('Alert', AlertSchema);
