import mongoose from 'mongoose';

const MedicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    prescribedBy: { type: String },
    instructions: { type: String },
    remainingDoses: { type: Number, default: 0 },
    totalDoses: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'completed', 'stopped'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.models.Medication || mongoose.model('Medication', MedicationSchema);
