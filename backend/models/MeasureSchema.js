// backend/models/MeasureSchema.js
import mongoose from 'mongoose';

const MeasureSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'PsychologicalPatient', required: true },
  clinician: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  name: { type: String, enum: ['PHQ-9', 'GAD-7', 'BDI-II', 'OTHER'], required: true },
  responses: [mongoose.Schema.Types.Mixed], // números o {itemNumber, response}
  score: { type: Number, required: true },
  itemMap: mongoose.Schema.Types.Mixed,
  takenAt: { type: Date, default: Date.now },
}, { timestamps: true });

MeasureSchema.index({ patient: 1, name: 1, takenAt: -1 });

export default mongoose.models.Measure || mongoose.model('Measure', MeasureSchema);
