import mongoose from 'mongoose';

const measureResponseSchema = new mongoose.Schema({
  itemNumber: { type: Number, min: 1 },
  question: String,
  response: mongoose.Schema.Types.Mixed,
  score: { type: Number, min: 0, max: 100 },
}, { _id: false });

const MeasureSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PsychologicalPatient',
    required: true,
    index: true,
  },
  clinician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
    index: true,
  },

  // Provenance. Optional while historical data is migrated; new writers
  // should provide assessmentId whenever the measure comes from an assessment.
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PsychologicalAssessment',
    index: true,
  },
  therapySessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TherapySession',
    index: true,
  },
  treatmentPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TreatmentPlan',
    index: true,
  },

  name: {
    type: String,
    enum: [
      'PHQ-9',
      'GAD-7',
      'BDI-II',
      'BAI',
      'PCL-5',
      'OCI-R',
      'YBOCS',
      'AUDIT',
      'PSS',
      'K6',
      'K10',
      'WHO-5',
      'PHQ-15',
      'PC-PTSD-5',
      'OTHER',
    ],
    required: true,
  },

  responses: {
    type: [measureResponseSchema],
    required: true,
    validate: {
      validator: (value) => Array.isArray(value) && value.length > 0,
      message: 'A measure must contain at least one response',
    },
  },

  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },

  scoreSource: {
    type: String,
    enum: ['server', 'submitted'],
    default: 'server',
  },

  itemMap: mongoose.Schema.Types.Mixed,

  takenAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, { timestamps: true });

MeasureSchema.index({ patient: 1, name: 1, takenAt: -1 });
MeasureSchema.index({ treatmentPlanId: 1, name: 1, takenAt: -1 });

export default mongoose.models.Measure || mongoose.model('Measure', MeasureSchema);
