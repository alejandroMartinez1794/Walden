// backend/models/ClinicalSuggestionLogSchema.js
import mongoose from 'mongoose';

const ClinicalSuggestionLogSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'PsychologicalPatient', required: true },
  clinician: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  summary: mongoose.Schema.Types.Mixed, // { formulation, targets, suggestions, flags, rulesApplied }
  accepted: { type: Boolean, default: false },
  clinicianNotes: String,
}, { timestamps: true });

ClinicalSuggestionLogSchema.index({ patient: 1, clinician: 1, createdAt: -1 });

export default mongoose.models.ClinicalSuggestionLog || mongoose.model('ClinicalSuggestionLog', ClinicalSuggestionLogSchema);
