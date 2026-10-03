// backend/models/MeasureSchema.js
import mongoose from 'mongoose';

const MeasureSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'PsychologicalPatient', required: true },
  clinician: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  name: { type: String, enum: ['PHQ-9', 'GAD-7', 'BDI-II', 'BAI', 'PHQ-2', 'AUDIT', 'C-SSRS', 'OTHER'], required: true },
  responses: [mongoose.Schema.Types.Mixed], // números o {itemNumber, response}
  score: { type: Number, required: true },
  itemMap: mongoose.Schema.Types.Mixed,
  // Provenance: links a normalized longitudinal measure to its source assessment.
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'PsychologicalAssessment', index: true },
  // Optional during migration; historical measures must not receive fabricated plans.
  treatmentPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'TreatmentPlan', index: true },
  takenAt: { type: Date, default: Date.now },
}, { timestamps: true });

MeasureSchema.index({ patient: 1, name: 1, takenAt: -1 });

export default mongoose.models.Measure || mongoose.model('Measure', MeasureSchema);
