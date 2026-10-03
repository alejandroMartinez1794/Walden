// backend/models/MeasureSchema.js
import mongoose from 'mongoose';

const MeasureSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'PsychologicalPatient', required: true },
  clinician: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  // Provenance link to the instrument administration that produced this longitudinal measure.
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'PsychologicalAssessment', index: true },
  name: { type: String, enum: ['BDI-II', 'BAI', 'PHQ-9', 'GAD-7', 'PHQ-15', 'WHO-5', 'PC-PTSD-5', 'K10', 'K6', 'PCL-5', 'OCI-R', 'YBOCS', 'AUDIT', 'PSS', 'OTHER'], required: true },
  responses: [mongoose.Schema.Types.Mixed], // números o {itemNumber, response}
  score: { type: Number, required: true },
  itemMap: mongoose.Schema.Types.Mixed,
  takenAt: { type: Date, default: Date.now },
}, { timestamps: true });

MeasureSchema.index({ patient: 1, name: 1, takenAt: -1 });
MeasureSchema.index({ assessmentId: 1, takenAt: -1 });
MeasureSchema.index(
  { assessmentId: 1 },
  { unique: true, sparse: true, name: 'measure_unique_assessment_provenance' }
);

export default mongoose.models.Measure || mongoose.model('Measure', MeasureSchema);
