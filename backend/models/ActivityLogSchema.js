// backend/models/ActivityLogSchema.js
import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'PsychologicalPatient' },
  action: { type: String, required: true },
  meta: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

ActivityLogSchema.index({ actor: 1, createdAt: -1 });

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);
