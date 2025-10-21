import mongoose from 'mongoose';

const HealthMetricSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    bloodPressure: {
      systolic: { type: Number },
      diastolic: { type: Number },
    },
    heartRate: { type: Number },
    temperature: { type: Number },
    weight: { type: Number },
    bmi: { type: Number },
    glucose: { type: Number },
    oxygen: { type: Number },
    steps: { type: Number },
    water: { type: Number },
    sleep: { type: Number },
    calories: { type: Number },
    exercise: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.models.HealthMetric || mongoose.model('HealthMetric', HealthMetricSchema);
