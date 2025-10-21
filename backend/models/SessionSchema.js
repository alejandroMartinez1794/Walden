// backend/models/SessionSchema.js
import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'PsychologicalPatient', required: true },
  clinician: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: Date, default: Date.now },
  duration: { type: Number, default: 50 },
  calendarEventId: String,
  measures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Measure' }],
  notes: {
    agenda: String,
    homeworkReview: String,
    interventionsUsed: [String],
    tcc: {
      automaticThoughts: [
        { situation: String, thought: String, emotion: String, intensity: Number, distortion: String, altThought: String, postIntensity: Number }
      ],
      exposure: { hierarchy: [String], stepsDone: String },
      behavioralActivation: { activities: [String] },
    },
    soap: { subjective: String, objective: String, assessment: String, plan: String },
  },
}, { timestamps: true });

SessionSchema.index({ patient: 1, clinician: 1, date: -1 });

export default mongoose.models.Session || mongoose.model('Session', SessionSchema);
