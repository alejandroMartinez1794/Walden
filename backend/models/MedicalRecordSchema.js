import mongoose from 'mongoose';

const AttachmentSchema = new mongoose.Schema(
  {
    url: String,
    name: String,
    type: String,
  },
  { _id: false }
);

const MedicalRecordSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['consultation', 'lab', 'prescription', 'other'], required: true },
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    attachments: [AttachmentSchema],
  },
  { timestamps: true }
);

export default mongoose.models.MedicalRecord || mongoose.model('MedicalRecord', MedicalRecordSchema);
